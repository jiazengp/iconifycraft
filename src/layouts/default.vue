<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import { useScrollHash } from '~/composables/useScrollHash'

useScrollHash({
  offset: 80,
  throttle: 100,
  updateUrl: true,
})
</script>

<template>
  <div class="minecraft-icons-app min-h-screen bg-white dark:bg-zinc-950/50">
    <AppHeader />

    <main>
      <RouterView />
    </main>

    <TheFooter />
  </div>
</template>
