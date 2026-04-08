import type { HardinessZone } from '@/types/location';
import { minTempToZone } from './noaa';

// Hardiness zone is now derived from Open-Meteo winter minimum temperature.
// This function accepts a pre-computed zone string from climate data,
// or falls back to a coordinate-based lookup.

export async function fetchHardinessZone(
  _lat: number,
  _lng: number,
  _zipCode?: string,
  zoneFromClimate?: string
): Promise<HardinessZone> {
  if (zoneFromClimate) {
    return { zone: zoneFromClimate, tMin: -99, tMax: 99 };
  }

  // Fallback: phzmapi.org
  try {
    const res = await fetch(`https://phzmapi.org/${_lat}/${_lng}.json`);
    if (res.ok) {
      const data = await res.json() as { zone: string; temperature_range: string };
      const parts = (data.temperature_range ?? '').split(' to ').map((s: string) => parseFloat(s));
      return { zone: data.zone ?? 'Unknown', tMin: parts[0] ?? -99, tMax: parts[1] ?? 99 };
    }
  } catch { /* fall through */ }

  return { zone: 'Unknown', tMin: -99, tMax: 99 };
}
