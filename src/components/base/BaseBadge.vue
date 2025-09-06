<script setup lang="ts">
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'outline'
type BadgeSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  color?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  dot: false,
})
</script>

<template>
  <span
    class="base-badge"
    :class="[
      `base-badge--${variant}`,
      `base-badge--${size}`,
      {
        'base-badge--dot': dot,
      },
    ]"
    :style="color ? { backgroundColor: color, borderColor: color } : undefined"
  >
    <span v-if="dot" class="base-badge__dot" />
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  @apply inline-flex items-center justify-center;
  @apply font-medium rounded-full border;
  @apply transition-colors duration-150;
}

/* Sizes */
.base-badge--sm {
  @apply px-2 py-0.5 text-xs;
}

.base-badge--md {
  @apply px-2.5 py-0.5 text-xs;
}

.base-badge--lg {
  @apply px-3 py-1 text-sm;
}

.base-badge--dot {
  @apply px-1.5;
}

.base-badge--sm.base-badge--dot {
  @apply px-1;
}

.base-badge--lg.base-badge--dot {
  @apply px-2;
}

/* Variants */
.base-badge--default {
  @apply bg-zinc-100 text-zinc-700 border-zinc-200;
  @apply dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700;
}

.base-badge--success {
  @apply bg-green-100 text-green-700 border-green-200;
  @apply dark:bg-green-900/30 dark:text-green-400 dark:border-green-800;
}

.base-badge--warning {
  @apply bg-yellow-100 text-yellow-700 border-yellow-200;
  @apply dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800;
}

.base-badge--error {
  @apply bg-red-100 text-red-700 border-red-200;
  @apply dark:bg-red-900/30 dark:text-red-400 dark:border-red-800;
}

.base-badge--info {
  @apply bg-blue-100 text-blue-700 border-blue-200;
  @apply dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800;
}

.base-badge--secondary {
  @apply bg-zinc-600 text-white border-zinc-600;
  @apply dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600;
}

/* Dot */
.base-badge__dot {
  @apply w-1.5 h-1.5 rounded-full mr-1.5;
  @apply bg-current opacity-75;
}

.base-badge--sm .base-badge__dot {
  @apply w-1 h-1 mr-1;
}

.base-badge--lg .base-badge__dot {
  @apply w-2 h-2 mr-2;
}
</style>
