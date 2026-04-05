import type { SoilProfile, SoilComponent } from '@/types/location';

const WSS_URL = 'https://SDMDataAccess.nrcs.usda.gov/Tabular/SDMTabularService/post.rest';

export async function fetchSoilData(lat: number, lng: number): Promise<SoilProfile> {
  // USDA Web Soil Survey SOAP/REST query — fetch map unit data by coordinates
  const query = `
    SELECT mu.muname, mu.mukind,
           c.compname, c.comppct_r, c.texdesc, c.ph1to1h2o_r, c.om_r, c.drainagecl
    FROM mapunit mu
    INNER JOIN component c ON c.mukey = mu.mukey
    INNER JOIN sacatalog sc ON sc.areasymbol = mu.areasymbol
    WHERE mu.mukey IN (
      SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84(
        'point(${lng} ${lat})'
      )
    )
    ORDER BY c.comppct_r DESC
  `;

  const res = await fetch(WSS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`USDA Soil Survey error: ${res.status}`);

  const data = await res.json() as {
    Table?: string[][];
  };

  const rows = data?.Table ?? [];
  if (rows.length === 0) {
    throw new Error('No soil data found for this location');
  }

  const components: SoilComponent[] = rows.map((row) => ({
    name: String(row[2] ?? ''),
    percentage: Number(row[3] ?? 0),
    texture: String(row[4] ?? 'Unknown'),
    pH: Number(row[5] ?? 7.0),
  }));

  const primary = components[0];

  return {
    mapUnitName: String(rows[0]?.[0] ?? 'Unknown'),
    texture: primary?.texture ?? 'Unknown',
    pH: primary?.pH ?? 7.0,
    organicMatter: Number(rows[0]?.[6] ?? 0),
    drainageClass: String(rows[0]?.[7] ?? 'Unknown'),
    components,
  };
}
