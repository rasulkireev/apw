<template>
  <div>
    <div ref="contentContainer">
      <slot />
    </div>

        <div v-if="(hasHighlights && !highlightsLoaded) || (hasAnalysis && !analysisLoaded) || (hasPromptIdeas && !promptIdeasLoaded)" class="my-8">
      <div class="flex flex-wrap gap-3">
        <button
          v-if="hasHighlights && !highlightsLoaded"
          @click="loadHighlights"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Load Highlights
        </button>

        <button
          v-if="hasAnalysis && !analysisLoaded"
          @click="loadAnalysis"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Load 'How to Read a Book' Analysis
        </button>

        <button
          v-if="hasPromptIdeas && !promptIdeasLoaded"
          @click="loadPromptIdeas"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Load Prompt / Agent Ideas
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'

export default {
  setup() {
    const highlightsLoaded = ref(false)
    const hasHighlights = ref(false)
    const analysisLoaded = ref(false)
    const hasAnalysis = ref(false)
    const promptIdeasLoaded = ref(false)
    const hasPromptIdeas = ref(false)
    const contentContainer = ref(null)
    let highlightsSection = null
    let analysisSection = null
    let promptIdeasSection = null

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

        const findAndHideAnalysis = () => {
      if (!contentContainer.value) return

      // Find the analysis section (h2 with text that contains "How to Read a Book" and "Analysis")
      const headings = contentContainer.value.querySelectorAll('h2')
      let analysisHeading = null

      for (const heading of headings) {
        const text = heading.textContent.trim()
        if (text.includes('How to Read a Book') && text.includes('Analysis')) {
          analysisHeading = heading
          break
        }
      }

      if (analysisHeading) {
        hasAnalysis.value = true

        // Create a container for all analysis content
        analysisSection = document.createElement('div')
        analysisSection.style.display = 'none'

        // Move the analysis heading and all content until we hit another h2 or end of content
        let currentElement = analysisHeading
        while (currentElement) {
          const nextElement = currentElement.nextSibling

          // Stop if we hit another h2 that's not part of the analysis
          if (nextElement && nextElement.tagName === 'H2' &&
              !nextElement.textContent.trim().includes('How to Read a Book')) {
            break
          }

          analysisSection.appendChild(currentElement)
          currentElement = nextElement
        }

        // Insert the analysis section after the main content
        contentContainer.value.appendChild(analysisSection)
      }
    }

    const findAndHidePromptIdeas = () => {
      if (!contentContainer.value) return

      // Find the prompt ideas section (h2 with text that contains "Prompt" and "Agent" and "Ideas")
      const headings = contentContainer.value.querySelectorAll('h2')
      let promptIdeasHeading = null

      for (const heading of headings) {
        const text = heading.textContent.trim()
        if (text.includes('Prompt') && text.includes('Agent') && text.includes('Ideas')) {
          promptIdeasHeading = heading
          break
        }
      }

      if (promptIdeasHeading) {
        hasPromptIdeas.value = true

        // Create a container for all prompt ideas content
        promptIdeasSection = document.createElement('div')
        promptIdeasSection.style.display = 'none'

        // Move the prompt ideas heading and all content until we hit another h2 or end of content
        let currentElement = promptIdeasHeading
        while (currentElement) {
          const nextElement = currentElement.nextSibling

          // Stop if we hit another h2 that's not part of the prompt ideas
          if (nextElement && nextElement.tagName === 'H2' &&
              !(nextElement.textContent.trim().includes('Prompt') &&
                nextElement.textContent.trim().includes('Agent') &&
                nextElement.textContent.trim().includes('Ideas'))) {
            break
          }

          promptIdeasSection.appendChild(currentElement)
          currentElement = nextElement
        }

        // Insert the prompt ideas section after the main content
        contentContainer.value.appendChild(promptIdeasSection)
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

    const loadAnalysis = () => {
      analysisLoaded.value = true
      if (analysisSection) {
        analysisSection.style.display = 'block'
        // Dispatch custom event to notify TableOfContents that analysis is now visible
        document.dispatchEvent(new CustomEvent('analysisLoaded'))
      }
    }

    const loadPromptIdeas = () => {
      promptIdeasLoaded.value = true
      if (promptIdeasSection) {
        promptIdeasSection.style.display = 'block'
        // Dispatch custom event to notify TableOfContents that prompt ideas are now visible
        document.dispatchEvent(new CustomEvent('promptIdeasLoaded'))
      }
    }

        onMounted(() => {
      // Hide highlights, analysis, and prompt ideas immediately without waiting for nextTick to minimize race conditions
      findAndHideHighlights()
      findAndHideAnalysis()
      findAndHidePromptIdeas()

      // Also do it again after nextTick to be extra sure
      nextTick(() => {
        findAndHideHighlights()
        findAndHideAnalysis()
        findAndHidePromptIdeas()
      })
    })

    return {
      highlightsLoaded,
      hasHighlights,
      analysisLoaded,
      hasAnalysis,
      promptIdeasLoaded,
      hasPromptIdeas,
      contentContainer,
      loadHighlights,
      loadAnalysis,
      loadPromptIdeas
    }
  }
}
</script>
