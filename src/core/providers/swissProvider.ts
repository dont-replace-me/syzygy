import { createRequire } from "node:module";
import type {
  BirthData,
  PlanetPosition,
  HouseCusp,
  AnglePosition,
  ExtendedPointPosition,
  ExtendedAnglePosition,
  ExtendedAspect,
  Planet,
  ZodiacSign,
} from "@/core/types";
import type { ChartEngineProvider, EngineChartData } from "@/core/providers/types";

const SIGN_KEYS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

const SIGN_MAP: Record<typeof SIGN_KEYS[number], ZodiacSign> = {
  aries: "Aries",
  taurus: "Taurus",
  gemini: "Gemini",
  cancer: "Cancer",
  leo: "Leo",
  virgo: "Virgo",
  libra: "Libra",
  scorpio: "Scorpio",
  sagittarius: "Sagittarius",
  capricorn: "Capricorn",
  aquarius: "Aquarius",
  pisces: "Pisces",
};

function getPlanetNumbers(swisseph: SwissLib): Array<{ id: number; planet: Planet }> {
  return [
    { id: swisseph.SE_SUN, planet: "Sun" },
    { id: swisseph.SE_MOON, planet: "Moon" },
    { id: swisseph.SE_MERCURY, planet: "Mercury" },
    { id: swisseph.SE_VENUS, planet: "Venus" },
    { id: swisseph.SE_MARS, planet: "Mars" },
    { id: swisseph.SE_JUPITER, planet: "Jupiter" },
    { id: swisseph.SE_SATURN, planet: "Saturn" },
    { id: swisseph.SE_URANUS, planet: "Uranus" },
    { id: swisseph.SE_NEPTUNE, planet: "Neptune" },
    { id: swisseph.SE_PLUTO, planet: "Pluto" },
    { id: swisseph.SE_CHIRON, planet: "Chiron" },
  ];
}

type HouseSystemType = "placidus" | "whole-sign";

type SwissLib = typeof import("swisseph-v2");

let swissLib: SwissLib | null = null;
function getSwiss(): SwissLib {
  if (swissLib) return swissLib;
  // Avoid static import so Turbopack doesn't try to bundle native binary.
  const req = createRequire(import.meta.url);
  swissLib = req("swisseph-v2") as SwissLib;
  return swissLib;
}

function normalizeDegree(degree: number): number {
  const normalized = degree % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function getSignFromDegree(degree: number): ZodiacSign {
  const index = Math.floor(normalizeDegree(degree) / 30) % 12;
  return SIGN_MAP[SIGN_KEYS[index]];
}

function findHouseForDegree(degree: number, houses: HouseCusp[]): number {
  const d = normalizeDegree(degree);
  for (let i = 0; i < houses.length; i++) {
    const start = normalizeDegree(houses[i].degree);
    const end = normalizeDegree(houses[(i + 1) % houses.length].degree);

    if (start < end) {
      if (d >= start && d < end) return houses[i].house;
    } else if (d >= start || d < end) {
      return houses[i].house;
    }
  }
  return 1;
}

function assertNoError<T>(value: T): T {
  const maybeError = (value as { error?: string }).error;
  if (maybeError) {
    throw new Error(maybeError);
  }
  return value;
}

function getTimezoneOffsetMinutes(timeZone: string, utcDate: Date): number {
  if (!(utcDate instanceof Date) || Number.isNaN(utcDate.getTime())) {
    throw new Error("Invalid birth date/time");
  }
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(utcDate);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return (asUtc - utcDate.getTime()) / 60000;
}

function resolveTimeZone(input?: string): string {
  if (!input) return "Asia/Seoul";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: input });
    return input;
  } catch {
    return "Asia/Seoul";
  }
}

function localDateTimeToUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    throw new Error("Invalid birth date/time");
  }
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Invalid birth date/time");
  }
  const localMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  if (!Number.isFinite(localMs)) {
    throw new Error("Invalid birth date/time");
  }
  let utcMs = localMs;

  for (let i = 0; i < 3; i++) {
    const offset = getTimezoneOffsetMinutes(timeZone, new Date(utcMs));
    utcMs = localMs - offset * 60000;
  }

  return new Date(utcMs);
}

function getHouseCode(houseSystem: HouseSystemType): string {
  return houseSystem === "whole-sign" ? "W" : "P";
}

function getFlags(swisseph: SwissLib) {
  return swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED;
}

function setupEphemerisPath() {
  const swisseph = getSwiss();
  const fallback = `${process.cwd()}/node_modules/swisseph-v2/ephe`;
  const ephePath = process.env.SWISS_EPHE_PATH ?? fallback;
  swisseph.swe_set_ephe_path(ephePath);
}

export class SwissEngineProvider implements ChartEngineProvider {
  readonly id = "swiss" as const;

