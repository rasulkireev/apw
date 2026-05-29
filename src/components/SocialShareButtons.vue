<template>
  <div class="my-6">
    <p class="entry-meta mb-2">Share</p>

    <div class="social-links lg:flex-col">
      <a class="social-link" :href='"https://news.ycombinator.com/submitlink?u=" + url + "&t=" + title' target="_blank" rel="noopener" aria-label="Share on Hacker News">
        <i class="lab la-hacker-news" aria-hidden="true"></i>
      </a>
      <a class="social-link" :href='"https://twitter.com/intent/tweet/?text=" + title + " @rasulkireev&amp;url=" + url' target="_blank" rel="noopener" aria-label="Share on Twitter">
        <i class="lab la-twitter" aria-hidden="true"></i>
      </a>
      <a class="social-link" :href='"mailto:?subject=" + title + "&amp;body=" + text + " " + url' target="_self" rel="noopener" aria-label="Share by email">
        <i class="las la-envelope" aria-hidden="true"></i>
      </a>
      <a class="social-link" :href='"https://reddit.com/submit/?url=" + url + "&amp;resubmit=true&amp;title=" + title + " by Rasul Kireev"' target="_blank" rel="noopener" aria-label="Share on Reddit">
        <i class="lab la-reddit" aria-hidden="true"></i>
      </a>
      <a class="social-link" :href='"https://www.linkedin.com/shareArticle?mini=True&amp;url=" + url + "&title=" + title + " by Rasul Kireev" + "&amp;summary=" + text' target="_blank" rel="noopener" aria-label="Share on LinkedIn">
        <i class="lab la-linkedin-in" aria-hidden="true"></i>
      </a>
      <a class="social-link" :href='"https://telegram.me/share/url?text=" + title + " by Rasul Kireev" + "&amp;url=" + url' target="_blank" rel="noopener" aria-label="Share on Telegram">
        <i class="la la-telegram" aria-hidden="true"></i>
      </a>
      <a class="social-link" :href="'https://facebook.com/sharer/sharer.php?u=' + url" target="_blank" rel="noopener" aria-label="Share on Facebook">
        <i class="la la-facebook" aria-hidden="true"></i>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    "title",
    "url",
    "text"
  ]
}
</script>
