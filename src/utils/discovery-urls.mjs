// These collections have standalone routes in pages/[...slug].astro. Stored
// now/review entries do not: never invent a public URL from their slug.
const routedCollections = new Set(['articles', 'books', 'tutorials', 'recipes', 'prompts']);

export function localEntryUrl(entry, site) {
  if (!routedCollections.has(entry.collection)) return null;
  const local = new URL(`/${entry.slug}`, site);
  const canonical = entry.data.canonical ? new URL(entry.data.canonical) : local;
  // External canonical overrides do not move our local copy: that route still
  // uses Astro's directory URL. Keep feed readers on the author's own site.
  return canonical.origin === local.origin
    ? canonical.href
    : new URL(`/${entry.slug}/`, site).href;
}

const escapeXml = value => value.replace(/[<>&"']/g, character => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
})[character]);

export function feedItem(entry, site) {
  const link = localEntryUrl(entry, site);
  if (!link) throw new Error(`No standalone route for ${entry.collection}`);
  // @astrojs/rss otherwise regenerates the GUID from the changed link. Retain
  // existing identities so readers do not receive old articles as new items.
  const guid = new URL(`/${entry.slug}/`, site).href;
  return {
    title: entry.data.title,
    pubDate: entry.data.dateCreated,
    description: entry.data.description,
    link,
    customData: `<guid isPermaLink="true">${escapeXml(guid)}</guid>`,
  };
}
