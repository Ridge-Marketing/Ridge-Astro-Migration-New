/**
 * Remote image dimensions with a build-wide cache and retry.
 * Astro's <Image inferSize> fetches every remote image once per use with no
 * retry, so a single 429/timeout from the CMS fails the whole build.
 */
import { inferRemoteSize } from 'astro:assets';

type Size = { width: number; height: number } | null;

const sizeCache = new Map<string, Promise<Size>>();

async function measure(src: string, attempts = 4): Promise<Size> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const { width, height } = await inferRemoteSize(src);
      if (width && height) return { width, height };
      return null;
    } catch {
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
      }
    }
  }
  console.warn(`[remote-size] Could not measure ${src} — rendering a plain <img>`);
  return null;
}

export function getRemoteSize(src: string): Promise<Size> {
  if (!sizeCache.has(src)) sizeCache.set(src, measure(src));
  return sizeCache.get(src)!;
}
