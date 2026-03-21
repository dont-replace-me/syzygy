import type { ChartEngineProvider } from "@/core/providers/types";
import { SwissEngineProvider } from "@/core/providers/swissProvider";

export function createEngineProvider(): ChartEngineProvider {
  return new SwissEngineProvider();
}
