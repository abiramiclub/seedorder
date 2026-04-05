const BASE_URL = 'https://trefle.io/api/v1';

export async function fetchEdibleUses(scientificName: string): Promise<string[]> {
  const apiKey = process.env.TREFLE_API_KEY;
  if (!apiKey) throw new Error('TREFLE_API_KEY is not set');

  const searchRes = await fetch(
    `${BASE_URL}/plants/search?q=${encodeURIComponent(scientificName)}&token=${apiKey}`
  );

  if (!searchRes.ok) return [];

  const searchData = await searchRes.json() as {
    data?: Array<{ id: number }>;
  };

  const plantId = searchData?.data?.[0]?.id;
  if (!plantId) return [];

  const detailRes = await fetch(`${BASE_URL}/plants/${plantId}?token=${apiKey}`);
  if (!detailRes.ok) return [];

  const detail = await detailRes.json() as {
    data?: {
      main_species?: {
        edible_part?: string | null;
        edible?: boolean;
      };
    };
  };

  const ediblePart = detail?.data?.main_species?.edible_part;
  const isEdible = detail?.data?.main_species?.edible;

  if (!isEdible || !ediblePart) return [];
  return [ediblePart];
}
