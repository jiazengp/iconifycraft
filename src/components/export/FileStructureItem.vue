<script setup lang="ts">
import type { FileStructureItem as FileStructureItemType } from '~/types/export'

interface Props {
  item: FileStructureItemType
  depth: number
}

defineProps<Props>()

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'json':
      return 'i-carbon-document'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'i-carbon-image'
    case 'mcmeta':
      return 'i-carbon-settings'
    case 'txt':
    case 'md':
    case 'license':
      return 'i-carbon-document-blank'
    default:
      return 'i-carbon-document-unknown'
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}
</script>

<template>
  <div
    class="flex items-center rounded px-1 py-0.5 space-x-1 hover:bg-gray-100 dark:hover:bg-gray-600"
    :style="{ paddingLeft: `${depth * 16 + 4}px` }"
  >
    <!-- 图标 -->
    <i
      :class="[
        item.type === 'folder' ? 'i-carbon-folder' : getFileIcon(item.name),
        item.type === 'folder' ? 'text-blue-500' : 'text-gray-500',
      ]"
      class="flex-shrink-0 text-xs"
    />

    <!-- 文件名 -->
    <span
      class="flex-1 truncate" :class="[
        item.type === 'folder'
          ? 'text-gray-900 dark:text-gray-100 font-medium'
          : 'text-gray-700 dark:text-gray-300',
      ]"
    >
      {{ item.name }}
    </span>

    <!-- 文件大小 -->
    <span
      v-if="item.type === 'file' && item.size"
      class="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500"
    >
      {{ formatFileSize(item.size) }}
    </span>
  </div>

  <!-- 子文件夹内容 -->
  <template v-if="item.type === 'folder' && item.children">
    <FileStructureItem
      v-for="child in item.children"
      :key="child.path"
      :item="child"
      :depth="depth + 1"
    />
  </template>
</template>
