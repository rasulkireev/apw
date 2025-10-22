---
title: Cleanapp and Fast Shipping
dateCreated: 2025-10-21
dateUpdated: 2025-10-21
published: true
slug: cleanapp
icon: ./icons/rocket.svg
aiImage: ./images/shipping_fast_with_the_right_tools.webp
aiPrompt: abstract image showing rapid development and deployment, code transforming into a live website, speed and efficiency in software development
tags:
  - "Django"
  - "SaaS"
  - "Indie-Hacking"
  - "Productivity"
  - "Development"
category: Development
type: article
description: Building and deploying Cleanapp in just a few hours using Django CookieCutter starter and AI-assisted coding. How the right tools and approach can turn an idea into a live product incredibly fast.
---


Yesterday, I was reading [my feed](https://readwise.io/i/rasul) and ran into [Justin Duke](https://jmduke.com/)'s [post](https://weeknotes.buttondown.email/archive/mise-incidents-anki-dogfooding-the-api/) from his [Weeknotes newsletter](https://weeknotes.buttondown.email/). In it, he had an interesting paragraph:

> I want a service that every morning sends me a random entry from my sitemap so that I can go through and review it for outdated copy or screenshots.

This was supposed to help with pages containing old content, old screenshots, or anything outdated. I thought it was an interesting idea, and more than that, it was a simple idea to implement.

So I got to work.

This morning, I quickly got my [Django SaaS Starter](https://github.com/rasulkireev/django-saas-starter) ready to generate the project.

After a couple of hours of coding, it was live on [cleanapp.dev](https://cleanapp.dev/), ready for people to check out. I was very surprised by how quickly I was able to get it running.

Yes, the app is super simple, so the coding part did not take too long. But I also bought the domain, hosted it, set up CI/CD to push to my self-hosted server using CapRover, setup Mailgun and Emai Alias. Everything from start to finish... Logs, Sentry, db, you name it, everything.

I'm very thankful to my past self for creating and updating the Django SaaS Starter.

Now on to AI. It was also a lot of fun to use it for this project. Mostly, I've been working on legacy projects where there's a lot of existing code, and AI isn't very good with that. But here, with new code, UI (the part I hate most), logic, models were done under an hour.

Granted, I didn't do the "standard vibe coding" approach where I prompt AI to just build the app. I worked bit by bit, knowing what I needed to update. With this approach, it's been a lot of (reliable) fun. The sheer amount of good (by my standards) code that I was able to ship today is mind-boggling. Thank God for AI, it just makes stuff so quick and so enjoyable.

I really don't understand people who say that using AI to ship code isn't fun. I guess I'm not a purist who writes code for code's sake. I write it for the end result, and getting this end result has been very, very enjoyable.

Side note: The reason I was able to do all this is because starting today, my son began going to kindergarten. Usually I spend my mornings with him, but today I got three to four hours to myself while he was there. I was able to accomplish all of this in that time.

Given that he's probably going to continue going, I can't wait to make more progress on my other apps, mainly [TuxCEO](https://tuxseo.com), which I'm really hoping to grow to at least some MRR. Right now, all of my projects are at zero MRR.

So stay tuned. I'll try to make all of this public, and I hope to share more updates soon.
