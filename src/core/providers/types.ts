import type {
  BirthData,
  PlanetPosition,
  HouseCusp,
  AnglePosition,
  ExtendedPointPosition,
  ExtendedAnglePosition,
  ExtendedAspect,
} from "@/core/types";

export type EphemerisEngine = "swiss";

export interface EngineChartData {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  angles: AnglePosition[];
  extendedPoints: ExtendedPointPosition[];
  extendedAngles: ExtendedAnglePosition[];
  extendedAspects: ExtendedAspect[];
  context: {
    latitude: number;
    localSiderealTime: number;
    ascendantDegree?: number;
    vertexDegree?: number;
    pointSpeeds?: Record<string, number>;
  };
}

export interface ChartEngineProvider {
  readonly id: EphemerisEngine;
  createChart(
    birth: BirthData,
    houseSystem: "placidus" | "whole-sign"
  ): EngineChartData;
}
