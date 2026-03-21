import type {
  BirthData,
  NatalChart,
  PlanetPosition,
  AnglePosition,
  AspectPoint,
  DisplayAspect,
  VirtualPointPosition,
  ZodiacSign,
} from "@/core/types";
import type { ChartEngineProvider } from "@/core/providers/types";
import { calculateAspects, calculateDisplayAspects } from "@/core/aspects";
import { createEngineProvider } from "@/core/providers/factory";
import { ZODIAC_SIGNS } from "@/core/constants";

function normalizeDegree(degree: number): number {
  const normalized = degree % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function toRadians(degree: number): number {
  return (degree * Math.PI) / 180;
}

function toDegrees(radian: number): number {
  return (radian * 180) / Math.PI;
}

function getSignForDegree(degree: number): ZodiacSign {
  const index = Math.floor(normalizeDegree(degree) / 30) % 12;
  return ZODIAC_SIGNS[index];
}

function calculateFortuneDegree(
  ascendantDegree: number,
  sunDegree: number,
  moonDegree: number,
  isDayChart: boolean
): number {
  const raw = isDayChart
    ? ascendantDegree + moonDegree - sunDegree
    : ascendantDegree + sunDegree - moonDegree;
  return normalizeDegree(raw);
}

function calculateVertexDegree(localSiderealTime: number, latitude: number): number {
  const ramc = toRadians(localSiderealTime);
  const lat = toRadians(latitude);
  const obliquity = toRadians(23.4367);
  const numerator = Math.cos(ramc);
  const denominator = -(
    Math.sin(ramc) * Math.cos(obliquity) +
    Math.tan(lat) * Math.sin(obliquity)
  );
  return normalizeDegree(toDegrees(Math.atan2(numerator, denominator)));
}

function findHouseForDegree(
  degree: number,
  houses: NatalChart["houses"]
): number {
  for (let i = 0; i < houses.length; i++) {
    const start = houses[i].degree;
    const end = houses[(i + 1) % houses.length].degree;
    if (start < end) {
      if (degree >= start && degree < end) return houses[i].house;
    } else if (degree >= start || degree < end) {
      return houses[i].house;
    }
  }
  return 1;
}

function createVirtualPoints(
  planets: PlanetPosition[],
  houses: NatalChart["houses"],
  context: {
    latitude: number;
    localSiderealTime: number;
    ascendantDegree?: number;
    vertexDegree?: number;
  }
): VirtualPointPosition[] {
  const ascendant = context.ascendantDegree;
  const sun = planets.find((p) => p.planet === "Sun");
  const moon = planets.find((p) => p.planet === "Moon");
  if (typeof ascendant !== "number" || !sun || !moon) return [];

  const isDayChart = sun.house >= 7 && sun.house <= 12;
  const fortuneDegree = calculateFortuneDegree(ascendant, sun.degree, moon.degree, isDayChart);
  const vertexDegree =
    typeof context.vertexDegree === "number"
      ? normalizeDegree(context.vertexDegree)
      : calculateVertexDegree(context.localSiderealTime, context.latitude);

  const toPoint = (
    key: "fortune" | "vertex",
    label: string,
    degree: number
  ): VirtualPointPosition => ({
    key,
    label,
    sign: getSignForDegree(degree),
    degree,
    signDegree: +(degree % 30).toFixed(4),
    house: findHouseForDegree(degree, houses),
  });

  return [
    toPoint("fortune", "Fortune", fortuneDegree),
    toPoint("vertex", "Vertex", vertexDegree),
  ];
}

function createDisplayAspectPoints(
  planets: PlanetPosition[],
  angles: AnglePosition[],
  virtualPoints: VirtualPointPosition[],
  pointSpeeds?: Record<string, number>
): AspectPoint[] {
  const points: AspectPoint[] = [];

  for (const planet of planets) {
    points.push({
      key: planet.planet.toLowerCase(),
      label: planet.planet === "NorthNode" ? "Node" : planet.planet,
      degree: planet.degree,
      speed: planet.speed ?? pointSpeeds?.[planet.planet.toLowerCase()],
    });
  }

  for (const angle of angles) {
    points.push({
      key: angle.angle.toLowerCase(),
      label: angle.angle,
      degree: angle.degree,
      speed: pointSpeeds?.[angle.angle.toLowerCase()],
    });
  }

  for (const point of virtualPoints) {
    points.push({
      key: point.key,
      label: point.label,
      degree: point.degree,
      speed: pointSpeeds?.[point.key],
    });
  }

  return points;
}

function splitDisplayAspects(aspects: DisplayAspect[]) {
  const majorPlanets = new Set([
    "sun", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
  ]);

  const planetAspects = aspects.filter(
    (asp) => majorPlanets.has(asp.point1Key) && majorPlanets.has(asp.point2Key)
  );
  const otherAspects = aspects.filter(
    (asp) => !(majorPlanets.has(asp.point1Key) && majorPlanets.has(asp.point2Key))
  );

  return { planetAspects, otherAspects };
}

export function createNatalChartFromProvider(
  birth: BirthData,
  houseSystem: "placidus" | "whole-sign",
  provider: ChartEngineProvider
): NatalChart {
  const base = provider.createChart(birth, houseSystem);
  const virtualPoints = createVirtualPoints(base.planets, base.houses, base.context);

  const displayAspectPoints = createDisplayAspectPoints(
    base.planets, base.angles, virtualPoints, base.context.pointSpeeds
  );
  const displayAspects = calculateDisplayAspects(displayAspectPoints);
  const { planetAspects, otherAspects } = splitDisplayAspects(displayAspects);

  return {
    houseSystem,
    planets: base.planets,
    houses: base.houses,
    angles: base.angles,
    aspects: calculateAspects(base.planets),
    virtualPoints,
    planetAspects,
    otherAspects,
    extended: {
      points: base.extendedPoints.concat(
        virtualPoints.map((p) => ({
          key: p.key, label: p.label, sign: p.sign,
          degree: p.degree, signDegree: p.signDegree, house: p.house,
        }))
      ),
      angles: base.extendedAngles,
      aspects: base.extendedAspects.concat(
        displayAspects
          .filter((a) =>
            a.point1Key === "fortune" || a.point1Key === "vertex" ||
            a.point2Key === "fortune" || a.point2Key === "vertex"
          )
          .map((a) => ({
            point1Key: a.point1Key, point1Label: a.point1Label,
            point2Key: a.point2Key, point2Label: a.point2Label,
            aspectKey: a.type.toLowerCase(), aspectLabel: a.type,
            orb: a.orb, level: "Major",
          }))
      ),
    },
  };
}

export function createDualCharts(birth: BirthData) {
  const provider = createEngineProvider();
  const placidus = createNatalChartFromProvider(birth, "placidus", provider);
  const wholeSign = createNatalChartFromProvider(birth, "whole-sign", provider);
  return { placidus, wholeSign };
}
