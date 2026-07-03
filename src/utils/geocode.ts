export type GeoPoint = { lat: number; lng: number };

const cache = new Map<string, GeoPoint | null>();

export async function geocodeLocation(beachLocationText: string): Promise<GeoPoint | null> {
  const key = beachLocationText?.trim();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(key)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'PlayaDeliveryAdmin/1.0 (+https://example.com)',
      },
    });

    if (!response.ok) {
      cache.set(key, null);
      return null;
    }

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    const result = data.length > 0 ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null;
    cache.set(key, result);
    return result;
  } catch (error) {
    cache.set(key, null);
    return null;
  }
}
