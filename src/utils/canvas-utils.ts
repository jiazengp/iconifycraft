/**
 * Canvas绘制工具函数
 */
import type { AtlasGroup } from '~/types/atlas'
import { logger } from '~/utils/logger'

/**
 * 绘制错误占位符
 * @param ctx - Canvas 2D上下文
 * @param width - 宽度
 * @param height - 高度
 * @param style - 样式选择: 'simple' | 'detailed'
 */
export function drawErrorPlaceholder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: 'simple' | 'detailed' = 'simple',
) {
  try {
    if (style === 'simple') {
      // 简单的红色背景 + ERR文字（用于详情对话框）
      ctx.fillStyle = '#ff4444'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'
      ctx.font = `${Math.floor(Math.min(width, height) / 4)}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('ERR', width / 2, height / 2)
    }
    else {
      // 详细的灰色背景 + 边框 + X形状（用于图标列表）
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, width, height)

      // 绘制X形状表示错误
      ctx.strokeStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(4, 4)
      ctx.lineTo(width - 4, height - 4)
      ctx.moveTo(width - 4, 4)
      ctx.lineTo(4, height - 4)
      ctx.stroke()
    }
  }
  catch (error) {
    logger.warn('Failed to draw error placeholder:', error)
  }
}

/**
 * 根据图标的atlasIndex从atlasGroups中获取对应的atlas图像URL
 * @param atlasGroups - atlas组数组
 * @param atlasIndex - atlas索引
 * @returns atlas图像URL或null
 */
export function getAtlasImageFromGroups(
  atlasGroups: AtlasGroup[] | undefined,
  atlasIndex: number = 0,
): string | null {
  if (!atlasGroups || atlasIndex < 0 || atlasIndex >= atlasGroups.length) {
    return null
  }
  return atlasGroups[atlasIndex]?.atlasImage || null
}
