<script setup lang="ts">
import type { AtlasGroup } from '~/types/atlas'
import type { IconItem } from '~/types/icon'
import { computed, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useIconIntersectionObserver } from '~/composables/useIconIntersectionObserver'
import { useImageCache } from '~/composables/useImageCache'
import { drawErrorPlaceholder, getAtlasImageFromGroups } from '~/utils/canvas-utils'
import { logger } from '~/utils/logger'

interface Props {
  /** 图标数据 */
  icon: IconItem
  /** Atlas组数据 */
  atlasGroups?: AtlasGroup[]
  /** Canvas尺寸 */
  size?: number
  /** 材质大小（从atlas中提取的源尺寸） */
  textureSize?: number
  /** CSS类名 */
  canvasClass?: string
  /** 错误占位符样式 */
  errorStyle?: 'simple' | 'detailed'
}

const props = withDefaults(defineProps<Props>(), {
  atlasGroups: () => [],
  size: 32,
  textureSize: 16,
  canvasClass: 'w-full h-full',
  errorStyle: 'detailed',
})

const canvasRef = ref<HTMLCanvasElement>()
const { getImage, releaseImage } = useImageCache()
const currentImageUrl = shallowRef<string>('')
const isRendering = ref(false)

// 可见性检测优化
const { targetRef: intersectionRef, isIntersecting } = useIconIntersectionObserver(
  (visible) => {
    if (visible) {
      // 元素变为可见时渲染
      nextTick(() => debouncedRender())
    }
  },
  {
    rootMargin: '100px', // 提前100px开始渲染
    threshold: 0,
  },
)

const canvasStyle = computed(() => ({
  imageRendering: 'pixelated' as const,
}))

// 优化的渲染缓存key
const renderKey = computed(() => {
  const atlasIndex = props.icon.atlasIndex || 0
  return `${props.icon.id}-${atlasIndex}-${props.icon.x}-${props.icon.y}-${props.size}`
})

// 防抖渲染
let renderTimer: ReturnType<typeof setTimeout> | null = null

async function renderIcon() {
  // 防止重复渲染
  if (isRendering.value)
    return

  if (!canvasRef.value)
    return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  isRendering.value = true

  try {
    // 清除画布
    ctx.clearRect(0, 0, props.size, props.size)

    // 获取对应的atlas图像URL
    const atlasIndex = props.icon.atlasIndex || 0
    const atlasImageUrl = getAtlasImageFromGroups(props.atlasGroups, atlasIndex)

    if (!atlasImageUrl) {
      logger.warn('No atlas image found for icon:', props.icon.id, 'atlasIndex:', atlasIndex)
      drawErrorPlaceholder(ctx, props.size, props.size, props.errorStyle)
      return
    }

    // 释放之前的图像引用
    if (currentImageUrl.value && currentImageUrl.value !== atlasImageUrl) {
      releaseImage(currentImageUrl.value)
    }
    currentImageUrl.value = atlasImageUrl

    try {
      // 使用缓存获取图像
      const img = await getImage(atlasImageUrl)

      // 确保组件还存在且参数没变
      if (!canvasRef.value || !ctx)
        return

      // 配置渲染上下文
      ctx.imageSmoothingEnabled = false

      // 渲染图标
      ctx.drawImage(
        img,
        props.icon.x,
        props.icon.y,
        props.textureSize,
        props.textureSize, // 源区域
        0,
        0,
        props.size,
        props.size, // 目标区域
      )
    }
    catch (error) {
      logger.warn('Failed to load or render icon:', props.icon.id, error)
      drawErrorPlaceholder(ctx, props.size, props.size, props.errorStyle)
    }
  }
  finally {
    isRendering.value = false
  }
}

// 防抖的渲染函数
function debouncedRender() {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }

  renderTimer = setTimeout(() => {
    renderIcon()
    renderTimer = null
  }, 16) // ~60fps
}

// 监听关键属性变化，但只在可见时渲染
watch(
  renderKey,
  () => {
    // 只有在元素可见时才渲染
    if (isIntersecting.value) {
      nextTick(() => {
        debouncedRender()
      })
    }
  },
  { immediate: true },
)

// 合并canvas和intersection的ref
watch(canvasRef, (canvas) => {
  if (canvas) {
    intersectionRef.value = canvas
  }
})

// 组件卸载时清理
onUnmounted(() => {
  if (renderTimer) {
    clearTimeout(renderTimer)
  }

  // 释放图像引用
  if (currentImageUrl.value) {
    releaseImage(currentImageUrl.value)
  }
})

// 暴露渲染方法供外部调用
defineExpose({
  renderIcon: debouncedRender,
})
</script>

<template>
  <canvas
    ref="canvasRef"
    :width="size"
    :height="size"
    :class="canvasClass"
    :style="canvasStyle"
  />
</template>

<style scoped>
canvas {
  display: block;
}
</style>
