import { nextTick, ref } from 'vue'

export interface ViewTransitionOptions {
  name?: string
  fallback?: () => void | Promise<void>
}

export function useViewTransition() {
  const isSupported = ref(typeof document !== 'undefined' && 'startViewTransition' in document)
  const isTransitioning = ref(false)

  const startTransition = async (
    updateCallback: () => void | Promise<void>,
    options: ViewTransitionOptions = {},
  ) => {
    const { name, fallback } = options

    if (!isSupported.value || typeof document === 'undefined' || !document.startViewTransition) {
      // Fallback for browsers that don't support View Transitions API
      if (fallback) {
        await fallback()
      }
      else {
        await updateCallback()
      }
      return
    }

    isTransitioning.value = true

    try {
      if (name) {
        document.documentElement.setAttribute('data-transition', name)
      }

      const transition = document.startViewTransition(async () => {
        await updateCallback()
        await nextTick()
      })

      await transition.ready
      await transition.finished

      if (name) {
        document.documentElement.removeAttribute('data-transition')
      }
    }
    catch {
      // Execute fallback on error
      if (fallback) {
        await fallback()
      }
      else {
        await updateCallback()
      }
    }
    finally {
      isTransitioning.value = false
    }
  }

  return {
    isSupported,
    isTransitioning,
    startTransition,
  }
}
