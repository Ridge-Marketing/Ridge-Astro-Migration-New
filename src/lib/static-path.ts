/**
 * CMS uploads → site-relative paths
 *
 * Raw WP media URLs (videos, SVGs, plain <img> fallbacks, background images)
 * are served from the site's own domain at /wp-content/uploads/*, which
 * Netlify proxies to the CMS (see public/_redirects; Vite proxies it in dev).
 * Same approach as the Gatsby site's searchAndReplaceContentUrls + proxy.
 */

export const CMS_ORIGIN   = 'https://cms.ridgemarketing.com';
export const UPLOADS_PATH = '/wp-content/uploads/';

// http(s):// or protocol-relative, optionally www. Percent-encoded URLs (e.g.
// /.netlify/images?url=https%3A%2F%2Fcms...) deliberately don't match — the
// image CDN needs the absolute origin.
const CMS_UPLOADS_RE = /(?:https?:)?\/\/(?:www\.)?cms\.ridgemarketing\.com\/wp-content\/uploads\//g;

/** Rewrite every CMS uploads URL in a string (HTML, JSON, CSS) to /wp-content/uploads/. */
export function rewriteCmsUploads(input: string): string {
  return input.replace(CMS_UPLOADS_RE, UPLOADS_PATH);
}

// href="https://cms.ridgemarketing.com/..." inside WYSIWYG content (blog posts,
// service bodies) — page links that should stay on this site.
// The origin plus its optional trailing slash is swapped for "/", so a bare
// origin link becomes the homepage rather than an empty href.
const CMS_HREF_RE = /href=(["'])(?:https?:)?\/\/(?:www\.)?cms\.ridgemarketing\.com(?:\/|(?=\1))/g;

/** Rewrite links to CMS pages into site-relative links. */
export function rewriteCmsLinks(input: string): string {
  return input.replace(CMS_HREF_RE, (_match, quote) => `href=${quote}/`);
}

/** Turn a site-relative uploads path back into an absolute CMS URL. */
export function toCmsUrl(url: string): string {
  return url.startsWith(UPLOADS_PATH) ? `${CMS_ORIGIN}${url}` : url;
}
