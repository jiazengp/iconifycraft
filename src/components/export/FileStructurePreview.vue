<script setup lang="ts">
import type { ExportConfirmationData } from '~/types/export'
import { computed } from 'vue'

interface Props {
  exportData: ExportConfirmationData
  licenseFileName?: string
  fontName?: string
}

const props = withDefaults(defineProps<Props>(), {
  fontName: 'minecraft:default',
})

// 解析字体名称
const fontNamespace = computed(() => {
  const fontName = props.fontName || 'minecraft:default'
  return fontName.includes(':') ? fontName.split(':', 2)[0] : 'minecraft'
})

const fontFileName = computed(() => {
  const fontName = props.fontName || 'minecraft:default'
  return fontName.includes(':') ? fontName.split(':', 2)[1] : fontName
})

const safePackName = computed(() => {
  let safeName = props.exportData.packName?.replace(/[^a-z0-9\u4E00-\u9FFF]/gi, '_') || ''

  // 清理连续的下划线
  safeName = safeName.replace(/_+/g, '_').replace(/^_|_$/g, '')

  // 如果处理后的名称为空，使用默认名称
  if (!safeName) {
    safeName = 'minecraft_icons'
  }

  return safeName
})
</script>

<template>
  <div class="space-y-4">
    <h3 class="flex items-center text-base text-gray-900 font-medium space-x-2 dark:text-gray-100">
      <i class="i-carbon-folder text-blue-600" />
      <span>{{ $t('export.confirmation.fileStructure') }}</span>
    </h3>

    <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
      <div class="text-xs text-gray-700 font-mono space-y-1 dark:text-gray-300">
        <!-- 根目录 -->
        <div class="flex items-center space-x-1">
          <i class="i-carbon-folder-filled text-yellow-600" />
          <span class="font-medium">{{ safePackName }}_yymmddHHmm.zip</span>
        </div>

        <!-- pack.mcmeta -->
        <div class="ml-4 flex items-center space-x-1">
          <i class="i-carbon-document text-blue-600" />
          <span>pack.mcmeta</span>
        </div>

        <!-- pack.png -->
        <div v-if="exportData.packIcon" class="ml-4 flex items-center space-x-1">
          <i class="i-carbon-image text-green-600" />
          <span>pack.png</span>
        </div>

        <!-- LICENSE 文件 -->
        <div v-if="licenseFileName" class="ml-4 flex items-center space-x-1">
          <i class="i-carbon-document text-orange-600" />
          <span>{{ licenseFileName }}</span>
        </div>

        <!-- assets 文件夹 -->
        <div class="ml-4 flex items-center space-x-1">
          <i class="i-carbon-folder-filled text-yellow-600" />
          <span>assets/</span>
        </div>

        <!-- minecraft 命名空间文件夹 -->
        <div class="ml-8 flex items-center space-x-1">
          <i class="i-carbon-folder-filled text-yellow-600" />
          <span>{{ fontNamespace }}/</span>
        </div>

        <!-- font 文件夹 -->
        <div class="ml-12 flex items-center space-x-1">
          <i class="i-carbon-folder-filled text-yellow-600" />
          <span>font/</span>
        </div>

        <!-- 字体文件 -->
        <div class="ml-16 flex items-center space-x-1">
          <i class="i-carbon-document text-purple-600" />
          <span>{{ fontFileName }}.json</span>
        </div>

        <!-- textures 文件夹 -->
        <div class="ml-12 flex items-center space-x-1">
          <i class="i-carbon-folder-filled text-yellow-600" />
          <span>textures/</span>
        </div>

        <!-- font 子文件夹 -->
        <div class="ml-16 flex items-center space-x-1">
          <i class="i-carbon-folder-filled text-yellow-600" />
          <span>font/</span>
        </div>

        <!-- 图集文件 -->
        <div class="ml-20 flex items-center space-x-1">
          <i class="i-carbon-image text-green-600" />
          <span>{{ fontFileName }}.png</span>
        </div>
      </div>
    </div>
  </div>
</template>
