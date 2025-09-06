<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  hasErrors?: boolean
}>()

const emit = defineEmits<{
  uploadTrigger: []
  fileDrop: [file: File]
}>()

const isDragOver = ref(false)

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    emit('fileDrop', file)
  }
}
</script>

<template>
  <div
    class="upload-zone cursor-pointer border-2 border-zinc-300 rounded-lg border-dashed p-6 text-center transition-colors dark:border-zinc-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
    :class="{
      'border-blue-500 bg-blue-50 dark:bg-blue-900/10': isDragOver,
      'border-red-500 bg-red-50 dark:bg-red-900/10': hasErrors,
    }"
    @click="$emit('uploadTrigger')"
    @drop="handleDrop"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
  >
    <div class="flex flex-col items-center">
      <i class="i-carbon-image mb-3 text-3xl text-zinc-400" />
      <p class="mb-1 text-lg text-zinc-900 font-medium dark:text-zinc-100">
        {{ $t('packIcon.upload.title') }}
      </p>
      <p class="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        {{ $t('packIcon.upload.description') }}
      </p>
      <div class="text-xs text-zinc-500">
        {{ $t('packIcon.upload.suggestedSizes') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  transition: all 0.2s ease;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  transform: translateY(-1px);
}
</style>
