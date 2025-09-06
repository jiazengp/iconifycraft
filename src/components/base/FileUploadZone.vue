<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  label: string
  accept: string
  placeholder: string
  fileTypesHint: string
  hasFile: boolean
  isDragOver?: boolean
}

withDefaults(defineProps<Props>(), {
  isDragOver: false,
})

const emit = defineEmits<{
  'fileDrop': [event: DragEvent]
  'fileSelect': [event: Event]
  'fileClear': []
  'update:isDragOver': [value: boolean]
}>()

const { t } = useI18n()
const fileInput = ref<HTMLInputElement>()

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  emit('update:isDragOver', true)
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  emit('update:isDragOver', false)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  emit('update:isDragOver', false)
  emit('fileDrop', event)
}

function handleFileSelect(event: Event) {
  emit('fileSelect', event)
}

function handleClear() {
  emit('fileClear')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

defineExpose({
  triggerFileInput,
  handleClear,
})
</script>

<template>
  <div class="space-y-2">
    <label class="text-xs text-zinc-500 dark:text-zinc-400">{{ label }}</label>
    <div
      class="h-[72px] flex cursor-pointer items-center border border-zinc-300 rounded border-dashed p-3 text-center transition-colors dark:border-zinc-600 hover:border-blue-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:hover:border-blue-400"
      :class="{ 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20': isDragOver }"
      role="button"
      tabindex="0"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @keydown.enter="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileSelect"
      >

      <div v-if="hasFile" class="group relative w-full flex items-center space-x-2">
        <slot name="file-preview" />
        <div class="flex-1 text-left">
          <slot name="file-info" />
        </div>
        <div class="absolute right-0 flex opacity-0 transition-opacity duration-200 space-x-1 group-hover:opacity-100">
          <button
            type="button"
            class="h-6 w-6 flex items-center justify-center rounded text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
            :title="t('upload.messages.replace')"
            @click.stop="triggerFileInput"
            @keydown.enter="triggerFileInput"
            @keydown.space.prevent="triggerFileInput"
          >
            <i class="i-carbon-edit text-sm" />
          </button>
          <button
            type="button"
            class="h-6 w-6 flex items-center justify-center rounded text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            :title="t('upload.messages.cleared')"
            @click.stop="handleClear"
            @keydown.enter="handleClear"
            @keydown.space.prevent="handleClear"
          >
            <i class="i-carbon-trash-can text-sm" />
          </button>
        </div>
      </div>

      <div v-else class="flex items-center justify-center space-x-2">
        <slot name="empty-state" />
      </div>
    </div>
  </div>
</template>
