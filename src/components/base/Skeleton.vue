<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded'
  lines?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  variant: 'rectangular',
  lines: 1,
  class: '',
})

const customClass = computed(() => props.class)

const sizeClasses = computed(() => {
  if (props.variant === 'text') {
    return 'h-4'
  }
  return ''
})

const shapeClasses = computed(() => {
  switch (props.variant) {
    case 'text':
      return 'rounded'
    case 'circular':
      return 'rounded-full'
    case 'rounded':
      return 'rounded-lg'
    case 'rectangular':
    default:
      return 'rounded'
  }
})

const customStyle = computed(() => {
  const style: Record<string, string> = {}

  if (typeof props.width === 'number') {
    style.width = `${props.width}px`
  }
  else if (typeof props.width === 'string') {
    style.width = props.width
  }

  if (typeof props.height === 'number') {
    style.height = `${props.height}px`
  }
  else if (typeof props.height === 'string') {
    style.height = props.height
  }

  return style
})
</script>

<template>
  <div
    class="animate-pulse rounded bg-zinc-200 dark:bg-skeleton-bg"
    :class="[
      sizeClasses,
      shapeClasses,
      customClass,
    ]"
    :style="customStyle"
  />
</template>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
