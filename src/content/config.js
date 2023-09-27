import { defineCollection, z } from 'astro:content';

const articleCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    icon: image(),
    type: z.string()
  }),
});

const tutorialCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    icon: image(),
    type: z.string()
  }),
});

const bookCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    author: z.string(),
    intro: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    dateRead: z.date(),
    cover: image(),
    type: z.string(),
    rating: z.number(),
  }),
});

export const collections = {
  "articles": articleCollection,
  "tutorials": tutorialCollection,
  "books": bookCollection,
};
