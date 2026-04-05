import type { HardinessZone } from '@/types/location';

const BASE_URL = 'https://phzmapi.org';

export async function fetchHardinessZone(lat: number, lng: number): Promise<HardinessZone> {
  const res = await fetch(`${BASE_URL}/${lat}/${lng}.json`);
  if (!res.ok) throw new Error(`Hardiness zone API error: ${res.status}`);

  const data = await res.json() as {
    zone: string;
    temperature_range: string;
  };

  // Parse temperature range like "-10 to -5" (°F)
  const rangeParts = data.temperature_range.split(' to ').map((s: string) => parseFloat(s));

  return {
    zone: data.zone,
    tMin: rangeParts[0] ?? -99,
    tMax: rangeParts[1] ?? 99,
  };
}
