// Use the same total ordering at build time and after browser filtering. Tied
// ratings/dates must not inherit Astro's asynchronous collection load order.
export function compareBooks(a, b, sortOption = 'rating-desc') {
  let primary;
  switch (sortOption) {
    case 'rating-asc': primary = a.rating - b.rating; break;
    case 'date-asc': primary = new Date(a.dateRead).getTime() - new Date(b.dateRead).getTime(); break;
    case 'date-desc': primary = new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime(); break;
    default: primary = b.rating - a.rating;
  }
  return primary || a.title.localeCompare(b.title, 'en')
    || a.author.localeCompare(b.author, 'en')
    || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0);
}
