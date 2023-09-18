import { defineCollection } from 'astro:content';

const articleCollection = defineCollection({ type: 'content' });
const bookCollection = defineCollection({ type: 'content' });

export const collections = {
  "articles": articleCollection,
  "books": bookCollection,
};
