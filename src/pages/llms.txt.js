import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

export async function GET(context) {
  // Get all content collections
  const articleEntries = await getCollection('articles');
  const bookEntries = await getCollection('books');
  const tutorialEntries = await getCollection('tutorials');
  const promptEntries = await getCollection('prompts');
  const recipeEntries = await getCollection('recipes');
  const nowEntries = await getCollection('now');
  const reviewEntries = await getCollection('reviews');

  // Combine all content entries
  const allContentEntries = [
    ...articleEntries,
    ...bookEntries,
    ...tutorialEntries,
    ...promptEntries,
    ...recipeEntries,
    ...nowEntries,
    ...reviewEntries
  ];

  // Helper function to extract content from .astro files and convert to markdown
  function extractContentFromAstro(filePath) {
    try {
      const fullPath = path.join(process.cwd(), 'src/pages', filePath);
      const fileContent = fs.readFileSync(fullPath, 'utf-8');

      // Extract content between the HTML tags
      const htmlMatch = fileContent.match(/<BaseLayout[^>]*>([\s\S]*?)<\/BaseLayout>/);
      if (!htmlMatch) return '';

      let content = htmlMatch[1];

      // Remove Astro components but preserve their content
      content = content.replace(/<[A-Z][^>]*\/>/g, ''); // Self-closing components
      content = content.replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, ''); // Component tags

      // Convert HTML to Markdown
      // Headers
      content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
      content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
      content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
      content = content.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1');
      content = content.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1');
      content = content.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1');

      // Links
      content = content.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

      // Bold and italic
      content = content.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
      content = content.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
      content = content.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
      content = content.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

      // Lists
      content = content.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, listContent) => {
        return listContent.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1').trim();
      });
      content = content.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, listContent) => {
        let counter = 1;
        return listContent.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1`).trim();
      });

      // Paragraphs - convert to double newlines
      content = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

      // Line breaks
      content = content.replace(/<br\s*\/?>/gi, '\n');

      // Code blocks and inline code
      content = content.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```');
      content = content.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

      // Remove remaining HTML tags
      content = content.replace(/<[^>]*>/g, '');

      // Remove Astro expressions
      content = content.replace(/\{[^}]*\}/g, '');

      // Clean up whitespace and decode HTML entities
      content = content
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize multiple newlines
        .replace(/[ \t]+/g, ' ') // Normalize spaces
        .trim();

      return content;
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return `Error reading content from ${filePath}`;
    }
  }

  // Helper function to get page title from .astro file
  function extractTitleFromAstro(filePath) {
    try {
      const fullPath = path.join(process.cwd(), 'src/pages', filePath);
      const fileContent = fs.readFileSync(fullPath, 'utf-8');

      // Extract pageTitle from the frontmatter
      const titleMatch = fileContent.match(/const pageTitle = ["'`]([^"'`]+)["'`]/);
      if (titleMatch) {
        return titleMatch[1];
      }

      // Fallback: extract from h1 tag
      const h1Match = fileContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
      if (h1Match) {
        return h1Match[1].replace(/\{[^}]*\}/g, '').trim();
      }

      return `Page: ${filePath}`;
    } catch (error) {
      console.error(`Error extracting title from ${filePath}:`, error);
      return `Page: ${filePath}`;
    }
  }

  // Static pages to read dynamically
  const staticPageFiles = [
    { file: 'about.astro', url: '/about' },
    { file: 'projects.astro', url: '/projects' },
    { file: 'uses.astro', url: '/uses' },
    { file: 'favourites.astro', url: '/favourites' },
    { file: 'project-ideas.astro', url: '/project-ideas' },
    { file: 'lists.astro', url: '/lists' },
    { file: 'index.astro', url: '/' }
  ].filter(({ file }) => {
    // Only include files that actually exist
    try {
      const fullPath = path.join(process.cwd(), 'src/pages', file);
      return fs.existsSync(fullPath);
    } catch {
      return false;
    }
  });

  // Generate static pages content dynamically
  const staticPages = staticPageFiles.map(({ file, url }) => ({
    title: extractTitleFromAstro(file),
    url: url,
    content: extractContentFromAstro(file)
  }));

  // Helper function to render content entry
  async function renderContentEntry(entry) {
    let output = `# ${entry.data.title}\n`;
    output += `URL: ${context.site}${entry.slug}/\n`;
    output += `Type: ${entry.data.type || 'content'}\n`;
    output += `Date: ${entry.data.dateCreated ? entry.data.dateCreated.toISOString().split('T')[0] : 'Unknown'}\n`;

    if (entry.data.description) {
      output += `Description: ${entry.data.description}\n`;
    }

    if (entry.data.author) {
      output += `Author: ${entry.data.author}\n`;
    }

    if (entry.data.tags && entry.data.tags.length > 0) {
      output += `Tags: ${entry.data.tags.join(', ')}\n`;
    }

    // Get raw content (markdown) - full content without truncation
    let rawContent = entry.body || '';

    // For book posts, remove AI-generated sections
    if (entry.data.type === 'book') {
      // Remove "How to Read a Book Analysis" section and everything after it
      rawContent = rawContent.replace(/## '\[How to Read a Book\]\(\/how-to-read-a-book\)' Analysis[\s\S]*$/i, '');

      // Remove "Highlights" section and everything after it
      rawContent = rawContent.replace(/## Highlights[\s\S]*$/i, '');

      // Clean up any trailing whitespace
      rawContent = rawContent.trim();
    }

    output += `\nContent:\n${rawContent}\n\n`;
    output += '---\n\n';

    return output;
  }

  // Build the complete text content
  let textContent = `# Rasul Kireev's Website Content\n\n`;
  textContent += `This is a machine-readable version of all content from rasulkireev.com\n`;
  textContent += `Generated on: ${new Date().toISOString()}\n`;
  textContent += `Total content pieces: ${allContentEntries.length + staticPages.length}\n\n`;
  textContent += `===\n\n`;

  // Add static pages
  textContent += `## Static Pages\n\n`;
  for (const page of staticPages) {
    textContent += `# ${page.title}\n`;
    textContent += `URL: ${context.site}${page.url}\n`;
    textContent += `Type: static-page\n\n`;
    textContent += `Content:\n${page.content}\n\n`;
    textContent += '---\n\n';
  }

  // Add all content entries
  textContent += `## Content Collections\n\n`;

  // Sort entries by date (newest first)
  const sortedEntries = allContentEntries.sort((a, b) => {
    const dateA = a.data.dateUpdated || a.data.dateCreated || new Date(0);
    const dateB = b.data.dateUpdated || b.data.dateCreated || new Date(0);
    return dateB.valueOf() - dateA.valueOf();
  });

  // Process each content entry
  for (const entry of sortedEntries) {
    try {
      const entryText = await renderContentEntry(entry);
      textContent += entryText;
    } catch (error) {
      console.error(`Error processing entry ${entry.slug}:`, error);
      // Add basic info even if rendering fails
      textContent += `# ${entry.data.title}\n`;
      textContent += `URL: ${context.site}${entry.slug}/\n`;
      textContent += `Type: ${entry.data.type || 'content'}\n`;
      textContent += `Error: Could not render content\n\n`;
      textContent += '---\n\n';
    }
  }

  return new Response(textContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
