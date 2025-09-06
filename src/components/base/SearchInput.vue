<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="group relative">
    <div class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
      <i class="i-lucide-search text-sm text-zinc-500 transition-colors duration-200 dark:text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300" />
    </div>
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="search-input h-10 w-full text-zinc-900 dark:text-zinc-100"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      v-if="modelValue"
      class="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 transition-colors duration-200 hover:text-zinc-600 dark:hover:text-zinc-300"
      :title="$t('icons.clearSearch')"
      @click="$emit('update:modelValue', '')"
    >
      <i class="i-lucide-x text-sm" />
    </button>
  </div>
</template>
