import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import vercel from "@astrojs/vercel/serverless";
import mdx from "@astrojs/mdx";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://rasulkireev.com",
  integrations: [tailwind(), vue(), mdx(), react()],
  output: "hybrid",
  adapter: vercel()
});