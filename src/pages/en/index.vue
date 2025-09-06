<script setup lang="ts">
defineOptions({
  name: 'EnIndexPage',
})

useHead({
  title: 'IconifyCraft',
  meta: [
    { name: 'description', content: 'Convert Minecraft textures to chat icons with Unicode characters' },
  ],
})
</script>

<template>
  <AppLayout />
</template>

<route lang="yaml">
meta:
  layout: default
</route>