  createChart(
    birth: BirthData,
    houseSystem: HouseSystemType
  ): EngineChartData {
    const swisseph = getSwiss();
    setupEphemerisPath();

    const timeZone = resolveTimeZone(birth.timezone);
    const utcDate = localDateTimeToUtcDate(
      birth.year,
      birth.month,
      birth.day,
      birth.hour,
      birth.minute,
      timeZone
    );

    const jd = assertNoError(
      swisseph.swe_utc_to_jd(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth() + 1,
        utcDate.getUTCDate(),
        utcDate.getUTCHours(),
        utcDate.getUTCMinutes(),
        utcDate.getUTCSeconds(),
        swisseph.SE_GREG_CAL
      )
    ) as { julianDayET: number; julianDayUT: number };
    const jdUt = jd.julianDayUT;

    const houseData = assertNoError(
      swisseph.swe_houses(
        jdUt,
        birth.latitude,
        birth.longitude,
        getHouseCode(houseSystem)
      )
    ) as {
      house: number[];
      ascendant: number;
      mc: number;
      armc: number;
      vertex: number;
    };

    const houses: HouseCusp[] = houseData.house.slice(0, 12).map((deg, idx) => ({
      house: idx + 1,
      sign: getSignFromDegree(deg),
      degree: normalizeDegree(deg),
    }));

    const asc = normalizeDegree(houseData.ascendant);
    const mc = normalizeDegree(houseData.mc);
    const dsc = normalizeDegree(asc + 180);
    const ic = normalizeDegree(mc + 180);

    const angles: AnglePosition[] = [
      { angle: "ASC", sign: getSignFromDegree(asc), degree: asc },
      { angle: "DSC", sign: getSignFromDegree(dsc), degree: dsc },
      { angle: "MC", sign: getSignFromDegree(mc), degree: mc },
      { angle: "IC", sign: getSignFromDegree(ic), degree: ic },
    ];

    const pointSpeeds: Record<string, number> = {};
    const planets: PlanetPosition[] = getPlanetNumbers(swisseph).map(
      ({ id, planet }) => {
        const pos = assertNoError(
          swisseph.swe_calc_ut(jdUt, id, getFlags(swisseph))
        ) as { longitude: number; longitudeSpeed: number };
        const degree = normalizeDegree(pos.longitude);
        const speed = +pos.longitudeSpeed.toFixed(8);
        pointSpeeds[planet.toLowerCase()] = speed;
        return {
          planet,
          sign: getSignFromDegree(degree),
          degree,
          signDegree: +(degree % 30).toFixed(4),
          house: findHouseForDegree(degree, houses),
          retrograde: pos.longitudeSpeed < 0,
          speed,
        };
      }
    );

    const northNodePos = assertNoError(
      swisseph.swe_calc_ut(jdUt, swisseph.SE_MEAN_NODE, getFlags(swisseph))
    ) as { longitude: number; longitudeSpeed: number };
    const northNodeDegree = normalizeDegree(northNodePos.longitude);
    planets.push({
      planet: "NorthNode",
      sign: getSignFromDegree(northNodeDegree),
      degree: northNodeDegree,
      signDegree: +(northNodeDegree % 30).toFixed(4),
      house: findHouseForDegree(northNodeDegree, houses),
      retrograde: northNodePos.longitudeSpeed < 0,
      speed: +northNodePos.longitudeSpeed.toFixed(8),
    });
    pointSpeeds.northnode = +northNodePos.longitudeSpeed.toFixed(8);

    const southNodeDegree = normalizeDegree(northNodeDegree + 180);
    const lilithPos = assertNoError(
      swisseph.swe_calc_ut(jdUt, swisseph.SE_MEAN_APOG, getFlags(swisseph))
    ) as { longitude: number; longitudeSpeed: number };
    const lilithDegree = normalizeDegree(lilithPos.longitude);

    const extendedPoints: ExtendedPointPosition[] = [
      {
        key: "northnode",
        label: "North Node",
        sign: getSignFromDegree(northNodeDegree),
        degree: northNodeDegree,
        signDegree: +(northNodeDegree % 30).toFixed(4),
        house: findHouseForDegree(northNodeDegree, houses),
      },
      {
        key: "southnode",
        label: "South Node",
        sign: getSignFromDegree(southNodeDegree),
        degree: southNodeDegree,
        signDegree: +(southNodeDegree % 30).toFixed(4),
        house: findHouseForDegree(southNodeDegree, houses),
      },
      {
        key: "lilith",
        label: "Lilith",
        sign: getSignFromDegree(lilithDegree),
        degree: lilithDegree,
        signDegree: +(lilithDegree % 30).toFixed(4),
        house: findHouseForDegree(lilithDegree, houses),
      },
    ];

    const extendedAngles: ExtendedAnglePosition[] = [
      { key: "ascendant", label: "Ascendant", sign: getSignFromDegree(asc), degree: asc },
      { key: "midheaven", label: "Midheaven", sign: getSignFromDegree(mc), degree: mc },
    ];

    const sid = swisseph.swe_sidtime(jdUt);
    const localSiderealTime = normalizeDegree(sid.siderialTime * 15 + birth.longitude);

    return {
      planets,
      houses,
      angles,
      extendedPoints,
      extendedAngles,
      extendedAspects: [] as ExtendedAspect[],
      context: {
        latitude: birth.latitude,
        localSiderealTime,
        ascendantDegree: asc,
        vertexDegree: normalizeDegree(houseData.vertex),
        pointSpeeds,
      },
    };
  }
}
