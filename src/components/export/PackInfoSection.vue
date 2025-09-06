<script setup lang="ts">
import type { ExportConfirmationData } from '~/types/export'
import { nextTick, ref, watch } from 'vue'

interface Props {
  exportData: ExportConfirmationData
  iconCount: number
  licenseFileName?: string
}

const props = defineProps<Props>()

const packIconCanvas = ref<HTMLCanvasElement>()

function renderPackIcon() {
  if (!props.exportData.packIcon || !packIconCanvas.value)
    return

  const canvas = packIconCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  ctx.clearRect(0, 0, 48, 48)

  const blob = new Blob([new Uint8Array(props.exportData.packIcon)], { type: 'image/png' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.onload = () => {
    try {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, 48, 48)
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

watch(
  () => props.exportData.packIcon,
  () => {
    nextTick(() => {
      renderPackIcon()
    })
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4">
    <h3 class="flex items-center text-base text-zinc-900 font-medium space-x-2 dark:text-zinc-100">
      <i class="i-carbon-package text-blue-600" />
      <span>{{ $t('export.confirmation.packInfo') }}</span>
    </h3>

    <div class="rounded-lg bg-zinc-50 p-4 space-y-3 dark:bg-zinc-700">
      <div class="flex items-center space-x-3">
        <div v-if="exportData.packIcon" class="h-12 w-12 flex-shrink-0 overflow-hidden border border-zinc-200 rounded bg-white">
          <canvas
            ref="packIconCanvas"
            class="h-full w-full"
            width="48"
            height="48"
            style="image-rendering: pixelated"
          />
        </div>
        <div v-else class="h-12 w-12 flex flex-shrink-0 items-center justify-center border border-zinc-300 rounded bg-zinc-200 dark:border-zinc-500 dark:bg-zinc-600">
          <i class="i-carbon-image text-zinc-400" />
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="text-sm text-zinc-900 font-medium dark:text-zinc-100">
            {{ exportData.packName }}
          </h4>
          <p v-if="licenseFileName" class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ $t('export.confirmation.license') }}: {{ licenseFileName }}
          </p>
        </div>
      </div>

      <div v-if="exportData.packDescription" class="border-t border-zinc-200 pt-2 dark:border-zinc-600">
        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          {{ exportData.packDescription }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-2 text-xs dark:border-zinc-600">
        <div>
          <span class="text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.packFormat') }}:</span>
          <span class="ml-1 text-zinc-900 dark:text-zinc-100">{{ exportData.packFormat }}</span>
        </div>
        <div>
          <span class="text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.iconCount') }}:</span>
          <span class="ml-1 text-zinc-900 dark:text-zinc-100">{{ iconCount }}</span>
        </div>
        <div v-if="exportData.supportedFormats">
          <span class="text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.supportedFormats') }}:</span>
          <span class="ml-1 text-xs text-zinc-900 font-mono dark:text-zinc-100">{{ exportData.supportedFormats }}</span>
        </div>
        <div v-if="exportData.allowedIncompatible">
          <span class="text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.compatibilityMode') }}:</span>
          <span class="ml-1 text-zinc-900 dark:text-zinc-100">{{ $t('export.confirmation.allowIncompatible') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
