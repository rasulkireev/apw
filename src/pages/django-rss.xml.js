import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { feedItem } from '../utils/discovery-urls.mjs';


export async function GET(context) {
  const entries = await getCollection('tutorials');
  const filteredEntries = entries.filter((entry) => entry.data.category === 'Django');

  return rss({
    title: "Rasul's Django Blog",
    description: "Rasul's Django Tutorials",
    site: context.site,
    items: filteredEntries.map((post) => feedItem(post, context.site)),
  });
}
