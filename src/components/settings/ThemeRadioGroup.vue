<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'
import { useThemeToggleAnimation } from '~/composables/useThemeToggleAnimation'

const { t } = useI18n()
const { currentTheme, setTheme, toggleTheme } = useTheme()
const { toggleWithAnimation } = useThemeToggleAnimation({ toggleDark: toggleTheme })

const themes = [
  {
    value: 'light',
    label: 'settings.appearance.theme.light',
    icon: 'i-lucide-sun',
    description: 'settings.appearance.theme.lightDesc',
  },
  {
    value: 'dark',
    label: 'settings.appearance.theme.dark',
    icon: 'i-lucide-moon',
    description: 'settings.appearance.theme.darkDesc',
  },
  {
    value: 'auto',
    label: 'settings.appearance.theme.auto',
    icon: 'i-lucide-monitor',
    description: 'settings.appearance.theme.autoDesc',
  },
] as const

function handleThemeChange(value: string, event: Event) {
  // 如果是在两种主题之间切换，使用动画
  if ((currentTheme.value === 'light' && value === 'dark')
    || (currentTheme.value === 'dark' && value === 'light')) {
    toggleWithAnimation(event as MouseEvent)
  }
  else {
    setTheme(value as 'light' | 'dark' | 'auto')
  }
}
</script>

<template>
  <div class="theme-radio-group">
    <div class="grid grid-cols-1 gap-3">
      <label
        v-for="theme in themes"
        :key="theme.value"
        class="theme-option"
        :class="{ selected: currentTheme === theme.value }"
      >
        <input
          :value="theme.value"
          :checked="currentTheme === theme.value"
          type="radio"
          name="theme"
          class="sr-only"
          @change="handleThemeChange(theme.value, $event)"
        >
        <div class="theme-content">
          <div class="flex items-center space-x-3">
            <div class="theme-icon">
              <i :class="theme.icon" />
            </div>
            <div class="flex-1">
              <div class="theme-label">
                {{ t(theme.label) }}
              </div>
              <div class="theme-description">
                {{ t(theme.description) }}
              </div>
            </div>
            <div class="theme-indicator">
              <div class="indicator-dot" />
            </div>
          </div>
        </div>
      </label>
    </div>
  </div>
</template>

<style scoped>
.theme-radio-group {
  @apply space-y-2;
}

.theme-option {
  @apply block cursor-pointer;
}

.theme-content {
  @apply p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50
         hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200;
}

.theme-option.selected .theme-content {
  @apply border-blue-500 bg-blue-50 dark:bg-blue-900/20;
}

.theme-icon {
  @apply w-8 h-8 bg-white dark:bg-zinc-700 rounded-lg flex items-center justify-center
         text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-600;
}

.theme-option.selected .theme-icon {
  @apply bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600;
}

.theme-label {
  @apply text-sm font-medium text-zinc-900 dark:text-zinc-100;
}

.theme-description {
  @apply text-xs text-zinc-600 dark:text-zinc-400 mt-1;
}

.theme-indicator {
  @apply w-4 h-4 border border-zinc-300 dark:border-zinc-600 rounded-full flex items-center justify-center;
}

.theme-option.selected .theme-indicator {
  @apply border-blue-500;
}

.indicator-dot {
  @apply w-2 h-2 rounded-full transition-all duration-200;
}

.theme-option.selected .indicator-dot {
  @apply bg-blue-500;
}
</style>
