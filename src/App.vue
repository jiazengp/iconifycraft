<script setup lang="ts">
import Sonner from '~/components/base/Sonner.vue'
import { useAppSettings } from '~/composables/useAppSettings'

const { toastPosition } = useAppSettings()

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'IconifyCraft',
  meta: [
    {
      name: 'description',
      content: 'Convert Minecraft resource pack textures into Unicode chat icons. Generate bitmap font resource packs for displaying item and block icons in Minecraft chat.',
    },
    {
      name: 'keywords',
      content: 'minecraft, chat icons, unicode, resource pack, bitmap font, texture atlas, generator',
    },
    {
      name: 'author',
      content: 'IconifyCraft',
    },
    {
      name: 'theme-color',
      content: () => isDark.value ? '#0f172a' : '#ffffff',
    },
    {
      property: 'og:title',
      content: 'IconifyCraft',
    },
    {
      property: 'og:description',
      content: 'Convert Minecraft textures to Unicode chat icons',
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg',
    },
  ],
})
</script>

<template>
  <RouterView />

  <Sonner
    :position="toastPosition"
    :expand="false"
    :visible-toasts="5"
    :close-button="true"
    rich-colors
    :theme="isDark ? 'dark' : 'light'"
  />
</template>
