<template>
    <div v-if="twitterLink || hnLink || redditLink || indiehackersLink" class="my-6">
      <p class="newsletter-title">Discuss on</p>
      <div class="discuss-links mt-3">
        <a
          v-if=twitterLink
          class="discuss-link"
          :href=twitterLink
          target="_blank"
        >
          <i class="text-2xl lab la-twitter"></i>
          <span>Twitter</span>
        </a>

        <a
          v-if=hnLink
          class="discuss-link"
          :href=hnLink
          target="_blank"
        >
          <i class="text-2xl lab la-hacker-news"></i>
          <span>Hacker News</span>
        </a>

        <a
          v-if=redditLink
          class="discuss-link"
          :href=redditLink
          target="_blank"
        >
          <i class="text-2xl lab la-reddit"></i>
          <span>Reddit</span>
        </a>

        <a
          v-if=indiehackersLink
          class="discuss-link"
          :href=indiehackersLink
          target="_blank"
        >
          <span>Indie Hackers</span>
        </a>

      </div>
    </div>
</template>

<script>
export default {
  props: [
    'twitterLink',
    'hnLink',
    'redditLink',
    'indiehackersLink',
  ]
}
</script>
