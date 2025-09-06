<script setup lang="ts">
import type { AtlasGroup } from '~/types/atlas'
import type { IconItem } from '~/types/icon'
import { computed, ref } from 'vue'
import { getAtlasImageFromGroups } from '~/utils/canvas-utils'

import { logger } from '~/utils/logger'

interface Props {
  /** 图标数据 */
  icon: IconItem
  /** Atlas组数据 - 使用标准类型 */
  atlasGroups?: AtlasGroup[]
  /** 容器尺寸 */
  size?: number
  /** 材质大小（从atlas中提取的源尺寸） */
  textureSize?: number
  /** 容器CSS类名 */
  containerClass?: string
  /** 图片CSS类名 */
  imageClass?: string
  /** 错误占位符样式 */
  errorStyle?: 'simple' | 'detailed'
  /** 是否显示透明背景网格 */
  showTransparentBg?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  atlasGroups: () => [],
  size: 32,
  textureSize: 16,
  containerClass: '',
  imageClass: '',
  errorStyle: 'detailed',
  showTransparentBg: false,
})

const hasError = ref(false)

// 调试：监控图标数据变化
if (process.env.NODE_ENV === 'development') {
  watch(() => [props.icon.x, props.icon.y, props.icon.atlasIndex], ([newX, newY, newIndex], [oldX, oldY, oldIndex]) => {
    if (oldX !== undefined && (newX !== oldX || newY !== oldY || newIndex !== oldIndex)) {
      logger.warn(`Icon data changed for ${props.icon.id}:`, {
        position: { old: [oldX, oldY], new: [newX, newY] },
        atlasIndex: { old: oldIndex, new: newIndex },
      })
    }
  })
}

// 获取atlas图像URL
const atlasImageUrl = computed(() => {
  const atlasIndex = props.icon.atlasIndex || 0
  return getAtlasImageFromGroups(props.atlasGroups, atlasIndex)
})

// 容器样式
const containerStyle = computed(() => {
  const pixelSize = Math.floor(props.size) // 确保容器使用整数像素
  const baseStyle = {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
    position: 'relative' as const,
    overflow: 'hidden' as const, // 确保超出的部分被裁剪
    display: 'block' as const, // 改为block，避免flex布局影响
    flexShrink: 0,
    // 强制像素对齐
    transformStyle: 'preserve-3d' as const,
  }

  // 添加透明背景网格
  if (props.showTransparentBg) {
    const gridSize = Math.floor(Math.max(4, pixelSize / 8)) // 网格大小也使用整数
    return {
      ...baseStyle,
      backgroundImage: `
        linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
      backgroundPosition: `0 0, 0 ${Math.floor(gridSize / 2)}px, ${Math.floor(gridSize / 2)}px -${Math.floor(gridSize / 2)}px, -${Math.floor(gridSize / 2)}px 0px`,
    }
  }

  return baseStyle
})

// Sprite样式 - 使用background-image实现sprite定位
const spriteStyle = computed(() => {
  if (!atlasImageUrl.value)
    return {}

  const atlasIndex = props.icon.atlasIndex || 0

  // 强化防御性检查
  if (!props.atlasGroups || props.atlasGroups.length === 0) {
    logger.warn(`No atlas groups available for icon:`, props.icon.id)
    return {}
  }

  if (atlasIndex < 0 || atlasIndex >= props.atlasGroups.length) {
    logger.warn(`Atlas index ${atlasIndex} out of bounds (0-${props.atlasGroups.length - 1}) for icon:`, props.icon.id)
    return {}
  }

  const currentAtlas = props.atlasGroups[atlasIndex]

  // 防御性检查：确保atlas存在且有有效尺寸
  if (!currentAtlas || !currentAtlas.size) {
    logger.warn(`Atlas not found or invalid for index ${atlasIndex}, icon:`, props.icon.id, currentAtlas)
    return {}
  }

  const atlasSize = currentAtlas.size
  const iconX = props.icon.x
  const iconY = props.icon.y
  const textureSize = props.textureSize

  // 边界检查：确保图标位置在atlas范围内
  if (iconX < 0 || iconY < 0 || iconX + textureSize > atlasSize || iconY + textureSize > atlasSize) {
    logger.warn(`Icon position out of atlas bounds:`, {
      iconId: props.icon.id,
      position: { x: iconX, y: iconY },
      atlasSize,
      textureSize,
    })
  }

  // 计算缩放比例：使用整数容器尺寸来确保一致性
  const pixelSize = Math.floor(props.size)
  const scale = pixelSize / textureSize

  // Atlas在背景中的显示尺寸
  const atlasDisplaySize = atlasSize * scale

  // 背景位置计算：使用整数像素定位，避免子像素偏移
  const bgPosX = Math.floor(-(iconX * scale))
  const bgPosY = Math.floor(-(iconY * scale))

  return {
    width: '100%',
    height: '100%',
    backgroundImage: `url(${atlasImageUrl.value})`,
    backgroundPosition: `${bgPosX}px ${bgPosY}px`,
    backgroundSize: `${Math.floor(atlasDisplaySize)}px ${Math.floor(atlasDisplaySize)}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const,
  }
})

// 错误占位符样式
const placeholderStyle = computed(() => ({
  width: '100%',
  height: '100%',
  backgroundColor: props.errorStyle === 'simple' ? '#ff4444' : '#f3f4f6',
  border: props.errorStyle === 'detailed' ? '1px solid #d1d5db' : 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: `${Math.max(8, props.size / 4)}px`,
  fontFamily: 'monospace',
  color: props.errorStyle === 'simple' ? 'white' : '#ef4444',
  fontWeight: 'bold',
}))

function onImageError() {
  hasError.value = true
  logger.warn('Failed to load atlas image for icon:', props.icon.id)
}
</script>

<template>
  <div
    class="icon-image" :class="[
      containerClass,
      { 'icon-error': hasError },
    ]"
    :style="containerStyle"
  >
    <!-- 使用background-image的方式更可控 -->
    <div
      v-if="atlasImageUrl && !hasError"
      class="icon-sprite"
      :style="spriteStyle"
      :alt="icon.name"
      @error="onImageError"
    />

    <!-- 错误占位符 -->
    <div
      v-else
      class="error-placeholder"
      :style="placeholderStyle"
    >
      <span class="error-text">ERR</span>
    </div>
  </div>
</template>

<style scoped>
.icon-image {
  background: transparent;
}

/* 暗色模式下的透明背景 */
:deep(.dark) .icon-image[data-transparent-bg='true'] {
  background-image:
    linear-gradient(45deg, #404040 25%, transparent 25%), linear-gradient(-45deg, #404040 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #404040 75%), linear-gradient(-45deg, transparent 75%, #404040 75%) !important;
}

.error-placeholder {
  position: relative;
}

.error-text {
  user-select: none;
}

/* 确保图像渲染为像素完美 */
.icon-sprite {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;

  /* 确保子像素渲染对齐 */
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;

  /* 防止抗锯齿 */
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: unset;
}
</style>
