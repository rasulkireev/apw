---
title: Unity of the Book
slug: unity-of-the-book
description: This prompt helps identify the kind of book you are about to read, which is essential for analytical reading according to Mortimer Adler's "How to Read a Book".
dateCreated: 2024-12-22
dateUpdated: 2024-12-22
icon: ./icons/link.png
aiImage: ./images/unity-of-the-book.jpg
type: prompt
tags:
  - Reading
  - Book
---

This prompt was inspired by an awesome book "[How to Read a Book](/how-to-read-a-book)" by Mortimer Adler.

I use it in [Readwise Reader](https://readwise.io/i/rasul) project, to help me identify the main theme of the book


```
{#- BACKGROUND: This prompt helps identify and articulate the unity or main theme of a book in a single sentence or short paragraph, following Mortimer Adler's second rule of analytical reading from "How to Read a Book". -#}
Your task is to analyze the following text and express its fundamental unity - the single main point or theme that the entire work revolves around - in one sentence, or at most a short paragraph.

===
Title: {{ document.title }}
Author: {{ document.author }}
Domain: {{ document.domain}}
{% if (document.content | num_tokens) > 25000 %}
{{ document.html | central_paragraphs | join('\n\n') }}
{% elif (document.content | num_tokens) > 2500 %}
{{ document.content | central_sentences | join('\n\n') }}
{% else %}
{{ document.content }}
{% endif %}

INSTRUCTIONS:
1. Consider what single, central point the author is trying to communicate
2. Identify how all major arguments or sections of the book support this central point
3. Express this unity in ONE sentence, or if absolutely necessary, a very short paragraph
4. Focus on WHAT the book is about as a whole, not its method or structure
5. Avoid merely describing what the book talks about; instead, capture its essential message or argument

Format your response as follows:
## Unity Statement
[Your one-sentence or short paragraph response here]

IMPORTANT:
- Be concise but complete
- Capture the essence, not just the topic
- Express the unity in a way that shows how all parts of the book relate to this central point
- Avoid listing multiple main points; find the ONE unifying idea
```
