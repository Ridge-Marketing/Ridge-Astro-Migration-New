import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';
import redirectEntries from './redirects.json';

import partytown from '@astrojs/partytown';

// Map the legacy Gatsby redirects ({ fromPath, toPath }[]) to Astro
const stripSlash = (path) => (path !== '/' ? path.replace(/\/+$/, '') : path);
const redirects  = Object.fromEntries(
  redirectEntries.map(({ fromPath, toPath }) => [stripSlash(fromPath), toPath])
);

// Preview-mode posts get built (shareable, noindex) but stay out of the sitemap
let previewSlugs = [];
try {
  const res = await fetch(
    'https://cms.ridgemarketing.com/wp-json/wp/v2/posts?per_page=100&_fields=slug,acf.additional_blog_fields'
  );
  if (res.ok) {
    const posts  = await res.json();
    previewSlugs = posts
      .filter((p) => p.acf?.additional_blog_fields?.preview_mode)
      .map((p) => p.slug);
  }
} catch (err) {
  console.warn('[sitemap] could not fetch preview-mode slugs:', err.message);
}

export default defineConfig({
  site: 'https://ridgemarketing.com', // canonical host — www 301s to the apex
  output: 'static',
  adapter: netlify(),
  integrations: [react(), sitemap({
    // Same exclusions as the Gatsby sitemap plugin, plus preview-mode posts
    filter: (page) =>
      !page.includes('/lander/') &&
      !page.includes('/thank-you') &&
      !page.includes('/wrapped_2024/') &&
      !previewSlugs.some((slug) => page.endsWith(`/blog/${slug}/`)),
  }), partytown({
    // Third-party scripts (GTM and everything it loads: GA4, Meta Pixel,
    // LinkedIn Insight, OpenAI pixel, Mouseflow) run in a web worker.
    config: {
      // Main-thread calls that must reach the worker copies of these globals.
      // The forms push conversion events with dataLayer.push.
      forward: ['dataLayer.push', 'fbq', 'lintrk', 'oaiq', '_mfq.push'],
      // Partytown fetches scripts from the worker, which needs CORS. These hosts
      // don't send it, so their scripts go through a same-origin proxy
      // (public/_redirects in production, vite.server.proxy in dev).
      // Must stay self-contained — Partytown serializes this function.
      resolveUrl: (url, location, type) => {
        const proxied = ['connect.facebook.net', 'bzrcdn.openai.com'];
        if (type === 'script' && proxied.includes(url.hostname)) {
          return new URL(`/partytown-proxy/${url.hostname}${url.pathname}${url.search}`, location.origin);
        }
        return url;
      },
    },
  })],
  vite: {
    plugins: [tailwindcss()],
    // Dev equivalent of the /wp-content/uploads/* proxy in public/_redirects
    server: {
      proxy: {
        '/wp-content/uploads': {
          target      : 'https://cms.ridgemarketing.com',
          changeOrigin: true,
        },
        // Dev equivalent of the /partytown-proxy/* rules in public/_redirects
        '/partytown-proxy/connect.facebook.net': {
          target      : 'https://connect.facebook.net',
          changeOrigin: true,
          rewrite     : (path) => path.replace(/^\/partytown-proxy\/connect\.facebook\.net/, ''),
        },
        '/partytown-proxy/bzrcdn.openai.com': {
          target      : 'https://bzrcdn.openai.com',
          changeOrigin: true,
          rewrite     : (path) => path.replace(/^\/partytown-proxy\/bzrcdn\.openai\.com/, ''),
        },
      },
    },
  },
  image: {
    domains: ['cms.ridgemarketing.com'],
  },
  redirects,
});