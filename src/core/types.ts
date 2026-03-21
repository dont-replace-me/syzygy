// === 입력 ===
export interface BirthData {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number; // 0-59
  latitude: number;
  longitude: number;
  timezone: string; // IANA timezone (예: "Asia/Seoul")
  placeName?: string;
}

// === 차트 출력 ===
export interface NatalChart {
  houseSystem: "placidus" | "whole-sign";
  planets: PlanetPosition[];
  houses: HouseCusp[];
  angles: AnglePosition[];
  aspects: Aspect[];
  virtualPoints?: VirtualPointPosition[];
  planetAspects?: DisplayAspect[];
  otherAspects?: DisplayAspect[];
  extended?: {
    points: ExtendedPointPosition[];
    angles: ExtendedAnglePosition[];
    aspects: ExtendedAspect[];
  };
}

export interface PlanetPosition {
  planet: Planet;
  sign: ZodiacSign;
  degree: number; // 0-359.99 (절대 황경)
  signDegree: number; // 0-29.99 (사인 내 도수)
  house: number; // 1-12
  retrograde: boolean;
  speed?: number; // degree/day
}

export interface HouseCusp {
  house: number; // 1-12
  sign: ZodiacSign;
  degree: number;
}

export interface AnglePosition {
  angle: AngleType;
  sign: ZodiacSign;
  degree: number;
}

export interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  orb: number;
  exact: boolean; // orb < 1°
}

export interface ExtendedPointPosition {
  key: string;
  label: string;
  sign: ZodiacSign;
  degree: number;
  signDegree: number;
  house: number;
}

export interface ExtendedAnglePosition {
  key: string;
  label: string;
  sign: ZodiacSign;
  degree: number;
}

export interface ExtendedAspect {
  point1Key: string;
  point1Label: string;
  point2Key: string;
  point2Label: string;
  aspectKey: string;
  aspectLabel: string;
  orb: number;
  level: string;
}

export interface VirtualPointPosition {
  key: "fortune" | "vertex";
  label: string;
  sign: ZodiacSign;
  degree: number;
  signDegree: number;
  house: number;
}

export interface AspectPoint {
  key: string;
  label: string;
  degree: number;
  speed?: number; // degree/day
}

export interface DisplayAspect {
  point1Key: string;
  point1Label: string;
  point2Key: string;
  point2Label: string;
  type: AspectType;
  orb: number;
  exact: boolean;
  applyingState: "Applying" | "Separating";
}

// === 룰북 매칭 결과 (확장용) ===
export interface Reading {
  keyword: string;
  description: string;
}

export interface AnalysisResult {
  planetSignReadings: (Reading | null)[];
  planetHouseReadings: (Reading | null)[];
  aspectReadings: (Reading | null)[];
}

export interface NatalResult {
  charts: {
    placidus: NatalChart;
    wholeSign: NatalChart;
  };
  readings?: {
    placidus: AnalysisResult;
    wholeSign: AnalysisResult;
  };
}

// === Geocoding ===
export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

// === 열거형 ===
export type Planet =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto"
  | "NorthNode"
  | "Chiron";

export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type AspectType =
  | "Conjunction"
  | "SemiSextile"
  | "Sextile"
  | "SemiSquare"
  | "Quintile"
  | "Square"
  | "Trine"
  | "Sesquiquadrate"
  | "BiQuintile"
  | "Quincunx"
  | "Opposition";

export type AngleType = "ASC" | "MC" | "DSC" | "IC";
