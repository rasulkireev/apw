<template>
<nav class="z-50 bg-white">
  <div class="px-4 mx-auto max-w-7xl">
    <div class="flex justify-between h-20">
      <div class="flex">
        <div class="flex items-center flex-shrink-0">
          <a href="/">
            <img class="block w-auto h-8 lg:hidden" src="/logo.png" alt="Rasul Kireev" />
          </a>
          <a href="/">
            <img class="hidden w-auto h-12 lg:block" src="/logo.png" alt="Rasul Kireev" />
          </a>
        </div>
      </div>
      <div class="flex items-center">
        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="/" class="inline-flex items-center px-1 pt-1 text-lg font-medium text-gray-500 hover:text-gray-700">
                Home
            </a>
            <a href="/about" class="inline-flex items-center px-1 pt-1 text-lg font-medium text-gray-500 hover:text-gray-700">
                About
            </a>
            <a href="/projects" class="inline-flex items-center px-1 pt-1 text-lg font-medium text-gray-500 hover:text-gray-700">
                Projects
            </a>
            <a href="/favourites" class="inline-flex items-center px-1 pt-1 text-lg font-medium text-gray-500 hover:text-gray-700">
                Favourites
            </a>
            <div class="relative inline-block text-left">
              <div>
                  <button
                    type="button"
                    @click="dropdownIsOpen = !dropdownIsOpen"
                    class="inline-flex items-center px-1 pt-1 text-lg font-medium text-gray-500 hover:text-gray-700"
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded="true"
                  >
                      Writings
                      <svg class="w-5 h-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                  </button>
              </div>

              <transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
              >
                  <div v-show="dropdownIsOpen" class="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                      <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <a href="/articles/" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">Articles</a>
                          <a href="/tutorials/" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">Tutorials</a>
                          <a href="/book-notes/" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">Book Notes</a>
                          <a href="/recipes/" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">Recipes</a>
                          <a href="/prompts/" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">Prompts</a>
                          <a href="/tags/" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">Tags</a>
                          <a href="/newsletter" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">Newsletter</a>
                          <a href="/now" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900">Now</a>
                      </div>
                  </div>
              </transition>
            </div>
        </div>
        <!-- Mobile menu button -->
        <div class="flex items-center -mr-2 sm:hidden">
            <button @click="isOpen = !isOpen" class="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <svg :class="isOpen ? 'hidden' : 'block'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg :class="isOpen ? 'block' : 'hidden'" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
      </div>
    </div>
  </div>

  <div :class="isOpen ? 'block' : 'hidden'">
    <div class="pt-2 pb-3 space-y-1">
      <a href="/" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Home</a>
      <a href="/about" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">About</a>
      <a href="/articles/" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Articles</a>
      <a href="/book-notes/" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Book Notes</a>
      <a href="/recipes/" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Recipes</a>
      <a href="/prompts/" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Prompts</a>
      <a href="/tutorials/" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Tutorials</a>
      <a href="/tags/" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Tags</a>
      <a href="/newsletter" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Newsletter</a>
      <a href="/now" class="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">Now</a>
    </div>
  </div>
</nav>

</template>

<script>
export default {
    data: () => ({
      isOpen: false,
      dropdownIsOpen: false,
    })
}
</script>
