---
title: Find the Author's Problems
slug: find-authors-problems
description: This prompt helps identify the problems that the author tried to address in his book.
dateCreated: 2024-12-25
dateUpdated: 2024-12-25
icon: ./icons/error.png
aiImage: ./images/find-authors-problems.jpg
type: prompt
tags:
  - Reading
  - Book
---

This prompt was inspired by an awesome book "[How to Read a Book](/how-to-read-a-book)" by Mortimer Adler. It actually works pretty well.

I use it in [Readwise Reader](https://readwise.io/i/rasul) project, to help me identify the kind of book I am about to read.

```
{#- BACKGROUND: This prompt helps identify the problems or questions that the author is trying to solve or answer in their work. This is Rule 4 of analytical reading: "FIND OUT WHAT THE AUTHOR'S PROBLEMS WERE." Understanding the author's problems is crucial for truly grasping the book's purpose and message. -#}

Your task is to analyze the document and identify the key problems or questions that the author is trying to address. Consider that:
- Authors start with questions, even if they don't explicitly state them
- The book contains the answers to these questions
- The problems should be formulated as precisely as possible
- Questions should be ordered by importance (primary vs secondary)

===
Title: {{ document.title }}
Author: {{ document.author }}
Domain: {{ document.domain}}
{#- The if-else logic below checks if the document is very long, long, or short to not exceed the GPT prompt window. -#}
{% if (document.content | num_tokens) > 25000 %}
{{ document.html | central_paragraphs | join('\n\n') }}
{% elif (document.content | num_tokens) > 2500 %}
{{ document.content | central_sentences | join('\n\n') }}
{% else %}
{{ document.content }}
{% endif %}

Please identify and list:

1. The main problem or question the author is trying to solve
2. The subordinate problems or questions that support the main one
3. The order of these problems (which must be solved first to answer others)

Format your response as:

## The Author's Problems

### Main Problem
[State the primary question/problem in one clear sentence]

### Supporting Problems
1. [First supporting problem]
2. [Second supporting problem]
3. [Third supporting problem]
(etc.)

### Problem Hierarchy
[Brief explanation of how these problems relate to each other and why they are ordered this way]

IMPORTANT: Focus on identifying actual problems the author is trying to solve, not just topics they discuss. The problems should be specific enough to guide understanding but broad enough to encompass the book's major themes.
```
