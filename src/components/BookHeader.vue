<template>
  <div class="flex flex-col gap-5 md:flex-row md:items-start">
    <img class="book-cover-large" :src=getImageUrl(data.cover) :alt="`${data.title} by ${data.author}`" />
    <div class="page-stack">
      <h1 class="section-title">
        {{ data.title }} by {{ data.author }}
      </h1>
      <p class="entry-meta">Rating: <span class="font-bold">{{ data.rating }}</span>/10</p>
      <p class="entry-meta">Date read: <span class="font-bold">{{ formattedDate }}</span></p>
      <p>
        <a class="text-link" v-if="data.notAffiliateLink" :href="data.notAffiliateLink">Non affiliate link</a>
        <span v-if="data.notAffiliateLink && data.affiliateLink"> | </span>
        <a class="text-link" v-if="data.affiliateLink" :href="data.affiliateLink">Affiliate link</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  methods: {
    getImageUrl(imagePath) {
      return imagePath.src.replace(/^\.\//, "../src/content/books/");
    }
  },
  computed: {
    formattedDate() {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(this.data.dateRead).toLocaleDateString(undefined, options);
    },
  },
};
</script>
