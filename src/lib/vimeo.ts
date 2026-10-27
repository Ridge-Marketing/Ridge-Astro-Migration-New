/**
 * Vimeo URL → embeddable player URL.
 *
 * Editors paste every flavour of Vimeo link into the CMS:
 *   https://vimeo.com/1117166399/0e90503007            (unlisted share link)
 *   https://player.vimeo.com/video/384582413?h=5153f…  (embed link, often with extra params)
 *   https://vimeo.com/773442787                        (public)
 *   https://vimeo.com/showcase/11690154?share=copy     (showcase)
 *
 * vimeo.com page URLs can't be iframed, and unlisted videos only play when
 * the privacy hash is passed as ?h=…, so both must be normalized here.
 */

const PLAYER = 'https://player.vimeo.com/video';

/** Embed URL for a Vimeo link, or null if it isn't one we can embed. */
export function vimeoEmbedUrl(url: string | null | undefined, params: Record<string, string | number> = {}): string | null {
  if (!url) return null;
  const clean = url.trim().replace(/&amp;/g, '&');

  let parsed: URL;
  try {
    parsed = new URL(clean);
  } catch {
    return null;
  }
  if (!/(^|\.)vimeo\.com$/.test(parsed.hostname)) return null;

  const segments = parsed.pathname.split('/').filter(Boolean);

  // Showcases embed at /showcase/<id>/embed
  if (segments[0] === 'showcase' && segments[1]) {
    const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
    return `https://vimeo.com/showcase/${segments[1]}/embed${query.size ? `?${query}` : ''}`;
  }

  // Video ID = first all-digit segment; an unlisted share link has the hash
  // right after it (vimeo.com/<id>/<hash>)
  const idIndex = segments.findIndex((s) => /^\d+$/.test(s));
  if (idIndex === -1) return null;
  const id   = segments[idIndex];
  const hash = parsed.searchParams.get('h') || (/^[0-9a-f]{6,}$/i.test(segments[idIndex + 1] || '') ? segments[idIndex + 1] : '');

  // Keep the editor's player params (color, title=0…), then apply ours
  const query = new URLSearchParams();
  if (parsed.hostname.startsWith('player.')) {
    parsed.searchParams.forEach((value, key) => {
      if (key !== 'h') query.set(key, value);
    });
  }
  if (hash) query.set('h', hash);
  for (const [key, value] of Object.entries(params)) query.set(key, String(value));

  return `${PLAYER}/${id}${query.size ? `?${query}` : ''}`;
}

export interface VimeoThumbnail {
  url   : string;
  width : number;
  height: number;
  title : string;
}

const thumbnailCache = new Map<string, Promise<VimeoThumbnail | null>>();

/**
 * Vimeo's own poster frame for a video, via oEmbed (build time, cached per
 * URL). Works for unlisted videos when the link carries the privacy hash.
 * Returns null if Vimeo doesn't answer, so callers can fall back.
 */
export function getVimeoThumbnail(url: string | null | undefined, width = 1280): Promise<VimeoThumbnail | null> {
  const embed = vimeoEmbedUrl(url);
  // Single videos only — showcase embeds have no single poster frame
  if (!embed || !embed.startsWith(PLAYER)) return Promise.resolve(null);

  // oEmbed wants a vimeo.com URL; rebuild one from the player URL (keeps the hash)
  const player = new URL(embed);
  const id     = player.pathname.split('/').filter(Boolean).pop();
  const hash   = player.searchParams.get('h');
  const page   = `https://vimeo.com/${id}${hash ? `/${hash}` : ''}`;
  const key    = `${page}@${width}`;

  if (!thumbnailCache.has(key)) {
    const endpoint = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(page)}&width=${width}`;
    thumbnailCache.set(key, (async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RidgeMarketingBuild/1.0)' } });
          if (res.ok) {
            const data = await res.json();
            if (!data.thumbnail_url) return null;
            return {
              url   : data.thumbnail_url,
              width : data.thumbnail_width || data.width,
              height: data.thumbnail_height || data.height,
              title : data.title || '',
            };
          }
          if (res.status !== 429 && res.status < 500) break;
        } catch {}
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
      console.warn(`[vimeo] no thumbnail for ${page}`);
      return null;
    })());
  }
  return thumbnailCache.get(key)!;
}
