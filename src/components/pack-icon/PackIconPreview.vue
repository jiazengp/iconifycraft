<script setup lang="ts">
defineProps<{
  icon: File
  previewUrl: string
  iconInfo?: {
    width: number
    height: number
    hasTransparency: boolean
  } | null
}>()

defineEmits<{
  remove: []
  reupload: []
}>()

function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="group current-icon relative rounded-lg bg-zinc-50 p-4 dark:bg-zinc-700">
    <div class="flex items-start space-x-4">
      <!-- 图标预览 -->
      <div class="icon-preview flex-shrink-0">
        <div class="relative">
          <img
            :src="previewUrl"
            :alt="icon.name"
            class="h-16 w-16 border border-zinc-300 rounded object-contain dark:border-zinc-600"
            style="image-rendering: pixelated;"
          >
          <!-- 尺寸标签 -->
          <div class="absolute rounded bg-blue-600 px-1 py-0.5 text-xs text-white -bottom-2 -right-2">
            {{ iconInfo?.width }}x{{ iconInfo?.height }}
          </div>
        </div>
      </div>

      <!-- 图标信息 -->
      <div class="min-w-0 flex-1">
        <div class="mb-2">
          <h5 class="truncate pr-16 text-zinc-900 font-medium dark:text-zinc-100">
            {{ icon.name }}
          </h5>
        </div>

        <div class="text-sm text-zinc-600 space-y-1 dark:text-zinc-400">
          <div>{{ $t('packIcon.preview.size') }}: {{ formatFileSize(icon.size) }}</div>
          <div v-if="iconInfo">
            {{ $t('packIcon.preview.dimensions') }}: {{ iconInfo.width }}x{{ iconInfo.height }} {{ $t('common.pixels') }}
          </div>
          <div v-if="iconInfo?.hasTransparency">
            <i class="i-carbon-checkmark mr-1 text-green-600" />
            {{ $t('packIcon.preview.hasTransparency') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮按钮组 -->
    <div class="absolute right-2 top-2 flex opacity-0 transition-opacity duration-200 space-x-1 group-hover:opacity-100">
      <button
        class="h-6 w-6 flex items-center justify-center rounded bg-blue-600 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
        :title="$t('packIcon.actions.reupload')"
        @click="$emit('reupload')"
      >
        <i class="i-carbon-upload text-xs" />
      </button>
      <button
        class="h-6 w-6 flex items-center justify-center rounded bg-red-600 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
        :title="$t('packIcon.actions.remove')"
        @click="$emit('remove')"
      >
        <i class="i-carbon-trash-can text-xs" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.icon-preview img {
  background-image:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0px;
}

.dark .icon-preview img {
  background-image:
    linear-gradient(45deg, #404040 25%, transparent 25%), linear-gradient(-45deg, #404040 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #404040 75%), linear-gradient(-45deg, transparent 75%, #404040 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0px;
}
</style>
