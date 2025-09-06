<script setup lang="ts">
import { useLangs } from '~/composables/useLangs'

const { currentLang, localeLinks, switchToLang } = useLangs()
</script>

<template>
  <div class="flex gap-2">
    <button
      :key="currentLang.code"
      class="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors"
    >
      {{ currentLang.label }}
    </button>
    <button
      v-for="link in localeLinks"
      :key="link.code"
      class="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-300"
      @click="switchToLang(link.code)"
    >
      {{ link.label }}
    </button>
  </div>
</template>
