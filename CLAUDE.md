# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website built with Astro, featuring a content-driven architecture with multiple content types including articles, tutorials, book notes, prompts, recipes, and more. The site uses Astro's content collections system for structured content management.

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` or `pnpm start` | Start development server at localhost:4321 |
| `pnpm run build` | Build production site to ./dist/ |
| `pnpm run preview` | Preview production build locally |
| `pnpm run astro` | Run Astro CLI commands |

## Architecture & Structure

### Content Collections
The site uses Astro's content collections defined in `src/content/config.js`:

- **articles/**: Blog posts and personal writing
- **tutorials/**: Technical how-to guides
- **books/**: Book reviews and notes with ratings, covers, affiliate links
- **prompts/**: AI prompts collection
- **recipes/**: Personal recipe collection
- **now/**: "Now page" updates
- **reviews/**: General reviews

### Technology Stack
- **Framework**: Astro with static output
- **Styling**: Tailwind CSS with typography plugin
- **UI Components**: Mix of Vue.js, React, and Astro components
- **Content**: MDX and Markdown with frontmatter schemas
- **Deployment**: Vercel adapter configured
- **Package Manager**: pnpm (lock file present)

### Content Schema Requirements
Each content type has specific frontmatter requirements:
- Articles/Tutorials require: title, description, dateCreated, dateUpdated, type, icon
- Books additionally require: author, rating, cover, dateRead, category
- Optional fields include social media links, AI-generated images, and tags

### Component Architecture
- Mixed framework approach with Vue (`*.vue`), React (`*.tsx`/`*.jsx`), and Astro (`*.astro`) components
- If writing components prefer React of Astro framework for the syntax
- Components include: BookHeader, TableOfContents, SocialShareButtons, Newsletter signup
- Layout system with BaseLayout and PostLayout

### Internationalization
Site supports English (default) and Russian locales configured in astro.config.mjs.

### Asset Management
- Images stored in `src/assets/` and `src/content/[collection]/images/`
- Icons organized per content type in dedicated icon folders
- Public assets in `public/` directory

### Testing
- To test if the updates work correctly run `pnpm run build`
