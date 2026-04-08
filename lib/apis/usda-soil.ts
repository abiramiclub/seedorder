import type { SoilProfile, SoilComponent } from '@/types/location';

const SDA_URL = 'https://SDMDataAccess.nrcs.usda.gov/Tabular/post.rest';

export async function fetchSoilData(lat: number, lng: number): Promise<SoilProfile> {
  // Step 1: get map unit key from coordinates
  const mukeyQuery = `SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('point(${lng} ${lat})')`;

  const mukeyRes = await fetch(SDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ query: mukeyQuery, format: 'JSON' }),
  });

  if (!mukeyRes.ok) throw new Error(`USDA soil mukey lookup error: ${mukeyRes.status}`);

  const mukeyData = await mukeyRes.json() as { Table?: string[][] };
  const mukey = mukeyData?.Table?.[0]?.[0];
  if (!mukey) throw new Error('No soil map unit found for this location');

  // Step 2: get soil components for this map unit
  const soilQuery = `
    SELECT mu.muname, c.compname, c.comppct_r, c.texdesc, c.ph1to1h2o_r, c.om_r, c.drainagecl
    FROM mapunit mu
    INNER JOIN component c ON c.mukey = mu.mukey
    WHERE mu.mukey = '${mukey}'
    ORDER BY c.comppct_r DESC
  `;

  const soilRes = await fetch(SDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ query: soilQuery, format: 'JSON' }),
  });

  if (!soilRes.ok) throw new Error(`USDA soil detail error: ${soilRes.status}`);

  const soilData = await soilRes.json() as { Table?: string[][] };
  const rows = soilData?.Table ?? [];

  if (rows.length === 0) throw new Error('No soil component data found');

  const components: SoilComponent[] = rows.map((row) => ({
    name: String(row[1] ?? ''),
    percentage: Number(row[2] ?? 0),
    texture: String(row[3] ?? 'Unknown'),
    pH: Number(row[4] ?? 7.0),
  }));

  const primary = components[0];

  return {
    mapUnitName: String(rows[0]?.[0] ?? 'Unknown'),
    texture: primary?.texture ?? 'Unknown',
    pH: primary?.pH ?? 7.0,
    organicMatter: Number(rows[0]?.[5] ?? 0),
    drainageClass: String(rows[0]?.[6] ?? 'Unknown'),
    components,
  };
}
