# Reading layout regression check

Use a fresh browser context against the production-shaped build, then repeat against the deployed site. Block analytics and all non-GET requests; do not submit the newsletter or activate external sharing links.

Check existing tutorials (`/creating-ethereum-token-with-python`, `/managing-django-with-poetry`, `/django-venv`), a review (`/how-to-read-a-book`), and an article (`/gateway-to-great-books`) at 320, 390, 768, 1024, 1280, 1536, and 1920 CSS pixels. Repeat representative mobile and wide cases in dark mode. Wait for hydration before checking controls.

Run this in the browser console at each size; a document-wide scrollbar or an overlaid TOC fails the check:

```js
const article = document.querySelector('article').getBoundingClientRect();
const sidebar = document.querySelector('nav.table-of-contents')?.parentElement.getBoundingClientRect();
console.assert(document.documentElement.scrollWidth <= innerWidth, 'Document overflows');
console.assert(!sidebar?.width || sidebar.right <= article.left || sidebar.left >= article.right, 'TOC overlaps article');
```

- Below 1536px, open the inline TOC with its labeled button. Verify `aria-expanded`, follow a heading link, reopen, and click outside to close. There must be no fixed sidebar covering text.
- At 1536px and above, verify TOC links remain usable in the right sidebar without intersecting the article or left sharing controls.
- On the ERC20 tutorial, the existing inline contract address must wrap on mobile. Wide code blocks must still scroll horizontally without changing their text/whitespace, and Copy must copy the complete original snippet. Narrow sharing controls must wrap, not widen the document.
- Compare generated and deployed article text, code blocks, links, metadata, JSON-LD and canonical URLs with the pre-change output. Keep all routes and editorial source files unchanged. For archive cards with tied sort keys, compare complete card sets rather than requiring build-dependent tie ordering.

These are responsive-layout checks, not field Core Web Vitals or evidence of search/conversion uplift.
