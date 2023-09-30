import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';


export async function GET(context) {
  const entries = await getCollection('tutorials');
  const filteredEntries = entries.filter((entry) => entry.data.category === 'Django');

  return rss({
    title: "Rasul's Django Blog",
    description: "Rasul's Django Tutorials",
    site: context.site,
    items: filteredEntries.map((post) => ({
      title: post.data.title,
      pubDate: post.data.dateCreated,
      description: post.data.description,
      link: `/${post.slug}/`,
    })),
  });
}
