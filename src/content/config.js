import { defineCollection, z } from 'astro:content';

const articleCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    canonical: z.string().optional(),
    description: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    type: z.string(),
    icon: image(),
    twitterLink: z.string().optional(),
    hnLink: z.string().optional(),
    redditLink: z.string().optional(),
    indiehackersLink: z.string().optional(),
    aiImage: image().optional(),
    aiPrompt: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
});

const tutorialCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    canonical: z.string().optional(),
    description: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    icon: image(),
    type: z.string(),
    aiImage: image().optional(),
    aiPrompt: z.string().optional(),
    twitterLink: z.string().optional(),
    hnLink: z.string().optional(),
    redditLink: z.string().optional(),
    indiehackersLink: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
});

const bookCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    canonical: z.string().optional(),
    author: z.string(),
    rating: z.number(),
    description: z.string(),
    cover: image(),
    dateRead: z.date(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    category: z.string(),
    type: z.string(),
    hasSummaries: z.boolean().optional(),
    notAffiliateLink: z.string().optional(),
    affiliateLink: z.string().optional(),
    unsplashImageID: z.string().optional(),
    aiImage: image().optional(),
    aiPrompt: z.string().optional(),
    twitterLink: z.string().optional(),
    hnLink: z.string().optional(),
    redditLink: z.string().optional(),
    indiehackersLink: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const nowCollection = defineCollection({
  type: "content"
})

const recipeCollection = defineCollection({
  type: "content"
})

const reviewsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    dateCreated: z.date(),
    dateUpdated: z.date(),
    type: z.string(),
    icon: image(),
    twitterLink: z.string().optional(),
    hnLink: z.string().optional(),
    redditLink: z.string().optional(),
    indiehackersLink: z.string().optional(),
    aiImage: image().optional(),
    aiPrompt: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
});

export const collections = {
  "articles": articleCollection,
  "tutorials": tutorialCollection,
  "books": bookCollection,
  "now": nowCollection,
  "recipes": recipeCollection,
  "reviews": reviewsCollection,
};
