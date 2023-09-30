import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';


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
    items: entries.map((post) => ({
      title: post.data.title,
      pubDate: post.data.dateCreated,
      description: post.data.description,
      link: `/${post.slug}/`,
    })),
  });
}
