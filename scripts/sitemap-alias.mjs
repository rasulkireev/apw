import { copyFile } from 'node:fs/promises';

// Keep the legacy URL usable without maintaining a second route inventory.
// Register after @astrojs/sitemap so its complete index exists before copying.
export default function sitemapAlias() {
  return {
    name: 'sitemap-alias',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
      },
    },
  };
}
