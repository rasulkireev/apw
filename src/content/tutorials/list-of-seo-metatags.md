---
title: List of SEO Meta Tags I Use
dateCreated: 2023-10-24
dateUpdated: 2023-10-24
published: true
slug: list-of-seo-metatags
icon: ./icons/developer.svg
keywords: [HTML, SEO, Metatags]
category: Web Dev
type: tutotial
description: SEO Metatags I use in my articles... Done for my personal future references, since there are no such posts available online that are not overSEOed.
---

I just couldn't find a simple list of SEO metatags to use. Only over-SEOed articles (funne enough). So here is the list of all the SEO tags and Schema data I put on my articles:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Sample Webpage</title>
  <meta name="description" content="This is a sample webpage description.">
  <meta name="keywords" content="sample, webpage, meta tags, SEO">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/sample-webpage">

  <!-- OG Stuff -->
  <meta property="og:title" content="Sample Webpage">
  <meta property="og:description" content="This is a sample webpage description for social media sharing.">
  <meta property="og:image" content="https://example.com/sample-image.jpg">
  <link rel="canonical" href="https://example.com/sample-webpage">
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="en_US" />

  <!-- X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Sample Webpage">
  <meta name="twitter:description" content="This is a sample webpage description for social media sharing.">
  <meta name="twitter:image" content="https://example.com/sample-image.jpg">

  <!-- Schema.org -->
  <script type="application/ld+json">
  {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://example.com/sample-blog-post"
      },
      "headline": "Sample Blog Post Headline",
      "datePublished": "2022-01-01",
      "dateModified": "2022-01-02",
      "author": {
          "@type": "Person",
          "name": "John Doe"
      },
      "publisher": {
          "@type": "Organization",
          "name": "Example Publisher",
          "logo": {
              "@type": "ImageObject",
              "url": "https://example.com/logo.png",
              "width": 600,
              "height": 60
          }
      },
      "description": "This is a sample blog post description.",
      "image": {
          "@type": "ImageObject",
          "url": "https://example.com/sample-image.jpg",
          "width": 800,
          "height": 600
      }
  }
  </script>
</head>
```
