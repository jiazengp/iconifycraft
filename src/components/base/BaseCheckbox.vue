<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label?: string
  hint?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checked = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const focused = ref(false)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-3.5 w-3.5'
    case 'lg':
      return 'h-5 w-5'
    default:
      return 'h-4 w-4'
  }
})
</script>

<template>
  <label class="group flex cursor-pointer items-start space-x-3" :class="{ 'cursor-not-allowed opacity-60': disabled }">
    <div class="relative mt-0.5 flex flex-shrink-0 items-center justify-center">
      <input
        v-model="checked"
        type="checkbox"
        :disabled="disabled"
        class="peer sr-only"
        @focus="focused = true"
        @blur="focused = false"
      >
      <div
        class="flex items-center justify-center border-1.5 rounded transition-all duration-150 ease-out group-hover:border-blue-400" :class="[
          sizeClasses,
          checked
            ? 'border-blue-500 bg-blue-500'
            : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800',
          checked && 'group-hover:border-blue-600 group-hover:bg-blue-600',
          disabled && 'cursor-not-allowed opacity-50',
          focused && 'ring-2 ring-blue-500/20 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900',
        ]"
      >
        <svg
          class="h-2.5 w-2.5 text-white transition-all duration-150" :class="[
            checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
          ]"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 6l2.5 2.5L10 3" />
        </svg>
      </div>
    </div>

    <div v-if="label || hint || $slots.label" class="min-w-0 flex-1">
      <div v-if="$slots.label" class="text-sm text-zinc-900 font-medium leading-5 dark:text-zinc-100">
        <slot name="label" />
      </div>
      <div v-else-if="label" class="text-sm text-zinc-900 font-medium leading-5 dark:text-zinc-100">
        {{ label }}
      </div>
      <div v-if="hint" class="mt-1 text-xs text-zinc-500 leading-4 dark:text-zinc-400">
        {{ hint }}
      </div>
    </div>

    <slot />
  </label>
</template>
