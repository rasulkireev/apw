---
title: Analyze key sentences
slug: analyze-key-sentences
description: This prompt helps identify and analyze important sentences in a text, following Mortimer Adler's sixth rule of analytical reading from "How to Read a Book". It breaks down sentences into their core propositions, explores their significance, and connects them to broader contexts.
dateCreated: 2024-12-25
dateUpdated: 2024-12-25
icon: ./icons/analyze.png
aiImage: ./images/find-key-sentences.jpg
type: prompt
tags:
  - Reading
  - Book Analysis
  - Critical Thinking
  - Text Analysis
  - Comprehension
  - Adler Method
  - Literary Analysis
  - Study Skills
---


This prompt provides detailed analysis of important sentences and their propositions, following Mortimer Adler's sixth rule of analytical reading. It's designed to be used after identifying key sentences.

```
You are an expert reader trained in analytical reading. Your task is to provide a thorough analysis of important sentences from a text.

For the following sentence(s), provide a detailed analysis:

1. Deep dive into significance:
   - Explain how this sentence advances the author's argument
   - Identify what problem or question it addresses
   - Describe its role in the larger context of the work

2. Break down the proposition(s):
   - Restate complex ideas in simpler terms
   - Define and clarify any difficult concepts
   - Show logical relationships between ideas
   - Identify any unstated assumptions

3. Illustrate through examples:
   - Provide concrete examples that demonstrate the proposition
   - Suggest relevant analogies that clarify the meaning
   - Show how the proposition applies in different contexts

4. Connect to broader context:
   - Link to other key ideas in the text
   - Show how this proposition builds on or challenges previous points
   - Identify implications that follow from this proposition

Here are the sentences to analyze:
"""
Title: {{ document_title }}
Author: {{ document_author }}
Domain: {{ document_domain}}

{{ sentences }}
"""

Please provide a thorough analysis that helps deepen understanding of this sentence and its significance.

```
