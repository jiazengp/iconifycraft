<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'

interface Props {
  modelValue?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger'
  label?: string
  description?: string
  name?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
  color: 'primary',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 尺寸样式 - 精确计算确保圆形thumb完美对齐
const sizeClasses = computed(() => {
  const sizes = {
    sm: {
      root: 'h-5 w-9',
      thumb: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5',
    },
    md: {
      root: 'h-6 w-11',
      thumb: 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5',
    },
    lg: {
      root: 'h-7 w-13',
      thumb: 'h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0.5',
    },
  }
  return sizes[props.size]
})

// 颜色样式 - 更柔和的颜色搭配
const colorClasses = computed(() => {
  const colors = {
    primary: 'data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-zinc-200 dark:data-[state=checked]:bg-blue-400 dark:data-[state=unchecked]:bg-zinc-600',
    success: 'data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-200 dark:data-[state=checked]:bg-emerald-400 dark:data-[state=unchecked]:bg-zinc-600',
    warning: 'data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-zinc-200 dark:data-[state=checked]:bg-amber-400 dark:data-[state=unchecked]:bg-zinc-600',
    danger: 'data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-zinc-200 dark:data-[state=checked]:bg-red-400 dark:data-[state=unchecked]:bg-zinc-600',
  }
  return colors[props.color]
})

// Focus ring颜色
const focusRingClasses = computed(() => {
  const focusColors = {
    primary: 'focus-visible:ring-blue-500/20',
    success: 'focus-visible:ring-emerald-500/20',
    warning: 'focus-visible:ring-amber-500/20',
    danger: 'focus-visible:ring-red-500/20',
  }
  return focusColors[props.color]
})

// Switch Root 样式 - 更加精致优雅，确保两侧间距均匀
const rootClasses = computed(() => [
  'inline-flex shrink-0 cursor-pointer items-center justify-start rounded-full p-0.5',
  'transition-all duration-200 ease-out',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  'hover:shadow-sm',
  sizeClasses.value.root,
  colorClasses.value,
  focusRingClasses.value,
])

// Switch Thumb 样式 - 更精致的阴影和动画
const thumbClasses = computed(() => [
  'pointer-events-none block rounded-full bg-white shadow-sm border border-zinc-100/50',
  'transition-all duration-200 ease-out',
  'data-[state=checked]:shadow-md',
  sizeClasses.value.thumb,
])
</script>

<template>
  <div class="flex items-start space-x-3">
    <SwitchRoot
      :model-value="modelValue"
      :disabled="disabled"
      :name="name"
      :required="required"
      :class="rootClasses"
      @update:model-value="(value: boolean) => emit('update:modelValue', value)"
    >
      <SwitchThumb :class="thumbClasses" />
    </SwitchRoot>

    <div v-if="label || description || $slots.default" class="min-w-0 flex-1">
      <label v-if="label || $slots.label" class="block cursor-pointer select-none text-sm text-zinc-900 font-medium dark:text-zinc-100">
        <slot name="label">{{ label }}</slot>
      </label>

      <p v-if="description || $slots.description" class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        <slot name="description">
          {{ description }}
        </slot>
      </p>

      <slot />
    </div>
  </div>
</template>
