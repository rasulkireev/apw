import { getCollection } from 'astro:content';

export async function GET(context) {
  const siteUrl = 'https://www.rasulkireev.com';

  // Get all content collections
  const articleEntries = await getCollection('articles');
  const bookEntries = await getCollection('books');
  const tutorialEntries = await getCollection('tutorials');
  const promptEntries = await getCollection('prompts');
  const recipeEntries = await getCollection('recipes');
  const nowEntries = await getCollection('now');
  const reviewEntries = await getCollection('reviews');

  // Get all unique tags for tag pages
  const allContent = [...articleEntries, ...bookEntries, ...tutorialEntries, ...promptEntries, ...recipeEntries, ...nowEntries, ...reviewEntries];
  const allTags = [...new Set(
    allContent.flatMap(item => item.data.tags || [])
  )];

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' }, // Homepage
    { url: 'about', priority: '0.8', changefreq: 'monthly' },
    { url: 'articles', priority: '0.9', changefreq: 'weekly' },
    { url: 'book-notes', priority: '0.9', changefreq: 'weekly' },
    { url: 'tutorials', priority: '0.9', changefreq: 'weekly' },
    { url: 'recipes', priority: '0.7', changefreq: 'monthly' },
    { url: 'prompts', priority: '0.8', changefreq: 'weekly' },
    { url: 'projects', priority: '0.8', changefreq: 'monthly' },
    { url: 'favourites', priority: '0.7', changefreq: 'monthly' },
    { url: 'lists', priority: '0.7', changefreq: 'monthly' },
    { url: 'tags', priority: '0.6', changefreq: 'weekly' },
    { url: 'uses', priority: '0.6', changefreq: 'monthly' },
    { url: 'now', priority: '0.7', changefreq: 'weekly' },
    { url: 'stats', priority: '0.5', changefreq: 'monthly' },
    { url: 'newsletter', priority: '0.7', changefreq: 'monthly' },
    { url: 'project-ideas', priority: '0.6', changefreq: 'monthly' },
    { url: 'free-books-and-courses', priority: '0.7', changefreq: 'monthly' },
    { url: 'slashes', priority: '0.5', changefreq: 'yearly' }
  ];

  // Helper function to format date for sitemap
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Helper function to determine content priority and changefreq
  function getContentMetadata(entry) {
    const daysSinceUpdate = entry.data.dateUpdated ?
      Math.floor((new Date() - new Date(entry.data.dateUpdated)) / (1000 * 60 * 60 * 24)) :
      365; // Default to old if no update date

    let changefreq = 'monthly';
    let priority = '0.6';

    if (entry.data.type === 'book') {
      priority = '0.7';
      changefreq = 'monthly';
    } else if (entry.data.type === 'article') {
      priority = '0.8';
      changefreq = daysSinceUpdate < 30 ? 'weekly' : 'monthly';
    } else if (entry.data.type === 'tutorial') {
      priority = '0.7';
      changefreq = 'monthly';
    } else if (entry.data.type === 'prompt') {
      priority = '0.6';
      changefreq = 'monthly';
    } else if (entry.data.type === 'recipe') {
      priority = '0.5';
      changefreq = 'yearly';
    } else if (entry.collection === 'now') {
      priority = '0.7';
      changefreq = 'weekly';
    } else if (entry.collection === 'reviews') {
      priority = '0.6';
      changefreq = 'monthly';
    }

    return { priority, changefreq };
  }

  // Build sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages
  for (const page of staticPages) {
    const url = page.url ? `${siteUrl}/${page.url}/` : `${siteUrl}/`;
    sitemap += `
  <url>
    <loc>${url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  // Add content pages
  for (const entry of allContent) {
    const { priority, changefreq } = getContentMetadata(entry);
    const lastmod = entry.data.dateUpdated ?
      formatDate(new Date(entry.data.dateUpdated)) :
      (entry.data.dateCreated ? formatDate(new Date(entry.data.dateCreated)) : '');

    sitemap += `
  <url>
    <loc>${siteUrl}/${entry.slug}/</loc>`;

    if (lastmod) {
      sitemap += `
    <lastmod>${lastmod}</lastmod>`;
    }

    sitemap += `
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  // Add tag pages
  for (const tag of allTags) {
    const encodedTag = encodeURIComponent(tag);
    sitemap += `
  <url>
    <loc>${siteUrl}/tag/${encodedTag}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
  }

  sitemap += `
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
}
