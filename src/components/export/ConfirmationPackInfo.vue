<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { renderPackIconPreview } from '~/utils/image'
import { logger } from '~/utils/logger'

interface Props {
  packIcon?: Uint8Array
  packName: string
  packDescription?: string
  licenseFileName?: string
  packFormat: number
  iconCount: number
  supportedFormats?: string
  allowedIncompatible?: boolean
  atlasImage?: string
}

const props = defineProps<Props>()

const packIconCanvas = ref<HTMLCanvasElement>()

watch([() => props.packIcon, () => props.atlasImage], () => {
  if (props.packIcon || props.atlasImage) {
    nextTick(() => {
      renderIconPreview()
    })
  }
}, { immediate: true })

async function renderIconPreview() {
  const canvas = packIconCanvas.value
  if (!canvas || (!props.packIcon && !props.atlasImage))
    return

  try {
    await renderPackIconPreview(canvas, props.packIcon, props.atlasImage, 48)
  }
  catch (error) {
    logger.error('Failed to render pack icon preview:', error)
  }
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="flex items-center text-base text-zinc-900 font-medium space-x-2 dark:text-zinc-100">
      <i class="i-carbon-package text-blue-600" />
      <span>{{ $t('export.confirmation.packInfo') }}</span>
    </h3>

    <div class="rounded-lg bg-zinc-50 p-4 space-y-3 dark:bg-zinc-700">
      <div class="flex items-center space-x-3">
        <div v-if="packIcon || atlasImage" class="h-12 w-12 flex-shrink-0 overflow-hidden border border-gray-200 rounded bg-white">
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
            {{ packName }}
          </h4>
          <p v-if="licenseFileName" class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ $t('export.progress.license') }}: {{ licenseFileName }}
          </p>
        </div>
      </div>

      <div v-if="packDescription" class="border-t border-gray-200 pt-2 dark:border-gray-600">
        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          {{ packDescription }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4 border-t border-gray-200 pt-2 text-xs dark:border-gray-600">
        <div>
          <span class="text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.packFormat') }}:</span>
          <span class="ml-1 text-zinc-900 dark:text-zinc-100">{{ packFormat }}</span>
        </div>
        <div>
          <span class="text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.iconCount') }}:</span>
          <span class="ml-1 text-zinc-900 dark:text-zinc-100">{{ iconCount }}</span>
        </div>
        <div v-if="supportedFormats">
          <span class="text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.supportedFormats') }}:</span>
          <span class="ml-1 text-xs text-zinc-900 font-mono dark:text-zinc-100">{{ supportedFormats }}</span>
        </div>
        <div v-if="allowedIncompatible">
          <span class="text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.compatibilityMode') }}:</span>
          <span class="ml-1 text-zinc-900 dark:text-zinc-100">{{ $t('export.confirmation.allowIncompatible') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
