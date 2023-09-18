import { defineCollection, z } from 'astro:content';

const articleCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    icon: image()
  }),
});

const bookCollection = defineCollection({ type: 'content' });

export const collections = {
  "articles": articleCollection,
  "books": bookCollection,
};
