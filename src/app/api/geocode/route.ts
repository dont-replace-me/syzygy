import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'syzygy-astrology/1.0' },
  });

  const data = await response.json();
  return NextResponse.json(data);
}
