import type { PlantPhoto } from '@/types/plant-profile';

const BASE_URL = 'https://api.inaturalist.org/v1';

export async function fetchPlantPhotos(scientificName: string): Promise<PlantPhoto[]> {
  const res = await fetch(
    `${BASE_URL}/taxa?q=${encodeURIComponent(scientificName)}&rank=species&per_page=1`
  );

  if (!res.ok) return [];

  const data = await res.json() as {
    results?: Array<{
      taxon_photos?: Array<{
        photo: {
          url: string;
          attribution: string;
          license_code: string;
        };
      }>;
    }>;
  };

  const taxon = data?.results?.[0];
  if (!taxon?.taxon_photos) return [];

  return taxon.taxon_photos.slice(0, 6).map((tp) => ({
    url: tp.photo.url.replace('square', 'medium'),
    thumbnailUrl: tp.photo.url,
    attribution: tp.photo.attribution,
    license: tp.photo.license_code ?? 'unknown',
    source: 'iNaturalist' as const,
  }));
}
