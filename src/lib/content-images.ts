/**
 * Optimize <img> tags inside WYSIWYG HTML (blog post bodies).
 *
 * Content is injected with set:html, so Astro's <Image> can't be used there.
 * Instead each raster CMS image is run through getImage() at build time,
 * which (with the Netlify adapter) yields Netlify Image CDN URLs — resized,
 * WebP, with a responsive srcset — same output as WpImage.
 *
 * Left untouched: SVG/GIF (vector / possibly animated), non-CMS images, and
 * any image getImage() can't handle.
 */
import { getImage } from 'astro:assets';
import { getRemoteSize } from './remote-size';
import { toCmsUrl } from './static-path';

const IMG_TAG_RE      = /<img\b[^>]*>/gi;
const ATTR_RE         = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
const CMS_UPLOADS_RE  = /^(?:https?:)?\/\/(?:www\.)?cms\.ridgemarketing\.com\/wp-content\/uploads\//i;
const PASS_THROUGH_RE = /\.(svg|gif)(\?|$)/i;
const TARGET_WIDTHS   = [400, 800, 1200];

type Attrs = Map<string, string | null>;

function parseAttrs(tag: string): Attrs {
  const attrs: Attrs = new Map();
  const body         = tag.replace(/^<img\b/i, '').replace(/\/?>$/, '');
  for (const m of body.matchAll(ATTR_RE)) {
    attrs.set(m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? null);
  }
  return attrs;
}

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const decodeAttr = (value: string) => value.replace(/&amp;/g, '&').replace(/&#0?38;/g, '&');

function buildTag(attrs: Attrs): string {
  const parts = [...attrs].map(([name, value]) => (value === null ? name : `${name}="${escapeAttr(value)}"`));
  return `<img ${parts.join(' ')}>`;
}

async function optimizeTag(tag: string, quality: number): Promise<string> {
  const attrs  = parseAttrs(tag);
  const rawSrc = decodeAttr(attrs.get('src') || '');
  const src    = toCmsUrl(rawSrc);

  if (!CMS_UPLOADS_RE.test(src) || PASS_THROUGH_RE.test(src)) return tag;

  let width  = parseInt(attrs.get('width') || '', 10);
  let height = parseInt(attrs.get('height') || '', 10);
  if (!width || !height) {
    const size = await getRemoteSize(src);
    if (!size) return tag;
    ({ width, height } = size);
  }

  // Never upscale: only widths up to the image's own, plus its own width
  const widths = [...new Set([...TARGET_WIDTHS.filter((w) => w < width), width])];
  const sizes  = attrs.get('sizes') || `(max-width: ${width}px) 100vw, ${width}px`;

  try {
    const image = await getImage({ src, width, height, widths, sizes, format: 'webp', quality });

    attrs.delete('srcset');
    attrs.set('src', image.src);
    attrs.set('srcset', image.srcSet.attribute);
    attrs.set('sizes', sizes);
    attrs.set('width', String(width));
    attrs.set('height', String(height));
    if (!attrs.has('loading'))  attrs.set('loading', 'lazy');
    if (!attrs.has('decoding')) attrs.set('decoding', 'async');

    return buildTag(attrs);
  } catch (err) {
    console.warn(`[content-images] left ${src} unoptimized:`, (err as Error).message);
    return tag;
  }
}

/** Rewrite raster CMS <img> tags in an HTML string to optimized WebP srcsets. */
export async function optimizeContentImages(html: string, quality = 85): Promise<string> {
  const tags = [...new Set(html.match(IMG_TAG_RE) || [])];
  if (tags.length === 0) return html;

  const optimized = await Promise.all(tags.map((tag) => optimizeTag(tag, quality)));
  const lookup    = new Map(tags.map((tag, i) => [tag, optimized[i]]));

  return html.replace(IMG_TAG_RE, (tag) => lookup.get(tag) ?? tag);
}
