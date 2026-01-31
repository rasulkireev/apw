import { defineConfig, passthroughImageService } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.rasulkireev.com",
  image: {
    service: passthroughImageService()
  },
  integrations: [tailwind(), vue(), mdx(), react(), sitemap()],
  output: "static",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru"],
  },
});
