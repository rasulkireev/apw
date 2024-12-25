---
title: Find Key Terms
slug: find-key-terms
description: This prompt helps identify and analyze important terms in a text, following Mortimer Adler's fifth rule of analytical reading from "How to Read a Book".
dateCreated: 2024-12-25
dateUpdated: 2024-12-25
icon: ./icons/key.png
aiImage: ./images/find-key-terms.jpg
type: prompt
tags:
  - Reading
  - Book
  - Analysis
  - Vocabulary
  - Understanding
---

This prompt was inspired by Mortimer Adler's "[How to Read a Book](/how-to-read-a-book)". It helps identify and understand key terms in any text, which is crucial for deep comprehension and analytical reading.

I actively use this prompt in my [Readwise Reader](https://readwise.io/i/rasul) workflow to:
- Identify crucial terminology
- Understand special usage of common words
- Connect key terms to main arguments
- Build a quick reference glossary

```
{#- BACKGROUND: This prompt helps identify and understand key terms in a text, following Mortimer Adler's fifth rule of analytical reading: "FIND THE IMPORTANT WORDS AND THROUGH THEM COME TO TERMS WITH THE AUTHOR." -#}

Analyze the following text and help me:

1. Identify the most important words that:
   - Give me trouble understanding
   - Are used in an unusual or special way
   - Appear to be crucial for understanding the author's message
   - Are used repeatedly throughout the text

2. For each important word found:
   - Show how the author uses it in context
   - Explain its specific meaning in this text
   - Compare it with its common usage (if different)
   - Connect it to the author's main arguments

===
Title: {{ document.title }}
Author: {{ document.author }}
Domain: {{ document.domain}}
{#- The if-else logic below checks if the document is long. If so, it will use key sentences to not exceed the GPT prompt window. We highly recommend not changing this unless you know what you're doing. -#}
{% if (document.content | count_tokens) > 2000 %}
{{ document.content | central_sentences | join('\n\n') }}
{% else %}
{{ document.content }}
{% endif %}
===

Present your findings in this format:

## Quick Reference
- [Word 1]: Simple explanation in 10-15 words
- [Word 2]: Simple explanation in 10-15 words
[etc.]

## Detailed Analysis

### [Word 1]
- Context: [relevant quote(s) showing usage]
- Author's Usage: [specific meaning in text]
- Common Usage: [if different from author's usage]
- Connection to Main Arguments: [how it relates to key points]

[Repeat for each important word]

IMPORTANT: Focus on words that are truly significant for understanding the author's message. Quality over quantity. The Quick Reference section should be easily scannable and understood by anyone.
```
