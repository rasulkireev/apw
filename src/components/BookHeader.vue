<template>
  <div class="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
    <img class="w-32 mb-10" :src=getImageUrl(data.cover) />
    <div class="flex flex-col space-y-2">
      <h1 class="h-full text-2xl font-extrabold leading-10 text-center text-gray-900 md:text-left md:text-5xl">
        {{ data.title }} by {{ data.author }}
      </h1>
      <p class="text-lg font-normal">Rating: <span class="font-bold">{{ data.rating }}</span>/10</p>
      <p class="text-lg font-normal">Date Read: <span class="font-bold">{{ formattedDate }}</span></p>
      <p>
        <a class="text-lg font-normal text-blue-600 hover:text-blue-800" v-if="data.notAffiliateLink" :href="data.notAffiliateLink">Non Affiliate Link</a>
        <span v-if="data.notAffiliateLink && data.affiliateLink"> | </span>
        <a class="text-lg font-normal text-blue-600 hover:text-blue-800" v-if="data.affiliateLink" :href="data.affiliateLink">Affiliate Link</a>
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
