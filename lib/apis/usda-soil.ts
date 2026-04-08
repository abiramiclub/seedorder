import type { SoilProfile } from '@/types/location';

// SoilGrids by ISRIC — free, no API key, global coverage, very reliable
// Docs: https://rest.isric.org/soilgrids/v2.0/docs

export async function fetchSoilData(lat: number, lng: number): Promise<SoilProfile> {
  const url = new URL('https://rest.isric.org/soilgrids/v2.0/properties/query');
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('lat', String(lat));
  // pH, organic carbon, clay, sand, silt at 0-5cm depth
  url.searchParams.append('property', 'phh2o');
  url.searchParams.append('property', 'ocd');
  url.searchParams.append('property', 'clay');
  url.searchParams.append('property', 'sand');
  url.searchParams.append('property', 'silt');
  url.searchParams.append('depth', '0-5cm');
  url.searchParams.append('value', 'mean');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`SoilGrids error: ${res.status}`);

  const data = await res.json() as {
    properties: {
      layers: Array<{
        name: string;
        depths: Array<{
          values: { mean: number | null };
        }>;
      }>;
    };
  };

  const layers = data?.properties?.layers ?? [];

  function getValue(name: string): number {
    const layer = layers.find((l) => l.name === name);
    return layer?.depths?.[0]?.values?.mean ?? 0;
  }

  // SoilGrids units: pH × 10, OCD in dg/kg, clay/sand/silt in g/kg
  const phRaw = getValue('phh2o');
  const ocdRaw = getValue('ocd');
  const clayRaw = getValue('clay');
  const sandRaw = getValue('sand');
  const siltRaw = getValue('silt');

  const pH = phRaw > 0 ? phRaw / 10 : 6.5;
  const organicMatter = ocdRaw > 0 ? Math.round((ocdRaw / 100) * 10) / 10 : 0;
  const clayPct = Math.round(clayRaw / 10);
  const sandPct = Math.round(sandRaw / 10);
  const siltPct = Math.round(siltRaw / 10);

  const texture = deriveTexture(sandPct, siltPct, clayPct);
  const drainage = deriveDrainage(clayPct, sandPct);

  return {
    mapUnitName: `Soil at ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
    texture,
    pH: Math.round(pH * 10) / 10,
    organicMatter,
    drainageClass: drainage,
    components: [
      { name: 'Clay', percentage: clayPct, texture, pH },
      { name: 'Sand', percentage: sandPct, texture, pH },
      { name: 'Silt', percentage: siltPct, texture, pH },
    ],
  };
}

function deriveTexture(sand: number, silt: number, clay: number): string {
  if (clay >= 40) return 'Clay';
  if (clay >= 27 && sand <= 45) return 'Clay Loam';
  if (sand >= 70 && clay < 15) return 'Sandy Loam';
  if (silt >= 80) return 'Silt';
  if (silt >= 50 && clay < 27) return 'Silt Loam';
  return 'Loam';
}

function deriveDrainage(clay: number, sand: number): string {
  if (clay >= 40) return 'Poorly drained';
  if (clay >= 27) return 'Moderately well drained';
  if (sand >= 70) return 'Excessively drained';
  return 'Well drained';
}
