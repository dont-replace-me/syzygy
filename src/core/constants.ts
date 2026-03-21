import type { Planet, ZodiacSign, AspectType } from "./types";

export const PLANETS: Planet[] = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  "NorthNode", "Chiron",
];

export const ZODIAC_SIGNS: ZodiacSign[] = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const PLANET_KO: Record<Planet, string> = {
  Sun: "태양", Moon: "달", Mercury: "수성", Venus: "금성",
  Mars: "화성", Jupiter: "목성", Saturn: "토성", Uranus: "천왕성",
  Neptune: "해왕성", Pluto: "명왕성", NorthNode: "북교점", Chiron: "카이론",
};

export const SIGN_KO: Record<ZodiacSign, string> = {
  Aries: "양자리", Taurus: "황소자리", Gemini: "쌍둥이자리", Cancer: "게자리",
  Leo: "사자자리", Virgo: "처녀자리", Libra: "천칭자리", Scorpio: "전갈자리",
  Sagittarius: "사수자리", Capricorn: "염소자리", Aquarius: "물병자리", Pisces: "물고기자리",
};

export const PLANET_SYMBOL: Record<Planet, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀",
  Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅",
  Neptune: "♆", Pluto: "⯓", NorthNode: "☊", Chiron: "⚷",
};

export const SIGN_SYMBOL: Record<ZodiacSign, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

// Aspect 정의
export interface AspectDefinition {
  type: AspectType;
  angle: number;
  maxOrb: number;
  nature: "harmony" | "tension" | "neutral";
}

export const ASPECT_DEFINITIONS: AspectDefinition[] = [
  { type: "Conjunction", angle: 0, maxOrb: 8, nature: "neutral" },
  { type: "SemiSextile", angle: 30, maxOrb: 3, nature: "harmony" },
  { type: "SemiSquare", angle: 45, maxOrb: 3, nature: "tension" },
  { type: "Sextile", angle: 60, maxOrb: 6, nature: "harmony" },
  { type: "Quintile", angle: 72, maxOrb: 2, nature: "harmony" },
  { type: "Square", angle: 90, maxOrb: 8, nature: "tension" },
  { type: "Trine", angle: 120, maxOrb: 8, nature: "harmony" },
  { type: "Sesquiquadrate", angle: 135, maxOrb: 3, nature: "tension" },
  { type: "BiQuintile", angle: 144, maxOrb: 2, nature: "harmony" },
  { type: "Quincunx", angle: 150, maxOrb: 3, nature: "neutral" },
  { type: "Opposition", angle: 180, maxOrb: 8, nature: "tension" },
];

export const ASPECT_KO: Record<AspectType, string> = {
  Conjunction: "합", SemiSextile: "반육분", Sextile: "육분",
  SemiSquare: "반스퀘어", Quintile: "퀸타일", Square: "스퀘어",
  Trine: "트라인", Sesquiquadrate: "세스키스퀘어", BiQuintile: "바이퀸타일",
  Quincunx: "퀸컨스", Opposition: "충",
};

export const ASPECT_SYMBOL: Record<AspectType, string> = {
  Conjunction: "☌", SemiSextile: "⚺", Sextile: "⚹",
  SemiSquare: "∠", Quintile: "Q", Square: "□",
  Trine: "△", Sesquiquadrate: "⚼", BiQuintile: "bQ",
  Quincunx: "⚻", Opposition: "☍",
};

export const SIGN_ELEMENT: Record<ZodiacSign, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

export const HOUSE_KO: Record<number, string> = {
  1: "자아의 집", 2: "소유의 집", 3: "소통의 집", 4: "뿌리의 집",
  5: "창조의 집", 6: "봉사의 집", 7: "관계의 집", 8: "변환의 집",
  9: "탐구의 집", 10: "성취의 집", 11: "희망의 집", 12: "무의식의 집",
};
