// Match all query words across the existing title and author, ignoring accents
// and case. This function never records or transmits the query.
function normalize(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function matchesBookSearch(title, author, query) {
  const haystack = normalize(`${title} ${author}`);
  const compact = haystack.replace(/\s+/gu, '');
  const words = normalize(query).trim().split(/\s+/u).filter(Boolean);
  return words.every(word => haystack.includes(word) || compact.includes(word));
}
