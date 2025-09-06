<script setup lang="ts">
import type { FileStructureItem as FileStructureItemType } from '~/types/export'
import { computed } from 'vue'
import FileStructureItem from './FileStructureItem.vue'

interface Props {
  fileStructure?: FileStructureItemType[]
}

const props = defineProps<Props>()

const totalFiles = computed(() => {
  if (!props.fileStructure)
    return 0

  const countFiles = (items: FileStructureItemType[]): number => {
    return items.reduce((count, item) => {
      if (item.type === 'file') {
        return count + 1
      }
      else if (item.children) {
        return count + countFiles(item.children)
      }
      return count
    }, 0)
  }

  return countFiles(props.fileStructure)
})

const totalSize = computed(() => {
  if (!props.fileStructure)
    return 0

  const calculateSize = (items: FileStructureItemType[]): number => {
    return items.reduce((size, item) => {
      if (item.type === 'file' && item.size) {
        return size + item.size
      }
      else if (item.children) {
        return size + calculateSize(item.children)
      }
      return size
    }, 0)
  }

  return calculateSize(props.fileStructure)
})

function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="flex items-center text-base text-gray-900 font-medium space-x-2 dark:text-gray-100">
      <i class="i-carbon-folder text-purple-600" />
      <span>{{ $t('export.confirmation.fileStructure') }}</span>
    </h3>

    <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
      <div v-if="fileStructure && fileStructure.length > 0" class="max-h-64 overflow-y-auto text-xs font-mono space-y-1">
        <FileStructureItem
          v-for="item in fileStructure"
          :key="item.path"
          :item="item"
          :depth="0"
        />
      </div>

      <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">
        <i class="i-carbon-folder-off mb-2 text-2xl" />
        <p class="text-sm">
          {{ $t('common.empty') }}
        </p>
      </div>

      <!-- 统计信息 -->
      <div class="grid grid-cols-2 mt-4 gap-4 border-t border-gray-200 pt-3 text-xs dark:border-gray-600">
        <div>
          <span class="text-gray-500 dark:text-gray-400">{{ $t('export.confirmation.totalFiles') }}:</span>
          <span class="ml-1 text-gray-900 dark:text-gray-100">{{ totalFiles }}</span>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-400">{{ $t('export.confirmation.estimatedSize') }}:</span>
          <span class="ml-1 text-gray-900 dark:text-gray-100">{{ formatFileSize(totalSize) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
