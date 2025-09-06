<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'
import { useThemeToggleAnimation } from '~/composables/useThemeToggleAnimation'

const { t } = useI18n()
const { currentTheme, setTheme, toggleTheme } = useTheme()
const { toggleWithAnimation } = useThemeToggleAnimation({ toggleDark: toggleTheme })

const themes = [
  { value: 'light', label: 'settings.appearance.theme.light' },
  { value: 'dark', label: 'settings.appearance.theme.dark' },
] as const

function handleThemeChange(value: string, event: Event) {
  // 如果是在两种主题之间切换，使用动画
  if ((currentTheme.value === 'light' && value === 'dark')
    || (currentTheme.value === 'dark' && value === 'light')) {
    toggleWithAnimation(event as MouseEvent)
  }
  else {
    setTheme(value as 'light' | 'dark')
  }
}
</script>

<template>
  <div class="theme-visual-selector">
    <div class="grid grid-cols-2 max-w-md gap-6 pt-2 md:gap-8">
      <label
        v-for="theme in themes"
        :key="theme.value"
        class="theme-card"
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

        <div class="theme-preview">
          <div
            class="preview-container"
            :class="theme.value === 'light' ? 'bg-[#ecedef]' : 'bg-slate-950'"
          >
            <div
              class="preview-panel"
              :class="theme.value === 'light' ? 'bg-white' : 'bg-slate-800'"
            >
              <div
                class="preview-bar"
                :class="theme.value === 'light' ? 'bg-[#ecedef]' : 'bg-slate-400'"
              />
              <div
                class="preview-bar-long"
                :class="theme.value === 'light' ? 'bg-[#ecedef]' : 'bg-slate-400'"
              />
            </div>
            <div
              v-for="i in 2"
              :key="i"
              class="preview-item"
              :class="theme.value === 'light' ? 'bg-white' : 'bg-slate-800'"
            >
              <div
                class="preview-circle"
                :class="theme.value === 'light' ? 'bg-[#ecedef]' : 'bg-slate-400'"
              />
              <div
                class="preview-bar-long"
                :class="theme.value === 'light' ? 'bg-[#ecedef]' : 'bg-slate-400'"
              />
            </div>
          </div>
        </div>

        <span class="theme-name">
          {{ t(theme.label) }}
        </span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.theme-visual-selector {
  @apply space-y-2;
}

.theme-card {
  @apply block cursor-pointer;
}

.theme-preview {
  @apply items-center rounded-md border-2 border-zinc-200 dark:border-zinc-700 p-1
         hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors duration-200;
}

.theme-card.selected .theme-preview {
  @apply border-blue-500;
}

.preview-container {
  @apply space-y-2 rounded-sm p-2;
}

.preview-panel {
  @apply space-y-2 rounded-md p-2 shadow-sm;
}

.preview-item {
  @apply flex items-center space-x-2 rounded-md p-2 shadow-sm;
}

.preview-bar {
  @apply h-2 w-20 rounded-lg;
}

.preview-bar-long {
  @apply h-2 w-24 rounded-lg;
}

.preview-circle {
  @apply h-4 w-4 rounded-full flex-shrink-0;
}

.theme-name {
  @apply block w-full p-2 text-center font-normal text-sm text-zinc-900 dark:text-zinc-100;
}

/* 移动端响应式优化 */
@media (max-width: 768px) {
  .theme-visual-selector .grid {
    @apply gap-4 max-w-none;
  }

  .preview-container {
    @apply p-1.5;
  }

  .preview-panel {
    @apply p-1.5;
  }

  .preview-item {
    @apply p-1.5;
  }

  .theme-name {
    @apply p-1.5 text-xs;
  }
}

@media (max-width: 480px) {
  .theme-visual-selector .grid {
    @apply grid-cols-1 gap-3;
  }
}
</style>
