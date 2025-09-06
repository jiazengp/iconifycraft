<script setup lang="ts">
defineOptions({
  name: 'SettingsPage',
})

const { t } = useI18n()

useHead({
  title: computed(() => t('settings.title')),
})
</script>

<template>
  <SettingsPageLayout />
</template>

<route lang="yaml">
  meta:
    layout: default
</route>
