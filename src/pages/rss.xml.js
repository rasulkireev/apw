import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { feedItem } from '../utils/discovery-urls.mjs';


export async function GET(context) {
  const articleEntries = await getCollection('articles');
  const bookEntries = await getCollection('books');
  const tutorialEntries = await getCollection('tutorials');

  const entries = [
    ...articleEntries,
    ...bookEntries,
    ...tutorialEntries
  ];

  return rss({
    title: "Rasul's Blog",
    description: "Rasul's thoughts on things",
    site: context.site,
    items: entries.map((post) => feedItem(post, context.site)),
  });
}
