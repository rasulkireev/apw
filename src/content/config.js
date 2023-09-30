import { defineCollection, z } from 'astro:content';

const articleCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    twitterLink: z.string().optional(),
    hnLink: z.string().optional(),
    redditLink: z.string().optional(),
    indiehackersLink: z.string().optional(),
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
    twitterLink: z.string().optional(),
    hnLink: z.string().optional(),
    redditLink: z.string().optional(),
    indiehackersLink: z.string().optional(),
    category: z.string().optional(),
    icon: image(),
    type: z.string()
  }),
});

const bookCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    author: z.string(),
    description: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    twitterLink: z.string().optional(),
    hnLink: z.string().optional(),
    redditLink: z.string().optional(),
    indiehackersLink: z.string().optional(),
    dateRead: z.date(),
    cover: image(),
    type: z.string(),
    rating: z.number(),
    notAffiliateLink: z.string().optional(),
    affiliateLink: z.string().optional(),
  }),
});

export const collections = {
  "articles": articleCollection,
  "tutorials": tutorialCollection,
  "books": bookCollection,
};
