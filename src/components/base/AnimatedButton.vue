<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  fullWidth: false,
})

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
  outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-blue-500',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-gray-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
}
</script>

<template>
  <button
    v-motion
    :initial="{ scale: 1 }"
    :tap="{ scale: 0.95 }"
    :hover="{ scale: 1.05 }"
    :transition="{ type: 'spring', stiffness: 400, damping: 10 }"
    class="animated-button inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[
      sizeClasses[size],
      variantClasses[variant],
      disabled && 'opacity-50 cursor-not-allowed',
      fullWidth && 'w-full',
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <i v-if="icon && iconPosition === 'left'" class="mr-2" :class="[icon]" />

    <span v-if="loading" class="mr-2">
      <i class="i-carbon-loading animate-spin" />
    </span>

    <slot />

    <i v-if="icon && iconPosition === 'right'" class="ml-2" :class="[icon]" />
  </button>
</template>
