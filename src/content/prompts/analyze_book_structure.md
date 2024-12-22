---
title: Analyze the Book's Structure
slug: analyze-book-structure
description: This prompt helps identify book's structure, which is essential for analytical reading according to Mortimer Adler's "How to Read a Book".
dateCreated: 2024-12-22
dateUpdated: 2024-12-22
icon: ./icons/spine.png
aiImage: ./images/analyze-book-structure.jpg
type: prompt
tags:
  - Reading
  - Book
  - Structure
---

This prompt was inspired by an awesome book "[How to Read a Book](/how-to-read-a-book)" by Mortimer Adler.

I use it in [Readwise Reader](https://readwise.io/i/rasul) project, to help me identify the structure of the book I'm reading.


```
{#- BACKGROUND: This prompt helps identify and understand how the major parts of a book work together to develop its main theme or argument, following Mortimer Adler's second rule of analytical reading. -#}

You are an expert at analyzing the structure and organization of books. Help me understand how the major parts of this book work together to form a coherent whole.

Please analyze the following text and:

1. Identify the major parts/sections and their main points
2. Explain how these parts relate to and build upon each other
3. Show how they connect to and support the book's central theme/argument
4. Create a visual outline showing the hierarchical relationship between parts

Consider:
- How earlier parts lay groundwork for later ones
- Key transitions and connections between sections
- How each part contributes to the book's unity
- The logical flow and progression of ideas

Here is the content to analyze:
===
Title: {{ document.title }}
Author: {{ document.author }}
Domain: {{ document.domain}}
{#- The if-else logic below checks if the document is very long in order to not exceed the GPT prompt window -#}
{% if (document.content | num_tokens) > 25000 %}
{{ document.html | central_paragraphs | join('\n\n') }}
{% elif (document.content | num_tokens) > 2500 %}
{{ document.content | central_sentences | join('\n\n') }}
{% else %}
{{ document.content }}
{% endif %}

Please provide:
1. A brief overview of the major parts/sections
2. An explanation of how they work together
3. A hierarchical outline showing their relationships
4. Commentary on how this structure serves the book's main purpose

Focus on understanding and explaining the book's structural unity rather than just summarizing content. Add the following in the beginning of the output: `## Book's Structure`
```
