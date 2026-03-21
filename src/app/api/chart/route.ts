import { NextResponse } from "next/server";
import { createDualCharts } from "@/core/horoscope";
import type { BirthData } from "@/core/types";

export async function POST(request: Request) {
  try {
    const input: BirthData = await request.json();
    const { placidus, wholeSign } = createDualCharts(input);

    return NextResponse.json({
      input,
      placidus,
      wholeSign,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
