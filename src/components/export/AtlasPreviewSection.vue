<script setup lang="ts">
import type { AtlasPreviewData } from '~/types/export'
import { computed, nextTick, ref, watch } from 'vue'
import { logger } from '~/utils/logger'

interface Props {
  atlasData?: AtlasPreviewData
}

const props = defineProps<Props>()

const atlasCanvas = ref<HTMLCanvasElement>()

const canvasSize = computed(() => {
  const size = Number.parseInt(props.atlasData?.atlasSize?.split('x')[0] || '256') || 256
  return Math.min(Math.max(size, 128), 512)
})

function renderAtlasPreview() {
  if (!props.atlasData?.atlasImage || !atlasCanvas.value)
    return

  const canvas = atlasCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  ctx.clearRect(0, 0, canvasSize.value, canvasSize.value)

  const img = new Image()
  img.onload = () => {
    try {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, canvasSize.value, canvasSize.value)
    }
    catch (error) {
      logger.warn('Failed to render atlas preview:', error)

      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, canvasSize.value, canvasSize.value)
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        'Preview\nUnavailable',
        canvasSize.value / 2,
        canvasSize.value / 2,
      )
    }
  }
  img.onerror = () => {
    logger.warn('Failed to load atlas image for preview')

    if (ctx) {
      ctx.fillStyle = '#fef3f2'
      ctx.fillRect(0, 0, canvasSize.value, canvasSize.value)
      ctx.fillStyle = '#dc2626'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        'Load Failed',
        canvasSize.value / 2,
        canvasSize.value / 2,
      )
    }
  }
  img.src = props.atlasData?.atlasImage || ''
}

watch(
  [() => props.atlasData?.atlasImage, canvasSize],
  () => {
    nextTick(() => {
      renderAtlasPreview()
    })
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4">
    <h3 class="flex items-center text-base text-gray-900 font-medium space-x-2 dark:text-gray-100">
      <i class="i-carbon-image text-green-600" />
      <span>{{ $t('export.confirmation.atlasPreview') }}</span>
    </h3>

    <div v-if="atlasData" class="rounded-lg bg-gray-50 p-4 space-y-4 dark:bg-gray-700">
      <!-- 图集预览 -->
      <div class="aspect-square overflow-hidden border border-gray-200 rounded bg-white dark:border-gray-600 dark:bg-gray-800">
        <canvas
          ref="atlasCanvas"
          class="h-full w-full"
          :width="canvasSize"
          :height="canvasSize"
          style="image-rendering: pixelated"
          :title="$t('export.confirmation.atlasPreviewTooltip')"
        />
      </div>

      <!-- 图集信息 -->
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-gray-500 dark:text-gray-400">{{ $t('export.confirmation.iconCount') }}:</span>
          <span class="ml-1 text-gray-900 dark:text-gray-100">{{ atlasData.iconCount || 0 }}</span>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-400">{{ $t('export.confirmation.atlasSize') }}:</span>
          <span class="ml-1 text-gray-900 dark:text-gray-100">{{ atlasData.atlasSize || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-400">{{ $t('export.confirmation.layout') }}:</span>
          <span class="ml-1 text-gray-900 dark:text-gray-100">{{ atlasData.layout || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-400">{{ $t('export.confirmation.fontFiles') }}:</span>
          <span class="ml-1 text-gray-900 dark:text-gray-100">{{ atlasData.fontFiles?.length || 0 }}</span>
        </div>
      </div>

      <!-- 字体文件列表 -->
      <div v-if="atlasData.fontFiles?.length" class="border-t border-gray-200 pt-3 dark:border-gray-600">
        <div class="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {{ $t('export.confirmation.fontFilesList') }}:
        </div>
        <div class="space-y-1">
          <div
            v-for="fontFile in atlasData.fontFiles"
            :key="fontFile"
            class="rounded bg-gray-100 px-2 py-1 text-xs font-mono dark:bg-gray-600"
          >
            {{ fontFile }}
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据时的占位符 -->
    <div v-else class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
      <div class="text-center text-sm text-gray-500 dark:text-gray-400">
        <i class="i-carbon-image mb-2 block text-2xl" />
        <div>{{ $t('common.loading') }}</div>
      </div>
    </div>
  </div>
</template>
