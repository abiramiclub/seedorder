import type { ZipLocation } from '@/types/location';

const BASE_URL = 'https://geocoding.geo.census.gov/geocoder/locations';

export async function geocodeZip(zip: string): Promise<ZipLocation> {
  // Use structured address endpoint with zip only — more reliable than onelineaddress
  const params = new URLSearchParams({
    street: '',
    city: '',
    state: '',
    zip,
    benchmark: 'Public_AR_Current',
    format: 'json',
  });

  const res = await fetch(`${BASE_URL}/address?${params}`);
  if (!res.ok) throw new Error(`Census geocoder error: ${res.status}`);

  const data = await res.json();
  const matches: unknown[] = data?.result?.addressMatches;

  if (!matches || matches.length === 0) {
    // Fallback: try zip + USA as a one-line address
    return geocodeZipFallback(zip);
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
    city: match.addressComponents.city ?? '',
    state: match.addressComponents.state ?? '',
    stateCode: match.addressComponents.state ?? '',
  };
}

async function geocodeZipFallback(zip: string): Promise<ZipLocation> {
  const params = new URLSearchParams({
    address: `${zip}, USA`,
    benchmark: 'Public_AR_Current',
    format: 'json',
  });

  const res = await fetch(`${BASE_URL}/onelineaddress?${params}`);
  if (!res.ok) throw new Error(`Census geocoder error: ${res.status}`);

  const data = await res.json();
  const matches: unknown[] = data?.result?.addressMatches;

  if (!matches || matches.length === 0) {
    // Last resort: use Nominatim (OpenStreetMap) — no key required
    return geocodeZipNominatim(zip);
  }

  const match = matches[0] as {
    coordinates: { x: number; y: number };
    addressComponents: { city: string; state: string };
  };

  return {
    zipCode: zip,
    lat: match.coordinates.y,
    lng: match.coordinates.x,
    city: match.addressComponents.city ?? '',
    state: match.addressComponents.state ?? '',
    stateCode: match.addressComponents.state ?? '',
  };
}

async function geocodeZipNominatim(zip: string): Promise<ZipLocation> {
  const params = new URLSearchParams({
    postalcode: zip,
    country: 'US',
    format: 'json',
    limit: '1',
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { 'User-Agent': 'NativeSeed/1.0' } }
  );

  if (!res.ok) throw new Error(`Nominatim geocoder error: ${res.status}`);

  const data = await res.json() as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!data || data.length === 0) {
    throw new Error(`No location found for zip code: ${zip}`);
  }

  const result = data[0];
  // display_name format: "Cold Spring, Putnam County, New York, 10516, United States"
  const parts = result.display_name.split(', ');
  const city = parts[0] ?? '';
  const state = parts[2] ?? '';

  return {
    zipCode: zip,
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    city,
    state,
    stateCode: state,
  };
}
