<template>
  <nav class="site-nav" @keydown.escape="closeMenus">
    <div class="site-nav-inner">
      <a class="nav-logo" href="/" aria-label="Rasul Kireev home">
        <img src="/logo.png" alt="" />
        <span>Rasul Kireev</span>
      </a>

      <div class="desktop-nav">
        <a href="/" class="nav-link" :class="{ 'is-active': isActive('/') }">Home</a>
        <a href="/about" class="nav-link" :class="{ 'is-active': isActive('/about') }">About</a>
        <a href="/projects" class="nav-link" :class="{ 'is-active': isActive('/projects') }">Projects</a>

        <div class="relative inline-block text-left">
          <button
            type="button"
            class="nav-link"
            :class="{ 'is-active': isWritingActive }"
            @click="dropdownIsOpen = !dropdownIsOpen"
            aria-haspopup="true"
            :aria-expanded="dropdownIsOpen.toString()"
          >
            Writings
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div v-show="dropdownIsOpen" class="nav-menu">
              <a v-for="item in writingLinks" :key="item.href" :href="item.href" class="dropdown-link" @click="dropdownIsOpen = false">
                {{ item.label }}
              </a>
            </div>
          </transition>
        </div>
      </div>

      <button
        type="button"
        class="mobile-toggle"
        :aria-expanded="isOpen.toString()"
        aria-controls="mobile-navigation"
        @click="isOpen = !isOpen"
      >
        <span class="sr-only">Open main menu</span>
        <svg v-if="!isOpen" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg v-else class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div id="mobile-navigation" class="mobile-nav" :class="{ 'is-open': isOpen }">
      <a v-for="item in mobileLinks" :key="item.href" :href="item.href" class="mobile-link" :class="{ 'is-active': isActive(item.href) }" @click="isOpen = false">
        {{ item.label }}
      </a>
    </div>
  </nav>
</template>

<script>
const writingLinks = [
  { href: "/articles/", label: "Articles" },
  { href: "/tutorials/", label: "Tutorials" },
  { href: "/book-notes/", label: "Book notes" },
  { href: "/recipes/", label: "Recipes" },
  { href: "/lists/", label: "Lists" },
  { href: "/prompts/", label: "Prompts" },
  { href: "/now", label: "Now" },
];

export default {
  props: {
    initialPath: {
      type: String,
      default: "/",
    },
  },
  data: () => ({
    isOpen: false,
    dropdownIsOpen: false,
    currentPath: "/",
    writingLinks,
    mobileLinks: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/projects", label: "Projects" },
      ...writingLinks,
    ],
  }),
  created() {
    this.currentPath = this.initialPath;
  },
  computed: {
    isWritingActive() {
      return this.writingLinks.some((item) => this.isActive(item.href));
    },
  },
  mounted() {
    this.currentPath = window.location.pathname;
  },
  methods: {
    normalize(path) {
      if (path === "/") return "/";
      return path.replace(/\/$/, "");
    },
    isActive(href) {
      return this.normalize(this.currentPath) === this.normalize(href);
    },
    closeMenus() {
      this.isOpen = false;
      this.dropdownIsOpen = false;
    },
  },
};
</script>
