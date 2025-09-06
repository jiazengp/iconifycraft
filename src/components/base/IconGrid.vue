<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import CategoryLabel from '../CategoryLabel.vue'

interface IconItem {
  id: string
  name: string
  unicode: string
  unicodeChar: string
  translationKey: string
  category: string
  namespace: string
  x: number
  y: number
  sourcePack?: string
}

interface Props {
  icons: IconItem[]
  atlasImage: string
  iconSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 32,
})

const emit = defineEmits<{
  copyUnicode: [unicode: string]
  copyTranslation: [translationKey: string]
  showDetail: [icon: IconItem]
}>()

const containerRef = ref<HTMLElement>()
const canvasRefs = ref<Map<string, HTMLCanvasElement>>(new Map())

// 简化实现，不使用虚拟列表
const itemHeight = 52
const visibleRows = computed(() => props.icons)
const totalHeight = computed(() => props.icons.length * itemHeight)

// Canvas引用管理
function setCanvasRef(id: string, canvas: HTMLCanvasElement | null) {
  if (canvas) {
    canvasRefs.value.set(id, canvas)
  }
  else {
    canvasRefs.value.delete(id)
  }
}

// 渲染图标到Canvas
function renderIconToCanvas(icon: IconItem) {
  const canvas = canvasRefs.value.get(icon.id)
  if (!canvas)
    return

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  try {
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, props.iconSize, props.iconSize)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(
        img,
        icon.x,
        icon.y,
        16,
        16,
        0,
        0,
        props.iconSize,
        props.iconSize,
      )
    }
    img.src = props.atlasImage
  }
  catch {
    // 渲染错误占位符
    ctx.fillStyle = '#ff4444'
    ctx.fillRect(0, 0, props.iconSize, props.iconSize)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.floor(props.iconSize / 4)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ERR', props.iconSize / 2, props.iconSize / 2)
  }
}

// 监听可见项变化，渲染图标
watch(visibleRows, (newRows) => {
  nextTick(() => {
    newRows.forEach(row => renderIconToCanvas(row))
  })
}, { immediate: true })

// 监听图集图像变化
watch(() => props.atlasImage, () => {
  nextTick(() => {
    visibleRows.value.forEach(row => renderIconToCanvas(row))
  })
})
</script>

<template>
  <div class="icon-grid">
    <!-- 虚拟滚动容器 -->
    <div
      ref="containerRef"
      class="h-96 overflow-auto border border-gray-200 rounded-lg bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
        <!-- 渲染可见的图标行 -->
        <div
          v-for="(row, rowIndex) in visibleRows"
          :key="rowIndex"
          :style="{
            position: 'absolute',
            top: `${rowIndex * itemHeight}px`,
            left: 0,
            right: 0,
            height: `${itemHeight}px`,
          }"
          class="flex items-center px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <!-- 图标预览 -->
          <div class="mr-3 flex-shrink-0">
            <canvas
              :ref="el => setCanvasRef(row.id, el as HTMLCanvasElement)"
              :width="iconSize"
              :height="iconSize"
              class="pixelated border border-gray-200 rounded bg-transparent dark:border-gray-600"
              :title="`${row.name} (${row.unicode})`"
            />
          </div>

          <!-- 图标信息 -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center space-x-2">
              <!-- 图标名称 -->
              <span class="truncate text-sm text-gray-900 font-medium dark:text-gray-100">
                {{ row.name }}
              </span>

              <!-- 分类标签 -->
              <CategoryLabel
                :category="row.category"
              />
            </div>

            <!-- 详细信息 -->
            <div class="mt-1 flex items-center text-xs text-gray-500 space-x-4 dark:text-gray-400">
              <span>{{ row.unicode }}</span>
              <span>{{ row.namespace }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-shrink-0 space-x-1">
            <!-- 复制Unicode -->
            <button
              class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
              :title="$t('icons.copy.unicode')"
              @click="emit('copyUnicode', row.unicodeChar)"
            >
              <i class="i-carbon-copy text-sm" />
            </button>

            <!-- 复制翻译键 -->
            <button
              class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-600 dark:hover:text-green-400"
              :title="$t('icons.copy.translationKey')"
              @click="emit('copyTranslation', row.translationKey)"
            >
              <i class="i-carbon-document text-sm" />
            </button>

            <!-- 详情 -->
            <button
              class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-600 dark:hover:text-purple-400"
              :title="$t('icons.detail.title')"
              @click="emit('showDetail', row)"
            >
              <i class="i-carbon-information text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="icons.length === 0"
      class="py-12 text-center text-gray-500 dark:text-gray-400"
    >
      <i class="i-carbon-image mb-4 text-4xl" />
      <p>{{ $t('common.empty') }}</p>
    </div>
  </div>
</template>

<style scoped>
.pixelated {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
