import type { IUCNCategory } from '@/types/plant-profile';

const BASE_URL = 'https://apiv3.iucnredlist.org/api/v3';

export async function fetchIUCNStatus(
  scientificName: string
): Promise<{ category: IUCNCategory; label: string } | null> {
  const apiKey = process.env.IUCN_API_KEY;
  if (!apiKey) throw new Error('IUCN_API_KEY is not set');

  const res = await fetch(
    `${BASE_URL}/species/${encodeURIComponent(scientificName)}?token=${apiKey}`
  );

  if (!res.ok) return null;

  const data = await res.json() as {
    result?: Array<{ category: string }>;
  };

  const category = data?.result?.[0]?.category as IUCNCategory | undefined;
  if (!category) return null;

  return {
    category,
    label: categoryToLabel(category),
  };
}

function categoryToLabel(category: IUCNCategory): string {
  const labels: Record<IUCNCategory, string> = {
    EX: 'Extinct',
    EW: 'Extinct in the Wild',
    CR: 'Critically Endangered',
    EN: 'Endangered',
    VU: 'Vulnerable',
    NT: 'Near Threatened',
    LC: 'Least Concern',
    DD: 'Data Deficient',
    NE: 'Not Evaluated',
  };
  return labels[category] ?? 'Unknown';
}
