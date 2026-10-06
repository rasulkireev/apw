<template>
<div class="my-3">
  <p class="block text-2xl font-bold lg:p-1 lg:text-sm lg:inline-block">Share</p>

  <div class="flex flex-row lg:flex-col">

    <!-- Sharingbutton HackerNews -->
    <div class="inline-block p-1 mr-1 bg-orange-600">
      <a aria-label="Share via Hacker News" :href='"https://news.ycombinator.com/submitlink?u=" + url + "&t=" + title' target="_blank" rel="noopener">
        <svg class="text-white text-[2.5rem] inline-block align-middle shrink-0" width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><use href="/icons/social.svg#hacker-news"></use></svg>
      </a>
    </div>


    <!-- Sharingbutton Twitter -->
    <div class="inline-block p-1 mr-1 bg-blue-500">
      <a aria-label="Share via Twitter" :href='"https://twitter.com/intent/tweet/?text=" + title + " @rasulkireev&amp;url=" + url' target="_blank" rel="noopener">
          <svg class="text-white text-[2.5rem] inline-block align-middle shrink-0" width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><use href="/icons/social.svg#twitter"></use></svg>
      </a>
    </div>

    <!-- Sharingbutton E-Mail -->
    <div class="inline-block p-1 mr-1 bg-black">
      <a aria-label="Share via Email" :href='"mailto:?subject=" + title + "&amp;body=" + text + " " + url' target="_self" rel="noopener">
        <svg class="text-white text-[2.5rem] inline-block align-middle shrink-0" width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><use href="/icons/social.svg#envelope"></use></svg>
      </a>
    </div>

    <!-- Sharingbutton Reddit -->
    <div class="inline-block p-1 mr-1 bg-red-600">
      <a aria-label="Share via Reddit" :href='"https://reddit.com/submit/?url=" + url + "&amp;resubmit=true&amp;title=" + title + " by Rasul Kireev"' target="_blank" rel="noopener">
        <svg class="text-white text-[2.5rem] inline-block align-middle shrink-0" width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><use href="/icons/social.svg#reddit"></use></svg>
      </a>
    </div>

    <!-- Sharingbutton LinkedIn -->
    <div class="inline-block p-1 mr-1 bg-blue-700">
      <a aria-label="Share via LinkedIn" :href='"https://www.linkedin.com/shareArticle?mini=True&amp;url=" + url + "&title=" + title + " by Rasul Kireev" + "&amp;summary=" + text' target="_blank" rel="noopener">
          <svg class="text-white text-[2.5rem] inline-block align-middle shrink-0" width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><use href="/icons/social.svg#linkedin-in"></use></svg>
      </a>
    </div>

    <!-- Sharingbutton Telegram -->
    <div class="inline-block p-1 mr-1 bg-blue-500">
      <a aria-label="Share via Telegram" :href='"https://telegram.me/share/url?text=" + title + " by Rasul Kireev" + "&amp;url=" + url' target="_blank" rel="noopener">
        <svg class="text-white text-[2.5rem] inline-block align-middle shrink-0" width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><use href="/icons/social.svg#telegram"></use></svg>
      </a>
    </div>

    <!-- Sharingbutton Facebook -->
    <div class="inline-block p-1 mr-1 bg-blue-700">
      <a aria-label="Share via Facebook" :href="'https://facebook.com/sharer/sharer.php?u=' + url" target="_blank" rel="noopener">
            <svg class="text-white text-[2.5rem] inline-block align-middle shrink-0" width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false"><use href="/icons/social.svg#facebook"></use></svg>
      </a>
    </div>
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

<style>
a {
  border: 0;
}

a:hover {
  background-color: transparent;
  border-color: transparent;
}

</style>
