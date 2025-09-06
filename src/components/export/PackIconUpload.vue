<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUploadZone from '~/components/base/FileUploadZone.vue'
import { logger } from '~/utils/logger'

interface Props {
  packIcon?: Uint8Array
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:packIcon': [value: Uint8Array | undefined]
}>()

const { t } = useI18n()

const canvas = ref<HTMLCanvasElement>()
const isDragOver = ref(false)

watch(() => props.packIcon, () => {
  if (props.packIcon) {
    nextTick(() => {
      renderPreview()
    })
  }
}, { immediate: true })

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file)
    await processFile(file)
}

async function handleFileDrop(event: DragEvent) {
  const files = event.dataTransfer?.files
  if (!files || files.length === 0)
    return

  const file = files[0]
  if (!file.type.startsWith('image/')) {
    logger.error(t('upload.messages.onlyImages'))
    return
  }
  await processFile(file)
}

async function processFile(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    emit('update:packIcon', new Uint8Array(arrayBuffer))
  }
  catch (error) {
    logger.error('Failed to load pack icon:', error)
  }
}

function clearIcon() {
  emit('update:packIcon', undefined)
}

function renderPreview() {
  if (!canvas.value || !props.packIcon)
    return

  const ctx = canvas.value.getContext('2d')
  if (!ctx)
    return

  ctx.clearRect(0, 0, 48, 48)

  const blob = new Blob([new Uint8Array(props.packIcon)], { type: 'image/png' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.onload = () => {
    try {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, 48, 48)
    }
    catch (error) {
      logger.error('Failed to draw preview:', error)
    }
    finally {
      URL.revokeObjectURL(url)
    }
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
  }
  img.src = url
}
</script>

<template>
  <FileUploadZone
    v-model:is-drag-over="isDragOver"
    :label="$t('export.settings.packIcon')"
    accept="image/png,image/jpg,image/jpeg"
    :placeholder="$t('export.settings.packIconPlaceholder')"
    :file-types-hint="$t('upload.fileTypes.image')"
    :has-file="!!packIcon"
    @file-select="handleFileSelect"
    @file-drop="handleFileDrop"
    @file-clear="clearIcon"
  >
    <template #file-preview>
      <div class="relative h-12 w-12 flex flex-shrink-0 items-center justify-center overflow-hidden border border-zinc-300 rounded bg-white dark:border-zinc-600">
        <canvas
          ref="canvas"
          class="h-full w-full"
          width="48"
          height="48"
          style="image-rendering: pixelated"
          :aria-label="$t('upload.messages.packIconPreview')"
        />
      </div>
    </template>

    <template #file-info>
      <p class="text-xs text-zinc-600 dark:text-zinc-400">
        {{ $t('upload.messages.uploaded') }}
      </p>
    </template>

    <template #empty-state>
      <i class="i-carbon-image text-lg text-zinc-400" />
      <div class="text-left">
        <p class="text-xs text-zinc-600 dark:text-zinc-400">
          {{ $t('export.settings.packIconPlaceholder') }}
        </p>
        <p class="text-xs text-zinc-500 dark:text-zinc-500">
          {{ $t('upload.fileTypes.image') }}
        </p>
      </div>
    </template>
  </FileUploadZone>
</template>
