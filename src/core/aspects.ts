import type {
  PlanetPosition,
  Aspect,
  AspectPoint,
  DisplayAspect,
} from "./types";
import { ASPECT_DEFINITIONS } from "./constants";

// Planet-to-planet: major 5 aspects only
const MAJOR_ASPECTS = ASPECT_DEFINITIONS.filter((d) =>
  ["Conjunction", "Sextile", "Square", "Trine", "Opposition"].includes(d.type)
);

export function calculateAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const angle = Math.abs(planets[i].degree - planets[j].degree);
      const normalized = angle > 180 ? 360 - angle : angle;

      for (const def of MAJOR_ASPECTS) {
        const orb = Math.abs(normalized - def.angle);
        if (orb <= def.maxOrb) {
          aspects.push({
            planet1: planets[i].planet,
            planet2: planets[j].planet,
            type: def.type,
            orb: +orb.toFixed(2),
            exact: orb < 1,
          });
        }
      }
    }
  }

  return aspects;
}

export function calculateDisplayAspects(points: AspectPoint[]): DisplayAspect[] {
  const aspects: DisplayAspect[] = [];

  const normalize = (deg: number) => {
    const n = deg % 360;
    return n < 0 ? n + 360 : n;
  };

  const angleDiff = (a: number, b: number) => {
    const raw = Math.abs(normalize(a) - normalize(b));
    return raw > 180 ? 360 - raw : raw;
  };

  const calcOrb = (distance: number, target: number) =>
    Math.abs(distance - target);

  const getApplyingState = (
    p1: AspectPoint, p2: AspectPoint, targetAngle: number
  ): "Applying" | "Separating" => {
    const v1 = p1.speed ?? 0;
    const v2 = p2.speed ?? 0;
    if (v1 === 0 && v2 === 0) return "Separating";

    // Use small time step (0.01 day ≈ 14 min) for accuracy with fast-moving bodies
    const dt = 0.01;
    const nowDist = angleDiff(p1.degree, p2.degree);
    const nowOrb = calcOrb(nowDist, targetAngle);
    const futureDist = angleDiff(p1.degree + v1 * dt, p2.degree + v2 * dt);
    const futureOrb = calcOrb(futureDist, targetAngle);

    return futureOrb < nowOrb ? "Applying" : "Separating";
  };

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const angle = Math.abs(points[i].degree - points[j].degree);
      const normalized = angle > 180 ? 360 - angle : angle;

      for (const def of ASPECT_DEFINITIONS) {
        const orb = Math.abs(normalized - def.angle);
        if (orb <= def.maxOrb) {
          aspects.push({
            point1Key: points[i].key,
            point1Label: points[i].label,
            point2Key: points[j].key,
            point2Label: points[j].label,
            type: def.type,
            orb: +orb.toFixed(2),
            exact: orb < 1,
            applyingState: getApplyingState(points[i], points[j], def.angle),
          });
        }
      }
    }
  }

  return aspects;
}
