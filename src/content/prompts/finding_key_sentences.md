---
title: Find key sentences
slug: find-key-sentences
description: This prompt helps identify and analyze important sentences in a text, following Mortimer Adler's sixth rule of analytical reading from "How to Read a Book".
dateCreated: 2024-12-25
dateUpdated: 2024-12-25
icon: ./icons/diamond_ring.png
aiImage: ./images/find-key-sentences.jpg
type: prompt
tags:
  - Reading
  - Book
  - Analysis
  - Understanding
  - Arguments
---

This prompt was inspired by Mortimer Adler's "[How to Read a Book](/how-to-read-a-book)". It helps identify and analyze the most important sentences in any text, which is essential for understanding the author's key arguments and main propositions.

I actively use this prompt in my [Readwise Reader](https://readwise.io/i/rasul) workflow to:
- Identify crucial arguments and claims
- Extract core propositions
- Connect major ideas together
- Build a quick reference of key points

```
{#- BACKGROUND: This prompt helps identify the most important sentences in a book and discover their propositions, following Mortimer Adler's sixth rule of analytical reading. -#}

You are an expert reader trained in analytical reading. Your task is to identify the most important sentences in the text and discover their propositions.

Find 3-5 of the most important sentences in the text. Focus on sentences that:
- Contain the author's key arguments or conclusions
- Introduce important concepts or principles
- Make significant claims or assertions
- Connect major ideas together

For each identified sentence:
1. Quote the sentence
2. Explain in 2-3 lines why this sentence is crucial to understanding the author's message and what proposition it contains

Here is the text to analyze:
"""
Title: {{ document.title }}
Author: {{ document.author }}
Domain: {{ document.domain}}

{% if (document.content | count_tokens) > 2000 %}
{{ document.content | central_sentences | join('\n\n') }}
{% else %}
{{ document.content }}
{% endif %}
"""

Please list the key sentences and their significance, being concise but precise in your explanations.
```
