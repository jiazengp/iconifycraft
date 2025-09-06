import { nextTick } from 'vue'

interface ThemeToggleOptions {
  toggleDark: () => void
}

export function useThemeToggleAnimation({ toggleDark }: ThemeToggleOptions) {
  const enableTransitions = () =>
    'startViewTransition' in document
    && window.matchMedia('(prefers-reduced-motion: no-preference)').matches

  const toggleWithAnimation = async (event: MouseEvent) => {
    const { clientX: x, clientY: y } = event

    if (!enableTransitions()) {
      toggleDark()
      return
    }

    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      )}px at ${x}px ${y}px)`,
    ]

    const isDarkAfterToggle = !document.documentElement.classList.contains('dark')

    await document.startViewTransition(async () => {
      toggleDark()
      await nextTick()
    }).ready

    document.documentElement.animate(
      { clipPath: isDarkAfterToggle ? clipPath.reverse() : clipPath },
      {
        duration: 300,
        easing: 'ease-in',
        fill: 'forwards',
        pseudoElement: `::view-transition-${isDarkAfterToggle ? 'old' : 'new'}(root)`,
      },
    )
  }

  return {
    toggleWithAnimation,
  }
}
