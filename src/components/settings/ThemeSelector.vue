<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '~/composables/useTheme'
import { useThemeToggleAnimation } from '~/composables/useThemeToggleAnimation'

const { t } = useI18n()
const { currentTheme, toggleTheme } = useTheme()
const { toggleWithAnimation } = useThemeToggleAnimation({ toggleDark: toggleTheme })

const themeConfig = computed(() => {
  const configs = {
    light: { icon: 'i-lucide-sun', title: t('theme.light') },
    dark: { icon: 'i-lucide-moon', title: t('theme.dark') },
  }
  return configs[currentTheme.value as keyof typeof configs] || configs.light
})

function handleToggle(event: MouseEvent) {
  toggleWithAnimation(event)
}
</script>

<template>
  <button
    class="icon-btn-no-bg"
    :title="themeConfig.title"
    @click="handleToggle"
  >
    <i :class="themeConfig.icon" class="text-lg" />
  </button>
</template>
