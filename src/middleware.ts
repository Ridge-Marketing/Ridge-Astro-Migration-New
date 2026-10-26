/**
 * Rewrites CMS URLs in rendered HTML: upload URLs → /wp-content/uploads/ (proxied
 * to the CMS by Netlify) and links to CMS pages → site-relative links. Runs for
 * prerendered pages at build time and for every page in dev.
 */
import { defineMiddleware } from 'astro:middleware';
import { rewriteCmsLinks, rewriteCmsUploads } from '@/lib/static-path';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  // Dev loads media straight from the CMS. Routing every image through the
  // Vite proxy funnels a whole page's requests through one IP, and the CMS's
  // Cloudflare rate limit answers the burst with 429s.
  if (import.meta.env.DEV) return response;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const html = await response.text();
  return new Response(rewriteCmsLinks(rewriteCmsUploads(html)), {
    status    : response.status,
    statusText: response.statusText,
    headers   : response.headers,
  });
});
