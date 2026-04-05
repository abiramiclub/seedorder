import type { ZipLocation } from '@/types/location';

const BASE_URL = 'https://geocoding.geo.census.gov/geocoder/locations';

export async function geocodeZip(zip: string): Promise<ZipLocation> {
  const params = new URLSearchParams({
    address: zip,
    benchmark: 'Public_AR_Current',
    format: 'json',
  });

  const res = await fetch(`${BASE_URL}/onelineaddress?${params}`);
  if (!res.ok) throw new Error(`Census geocoder error: ${res.status}`);

  const data = await res.json();
  const matches: unknown[] = data?.result?.addressMatches;
  if (!matches || matches.length === 0) {
    throw new Error(`No location found for zip code: ${zip}`);
  }

  const match = matches[0] as {
    coordinates: { x: number; y: number };
    addressComponents: {
      city: string;
      state: string;
      zip: string;
    };
  };

  return {
    zipCode: zip,
    lat: match.coordinates.y,
    lng: match.coordinates.x,
    city: match.addressComponents.city,
    state: match.addressComponents.state,
    stateCode: match.addressComponents.state,
  };
}
