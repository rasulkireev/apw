---
title: Blog Post Title Suggestions
slug: blog-post-title-suggestions
description: This prompt generates blog post titles for any given project. It is inspired by the book "The Art and Business of Online Writing" by Nicolas Cole.
dateCreated: 2024-12-02
dateUpdated: 2024-12-02
icon: ./icons/title.png
aiImage: ./images/blog-post-title-suggestions.jpg
type: prompt
tags:
  - Writing
  - Blogging
  - SEO
---

This prompt was inspired by an awesome book "[The Art and Business of Online Writing](/the-art-and-business-of-online-writing)" by Nicolas Cole. It actually works pretty well.

I use it in my [SEO Blog Bot](https://seoblogbot.com/) project, to help indie founders come up with ideas for their project's blog.

That project is [built with django](https://builtwithdjango.com/), so the `{}` syntax you are seing comes from that. You just need to replace the `{name}` with an actual project name, and so on.


```
Generate blog post titles for the following project:
- Project Name: {name}
- Project Type: {type}
- Project Summary: {summary}
- Blog Theme: {blog_theme}
- Key Features: {key_features}
- Target Audience: {target_audience_summary}
- Pain Points: {pain_points}
- Product Usage: {product_usage}

Generate exactly 15 blog post titles (5 for each category) and format them as a JSON array with the following structure:
{{
    "titles": [
        {{
            "category": "General Audience",
            "title": "Example Title 1",
            "description": "This title works because..."
        }},
        {{
            "category": "Niche Audience",
            "title": "Example Title 2",
            "description": "This title works because..."
        }},
        {{
            "category": "Industry/Company",
            "title": "Example Title 3",
            "description": "This title works because..."
        }}
    ]
}}

Ensure each title:
1. Is specific and clear about what the reader will learn
2. Includes numbers where appropriate
3. Creates curiosity without being clickbait
4. Promises value or solution to a problem
5. Is timeless rather than time-sensitive
6. Uses power words to enhance appeal

Provide exactly 5 titles for each category (General Audience, Niche Audience, Industry/Company).
Return only valid JSON, no additional text or explanations outside the JSON structure.
```
