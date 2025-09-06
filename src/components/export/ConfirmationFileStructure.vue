<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  packName: string
  hasPackIcon: boolean
  licenseFileName?: string
  fontFileNames: string[]
  includeTranslationKeys: boolean
  atlasFileNames: string[]
}

const props = defineProps<Props>()

const safePackName = computed(() => {
  let safeName = props.packName?.replace(/[^a-z0-9\u4E00-\u9FFF]/gi, '_') || ''

  safeName = safeName.replace(/_+/g, '_').replace(/^_|_$/g, '')

  if (!safeName) {
    safeName = 'minecraft_icons'
  }

  return safeName
})
</script>

<template>
  <div class="space-y-4">
    <h3 class="flex items-center text-base text-zinc-900 font-medium space-x-2 dark:text-zinc-100">
      <i class="i-carbon-folder text-blue-600" />
      <span>{{ $t('export.confirmation.fileStructure') }}</span>
    </h3>

    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-700">
      <div class="text-xs text-zinc-700 font-mono space-y-1 dark:text-zinc-300">
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
        <div v-if="hasPackIcon" class="ml-4 flex items-center space-x-1">
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
          <span>minecraft/</span>
        </div>

        <!-- font 文件夹 -->
        <div class="ml-12 flex items-center space-x-1">
          <i class="i-carbon-folder-filled text-yellow-600" />
          <span>font/</span>
        </div>

        <!-- 字体文件 -->
        <template v-for="fontName in fontFileNames" :key="fontName">
          <div class="ml-16 flex items-center space-x-1">
            <i class="i-carbon-document text-purple-600" />
            <span>{{ fontName }}.json</span>
          </div>
        </template>

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
        <template v-for="(atlasName, index) in atlasFileNames" :key="atlasName">
          <div v-if="index < 3" class="ml-20 flex items-center space-x-1">
            <i class="i-carbon-image text-green-600" />
            <span>{{ atlasName }}.png</span>
          </div>
        </template>

        <div v-if="atlasFileNames.length > 3" class="ml-20 flex items-center text-zinc-500 space-x-1 dark:text-zinc-400">
          <i class="i-carbon-more-horizontal" />
          <span class="text-xs">{{ $t('export.fileStructure.moreFiles', { count: atlasFileNames.length - 3 }) }}</span>
        </div>

        <!-- 翻译文件 -->
        <template v-if="includeTranslationKeys">
          <div class="ml-12 flex items-center space-x-1">
            <i class="i-carbon-folder-filled text-yellow-600" />
            <span>lang/</span>
          </div>
          <div class="ml-16 flex items-center space-x-1">
            <i class="i-carbon-document text-blue-600" />
            <span>en_us.json</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
