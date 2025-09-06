import { useColorMode, usePreferredDark } from '@vueuse/core'
import { computed } from 'vue'
import { logger } from '~/utils/logger'

export function useTheme() {
  const mode = useColorMode({
    modes: {
      light: 'light',
      dark: 'dark',
      auto: 'auto',
    },
    storageKey: 'vueuse-color-scheme',
    attribute: 'class',
  })

  const preferredDark = usePreferredDark()

  const isDark = computed(() => {
    if (mode.value === 'auto') {
      return preferredDark.value
    }
    return mode.value === 'dark'
  })

  const currentTheme = computed(() => mode.value)

  function setTheme(theme: 'light' | 'dark' | 'auto') {
    mode.value = theme
  }

  function toggleTheme() {
    // 简化为两种模式切换：light <-> dark
    if (mode.value === 'dark') {
      mode.value = 'light'
    }
    else {
      mode.value = 'dark'
    }
    logger.debug('Theme toggle:', { current: mode.value })
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    mode,
  }
}
