<script setup lang="ts">
interface Props {
  label: string
  value: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex justify-between">
    <span class="text-gray-600 dark:text-gray-400">{{ label }}:</span>
    <span class="font-mono">{{ value }}</span>
  </div>
</template>
