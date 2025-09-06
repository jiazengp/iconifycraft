<script setup lang="ts">
import { computed, ref } from 'vue'
// Removed combobox imports - using regular select instead

defineProps<{
  isOptimizing?: boolean
}>()

const emit = defineEmits<{
  optimize: [targetSize: number | undefined]
}>()

const { t: $t } = useI18n()

const selectedSize = ref<string | number>('')
const availableSizes = [64, 128, 256, 512]

// 选项格式
const sizeOptions = computed(() => [
  { label: $t('packIcon.optimizer.keepOriginal'), value: '' },
  ...availableSizes.map(size => ({
    label: $t('packIcon.optimizer.resizeTo', { size }),
    value: size,
  })),
])

function handleOptimize() {
  const targetSize = selectedSize.value ? Number(selectedSize.value) : undefined
  emit('optimize', targetSize)
}
</script>

<template>
  <div class="optimization-options">
    <div class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
      <div>
        <h5 class="text-gray-900 font-medium dark:text-gray-100">
          {{ $t('packIcon.optimizer.title') }}
        </h5>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('packIcon.optimizer.description') }}
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <select
          v-model="selectedSize"
          class="w-40 border border-zinc-300 rounded bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 focus:border-blue-500 dark:bg-zinc-700 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
        >
          <option
            v-for="option in sizeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <button
          class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="isOptimizing"
          @click="handleOptimize"
        >
          <i v-if="isOptimizing" class="i-carbon-loading mr-1 animate-spin" />
          {{ isOptimizing ? $t('packIcon.optimizer.optimizing') : $t('packIcon.optimizer.optimize') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
