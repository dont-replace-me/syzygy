# requirements.md

# 🗺️ syzygy MVP Requirements
Version: Natal v1

---

## 1. 프로젝트 개요

### 서비스명
**syzygy**

### 서비스 정의
이 서비스의 본질은 **점성술을 표방한 멘탈 웰니스(Mental Wellness) 카운슬링 서비스**입니다.  
사용자의 **생년월일, 출생 시각, 출생 장소**를 기반으로 천문/점성술 데이터를 계산하고,  
이를 바탕으로 **Natal 2개 차트(Placidus / Whole Sign)** 를 생성하여 비교 가능한 구조를 만드는 것이 이번 구현의 핵심입니다.

이번 단계에서는 디자인보다 **입력 → 장소 좌표 변환 → 차트 2개 생성 → 주요 행성/하우스/앵글/각도 추출 → 특정 각도 필터링 → 결과 저장**까지의 데이터 파이프라인을 우선 구현합니다.

---

## 2. 이번 구현 목표

이번 구현의 목적은 아래와 같습니다.

1. 사용자의 입력값으로 **Natal 차트 2종**을 생성할 수 있어야 함
2. **Placidus / Whole Sign** 두 하우스 시스템 결과를 각각 분리하여 볼 수 있어야 함
3. 각 차트에서 **행성 위치 / 하우스 / 앵글 / 각도(aspect)** 데이터를 추출할 수 있어야 함
4. 모든 각도 중에서 **특정 조건(0/60/90/120/180 ± orb)** 에 해당하는 것만 필터링할 수 있어야 함
5. 외부 API 결과 및 계산 결과를 **매번 api_result에 누적 저장**할 수 있어야 함
6. 한국어/영어 UI 토글이 가능해야 함
7. 화면은 **디자인 없이 흰 배경의 단순한 검증용 화면**이면 충분함

---

## 3. 이번 구현 범위

## 3.1 입력값
사용자는 아래 값을 입력할 수 있어야 합니다.

- 이름 (옵션)
- 생년월일
- 출생 시간
  - 시(hour)
  - 분(minute)
- 출생 장소
  - 자유 텍스트 입력
  - 예: `Goreme, Turkey`, `Seoul, South Korea`, `Busan, South Korea`

---

## 3.2 출생 장소 → 위도/경도 변환
출생 장소는 문자열로 입력받고, 아래 Nominatim API 기반으로 후보를 검색합니다.

예시:
`https://nominatim.openstreetmap.org/search?q=Goreme,%20Turkey&format=json&addressdetails=1&limit=5`

### 요구사항
- 사용자가 입력한 장소 문자열을 query로 전달
- `format=json`
- `addressdetails=1`
- `limit=5`
- 결과가 여러 개면 후보 리스트를 보여줌
- 사용자가 후보 중 1개를 선택하면 그 결과의 `lat`, `lon`을 사용
- 국가/지역/도시가 중복될 수 있으므로 반드시 후보 선택 단계를 둠

### 장소 선택 플로우
1. 사용자가 장소 입력
2. Nominatim API 호출
3. 후보 결과 반환
4. 후보 리스트 표시
5. 사용자가 1개 선택
6. 선택된 결과의 `lat`, `lon` 확정
7. 해당 raw 응답과 선택 결과를 `api_result`에 저장

---

## 3.3 Natal 차트 2개 생성
이번 단계에서는 **출생 차트(Natal)** 만 구현합니다.

### 생성 대상
- **Natal (Placidus)**
- **Natal (Whole Sign)**

### 목표
동일한 출생 정보에 대해 **하우스 시스템만 다르게 적용한 2개 차트**를 생성하고,  
두 차트의 결과를 나란히 비교할 수 있어야 합니다.

---

## 4. 데이터 엔진

## 4.1 사용 모듈
- Source: `https://github.com/drvinaayaksingh/swisseph`
- Package: `swisseph-v2`

## 4.2 역할
이 모듈을 사용해 다음 계산을 수행합니다.

- UTC / Julian Day 변환
- 행성 위치 계산
- 하우스 시스템 계산
- 앵글 계산
- aspect 계산에 필요한 longitude 기반 원천 데이터 확보

---

## 5. Natal 차트에서 추출해야 하는 데이터

이번 구현에서는 결과 형식을 반드시 특정 텍스트 포맷으로 맞출 필요는 없지만,  
최소한 아래 정보들은 구조화된 데이터로 추출되어야 합니다.

## 5.1 행성 및 포인트 위치
각 차트(Placidus / Whole Sign)마다 아래 항목들의 위치 정보를 추출해야 합니다.

### 필수 대상
- Sun
- Moon
- Mercury
- Venus
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune
- Pluto
- North Node
- Lilith
- Chiron
- Fortune
- Vertex

### 각 항목별 최소 필드
- `name`
- `sign`
- `degree`
- `minute`
- `absoluteLongitude`
- `house`
- `retrograde` 여부
- raw 계산값

예시 구조:

```json
{
  "name": "Sun",
  "sign": "Capricorn",
  "degree": 24,
  "minute": 30,
  "absoluteLongitude": 294.5,
  "house": 10,
  "retrograde": false,
  "raw": {}
}## 5.2 앵글(Angles)

각 차트마다 아래 앵글 정보를 추출해야 합니다.

- ASC
- DSC
- MC
- IC

### 각 앵글별 최소 필드

- `name`
- `sign`
- `degree`
- `minute`
- `absoluteLongitude`

---

## 5.3 하우스 정보

각 차트마다 1~12하우스 cusp 정보를 추출해야 합니다.

### 필수 필드

- `houseNumber`
- `sign`
- `degree`
- `minute`
- `absoluteLongitude`

### 주의사항

- **Placidus**
  - 하우스 cusp가 실제 계산값을 가짐
- **Whole Sign**
  - ASC 기준 별자리 단위로 1~12하우스 구성
- 두 차트 모두 동일한 JSON 구조로 정규화 필요

---

## 6. Aspect 계산 요구사항

## 6.1 기본 원칙

행성/포인트 간 각도를 계산하고,  
특정 각도 조건에 해당하는 것만 필터링해야 합니다.

---

## 6.2 필터링 대상 Aspect

- Conjunction = 0°
- Sextile = 60°
- Square = 90°
- Trine = 120°
- Opposition = 180°

---

## 6.3 Orb 규칙

기본 Orb:

- 0° ± 5°
- 60° ± 5°
- 90° ± 5°
- 120° ± 5°
- 180° ± 5°


9. 다국어
한국어 / English toggle
모든 UI 텍스트 전환
10. UI
흰 배경
최소 UI
기능 중심
11. 핵심 기능
입력
날짜
시간
장소
처리
좌표 변환
차트 생성 (2개)
aspect 계산
필터링
출력
chart 2개
filtered aspect
raw data

API_result 저장하기