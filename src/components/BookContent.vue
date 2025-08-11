<template>
  <div>
    <div ref="contentContainer">
      <slot />
    </div>
    
    <div v-if="hasHighlights && !highlightsLoaded" class="my-8">
      <button 
        @click="loadHighlights"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Load Highlights
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'

export default {
  setup() {
    const highlightsLoaded = ref(false)
    const hasHighlights = ref(false)
    const contentContainer = ref(null)
    let highlightsSection = null

    const findAndHideHighlights = () => {
      if (!contentContainer.value) return

      // Find the highlights section (h2 with text "Highlights")
      const headings = contentContainer.value.querySelectorAll('h2')
      let highlightsHeading = null

      for (const heading of headings) {
        if (heading.textContent.trim() === 'Highlights') {
          highlightsHeading = heading
          break
        }
      }

      if (highlightsHeading) {
        hasHighlights.value = true
        
        // Create a container for all highlights content
        highlightsSection = document.createElement('div')
        highlightsSection.style.display = 'none'
        
        // Move the highlights heading and all following content to the highlights section
        let currentElement = highlightsHeading
        while (currentElement) {
          const nextElement = currentElement.nextSibling
          highlightsSection.appendChild(currentElement)
          currentElement = nextElement
        }
        
        // Insert the highlights section after the main content
        contentContainer.value.appendChild(highlightsSection)
      }
    }

    const loadHighlights = () => {
      highlightsLoaded.value = true
      if (highlightsSection) {
        highlightsSection.style.display = 'block'
        // Dispatch custom event to notify TableOfContents that highlights are now visible
        document.dispatchEvent(new CustomEvent('highlightsLoaded'))
      }
    }

    onMounted(() => {
      // Hide highlights immediately without waiting for nextTick to minimize race conditions
      findAndHideHighlights()
      
      // Also do it again after nextTick to be extra sure
      nextTick(() => {
        findAndHideHighlights()
      })
    })

    return {
      highlightsLoaded,
      hasHighlights,
      contentContainer,
      loadHighlights
    }
  }
}
</script>