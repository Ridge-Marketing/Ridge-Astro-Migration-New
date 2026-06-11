import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';
import redirectEntries from './redirects.json';

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
  site: 'https://www.ridgemarketing.com',
  output: 'static',
  adapter: netlify(),
  integrations: [
    react(),
    sitemap({
      // Same exclusions as the Gatsby sitemap plugin, plus preview-mode posts
      filter: (page) =>
        !page.includes('/lander/') &&
        !page.includes('/thank-you') &&
        !page.includes('/wrapped_2024/') &&
        !previewSlugs.some((slug) => page.endsWith(`/blog/${slug}/`)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: ['cms.ridgemarketing.com'],
  },
  redirects,
});
