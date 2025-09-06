<script setup lang="ts">
import type { SupportedLocale } from '~/modules/i18n'
import { computed } from 'vue'
import { useLangs } from '~/composables/useLangs'

const { currentLang, localeLinks, switchToLang } = useLangs()

const allLanguages = computed(() => [currentLang.value, ...localeLinks.value])

async function handleLanguageChange(langCode: string) {
  await switchToLang(langCode as SupportedLocale)
}
</script>

<template>
  <div class="language-select-field">
    <div class="relative w-48">
      <select
        :value="currentLang.code"
        class="language-select"
        @change="handleLanguageChange(($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="language in allLanguages"
          :key="language.code"
          :value="language.code"
        >
          {{ language.label }}
        </option>
      </select>
      <i class="i-lucide-chevron-down select-arrow" />
    </div>
  </div>
</template>

<style scoped>
.language-select-field {
  @apply flex-shrink-0;
}

.language-select {
  @apply w-full pl-3 pr-10 py-3 text-sm bg-background
         border border-border rounded-lg
         text-foreground focus:ring-2 focus:ring-primary/20
         focus:border-primary transition-all duration-200 appearance-none
         hover:border-primary/60;
}

.select-arrow {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4
         text-muted-foreground pointer-events-none;
}

.language-select option {
  @apply bg-background text-foreground py-2;
}

/* 移动端响应式优化 */
@media (max-width: 768px) {
  .language-select-field {
    @apply w-full;
  }

  .language-select {
    @apply text-base; /* iOS上防止缩放 */
  }
}

@media (max-width: 480px) {
  .language-select {
    @apply py-3; /* 增加点击区域 */
  }
}
</style>
