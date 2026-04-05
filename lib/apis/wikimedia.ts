import type { PlantPhoto } from '@/types/plant-profile';

const BASE_URL = 'https://en.wikipedia.org/w/api.php';

export async function fetchWikimediaPhotos(scientificName: string): Promise<PlantPhoto[]> {
  const params = new URLSearchParams({
    action: 'query',
    titles: scientificName,
    prop: 'images',
    imlimit: '5',
    format: 'json',
    origin: '*',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) return [];

  const data = await res.json() as {
    query?: {
      pages?: Record<string, {
        images?: Array<{ title: string }>;
      }>;
    };
  };

  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const images = page?.images ?? [];

  // Filter to image files only
  const imageFiles = images
    .filter((img) => /\.(jpg|jpeg|png|svg)$/i.test(img.title))
    .slice(0, 4);

  return imageFiles.map((img) => {
    const filename = img.title.replace('File:', '');
    const encoded = encodeURIComponent(filename);
    return {
      url: `https://upload.wikimedia.org/wikipedia/commons/${encoded}`,
      thumbnailUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/${encoded}/300px-${encoded}`,
      attribution: `Wikimedia Commons — ${filename}`,
      license: 'See Wikimedia Commons for license details',
      source: 'Wikimedia' as const,
    };
  });
}
