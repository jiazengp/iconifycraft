<script setup lang="ts">
import type { AtlasGroup } from '~/types/atlas'
import type { IconItem } from '~/types/icon'
import { useIconDisplay } from '~/composables/useIconDisplay'
import IconImage from '../base/IconImage.vue'
import CategoryLabel from '../CategoryLabel.vue'

interface Props {
  icon: IconItem
  atlasGroups?: AtlasGroup[]
  iconSize?: number
}

interface Emits {
  (e: 'click', icon: IconItem): void
  (e: 'copyUnicode', unicode: string): void
  (e: 'copyTranslation', translationKey: string): void
  (e: 'viewDetail', icon: IconItem): void
}

const props = withDefaults(defineProps<Props>(), {
  atlasGroups: () => [],
  iconSize: 32,
})

defineEmits<Emits>()

// 使用图标显示逻辑 - 支持VueUse风格的MaybeRefOrGetter API
// 这里使用getter函数形式，也可以直接传递 props.icon (但props需要响应式)
const { translatedName } = useIconDisplay(() => props.icon)
</script>

<template>
  <div
    class="icon-item flex cursor-pointer items-center border border-zinc-200 rounded-lg transition-colors dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700"
    @click="$emit('click', icon)"
  >
    <!-- 图标预览 -->
    <div class="icon-preview mr-2 h-8 w-8 flex flex-shrink-0 items-center justify-center border border-zinc-300 rounded bg-white dark:border-zinc-600">
      <IconImage
        :icon="icon"
        :atlas-groups="atlasGroups"
        :size="iconSize"
        :texture-size="16"
        error-style="detailed"
        container-class="w-full h-full"
      />
    </div>

    <!-- 图标信息 -->
    <div class="mr-2 min-w-0 flex-1">
      <div class="mb-0.5 overflow-hidden text-sm text-zinc-900 font-medium dark:text-zinc-100">
        {{ translatedName }}
      </div>
      <div class="mb-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span class="flex-shrink-0 rounded bg-zinc-100 px-1 py-0.5 text-xs font-mono dark:bg-zinc-700">{{ icon.unicode }}</span>
        <CategoryLabel :category="icon.category" />
      </div>
      <div class="overflow-hidden text-xs text-zinc-400 leading-tight font-mono dark:text-zinc-500">
        {{ icon.translationKey }}
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-shrink-0 flex-col space-y-1">
      <button
        class="p-0.5 text-xs text-zinc-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
        :title="$t('icons.copy.unicode')"
        @click.stop="$emit('copyUnicode', icon.unicode)"
      >
        <i class="i-carbon-copy" />
      </button>
      <button
        class="p-0.5 text-xs text-gray-400 transition-colors hover:text-green-600 dark:hover:text-green-400"
        :title="$t('icons.copy.translationKey')"
        @click.stop="$emit('copyTranslation', icon.translationKey)"
      >
        <i class="i-carbon-translate" />
      </button>
      <button
        class="p-0.5 text-xs text-gray-400 transition-colors hover:text-purple-600 dark:hover:text-purple-400"
        :title="$t('icons.detail.title')"
        @click.stop="$emit('viewDetail', icon)"
      >
        <i class="i-carbon-information" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.icon-item {
  width: 100%;
  height: 72px;
  display: flex;
  align-items: center;
  padding: 10px 12px;
}

.icon-preview {
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

.dark .icon-preview {
  background-image:
    linear-gradient(45deg, #404040 25%, transparent 25%), linear-gradient(-45deg, #404040 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #404040 75%), linear-gradient(-45deg, transparent 75%, #404040 75%);
}
</style>
