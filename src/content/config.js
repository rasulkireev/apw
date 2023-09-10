import { defineCollection } from 'astro:content';

const articleCollection = defineCollection({ type: 'content', });

export const collections = {
  'article': articleCollection,
};
