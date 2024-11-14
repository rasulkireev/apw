import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import vercel from "@astrojs/vercel/serverless";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.rasulkireev.com",
  integrations: [tailwind(), vue(), mdx(), react(), sitemap()],
  output: "hybrid",
  adapter: vercel(),
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru"],
  },
  server: {
    headers: {
      '/.well-known/atproto-did': {
        'Content-Type': 'text/plain'
      }
    }
  }
});
