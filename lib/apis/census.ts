import type { ZipLocation } from '@/types/location';

export async function geocodeZip(zip: string): Promise<ZipLocation> {
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

  if (!res.ok) throw new Error(`Geocoder error: ${res.status}`);

  const data = await res.json() as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!data || data.length === 0) {
    throw new Error(`No location found for zip code: ${zip}`);
  }

  const result = data[0];
  // display_name: "Cold Spring, Putnam County, New York, 10516, United States"
  const parts = result.display_name.split(', ');
  const city = parts[0] ?? '';
  const state = parts[2] ?? '';

  return {
    zipCode: zip,
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    city,
    state,
    stateCode: stateNameToCode(state),
  };
}

// Converts full state name to 2-letter code for USDA PLANTS API
function stateNameToCode(name: string): string {
  const map: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY',
  };
  return map[name] ?? name;
}
