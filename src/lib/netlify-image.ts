/**
 * Netlify Image CDN helpers
 *
 * Used for React Island Components 
 * 
 * Wraps remote image URLs in /.netlify/images so they're transcoded to WebP
 * and resized at the edge. 
 *
 * Allowed remote hosts are configured in netlify.toml under [images].remote_images.
 */

import { toCmsUrl } from './static-path';

const NETLIFY_IMG_PATH = '/.netlify/images';

export interface NetlifyImgOptions {
  widths  : number[];
  quality?: number;
  format? : 'webp' | 'avif' | 'auto';
}

export interface OptimizedImage {
  src   : string;
  srcSet: string;
}

export function netlifyImg(originalUrl: string, opts: NetlifyImgOptions): OptimizedImage {
  if (!originalUrl) return { src: '', srcSet: '' };
  const { widths, quality = 80, format = 'webp' } = opts;
  // Island props arrive with CMS uploads rewritten to /wp-content/uploads/ (see
  // src/middleware.ts); the image CDN needs the absolute, allow-listed origin.
  const enc       = encodeURIComponent(toCmsUrl(originalUrl));
  const fmtParam  = format === 'auto' ? '' : `&fm=${format}`;
  const buildUrl  = (w: number) => `${NETLIFY_IMG_PATH}?url=${enc}&w=${w}&q=${quality}${fmtParam}`;
  const sorted    = [...widths].sort((a, b) => a - b);
  const srcSet    = sorted.map((w) => `${buildUrl(w)} ${w}w`).join(', ');
  const src       = buildUrl(sorted[sorted.length - 1]);
  return { src, srcSet };
}