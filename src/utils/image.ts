/**
 * 图像处理工具函数
 */

import { logger } from '~/utils/logger'

/**
 * 创建Canvas元素
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * 加载图片
 */
export function loadImage(src: string | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = typeof src === 'string' ? src : URL.createObjectURL(src)

    img.onload = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      resolve(img)
    }

    img.onerror = () => {
      if (typeof src !== 'string') {
        URL.revokeObjectURL(url)
      }
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Canvas转Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      }
      else {
        reject(new Error('Failed to convert canvas to blob'))
      }
    }, type, quality)
  })
}

/**
 * 调整图片大小
 */
export async function resizeImage(
  source: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  ctx.imageSmoothingEnabled = false // 像素艺术风格
  ctx.drawImage(source, 0, 0, width, height)

  return canvas
}

/**
 * 创建纯色图像
 */
export function createSolidColorImage(
  width: number,
  height: number,
  color: string,
): HTMLCanvasElement {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)

  return canvas
}

/**
 * 获取图片像素数据
 */
export function getImageData(
  canvas: HTMLCanvasElement,
  x = 0,
  y = 0,
  width?: number,
  height?: number,
): ImageData {
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(x, y, width ?? canvas.width, height ?? canvas.height)
}

/**
 * 检测图片是否透明
 */
export function hasTransparency(imageData: ImageData): boolean {
  const { data } = imageData
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255)
      return true
  }
  return false
}

/**
 * 创建错误占位图
 */
export function createErrorPlaceholder(size: number): HTMLCanvasElement {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')!

  // 红色背景
  ctx.fillStyle = '#ff4444'
  ctx.fillRect(0, 0, size, size)

  // 白色错误文字
  ctx.fillStyle = '#ffffff'
  ctx.font = `${Math.floor(size / 4)}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ERR', size / 2, size / 2)

  return canvas
}

/**
 * 计算图片主色调
 */
export function getDominantColor(imageData: ImageData): [number, number, number] {
  const { data, width, height } = imageData
  const colorMap = new Map<string, number>()

  // 采样降低计算量
  const sampleSize = Math.max(1, Math.floor(Math.sqrt(width * height) / 50))

  for (let y = 0; y < height; y += sampleSize) {
    for (let x = 0; x < width; x += sampleSize) {
      const index = (y * width + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const a = data[index + 3]

      if (a > 128) { // 忽略透明像素
        const key = `${r},${g},${b}`
        colorMap.set(key, (colorMap.get(key) || 0) + 1)
      }
    }
  }

  let maxCount = 0
  let dominantColor: [number, number, number] = [0, 0, 0]

  for (const [colorKey, count] of colorMap) {
    if (count > maxCount) {
      maxCount = count
      dominantColor = colorKey.split(',').map(Number) as [number, number, number]
    }
  }

  return dominantColor
}

/**
 * 创建材质包图标（从图集提取）
 */
export async function createPackIcon(atlasBlob: Blob): Promise<Blob | null> {
  try {
    const canvas = createCanvas(64, 64)
    const ctx = canvas.getContext('2d')!

    const img = await loadImage(atlasBlob)
    ctx.drawImage(img, 0, 0, 64, 64, 0, 0, 64, 64)

    return await canvasToBlob(canvas, 'image/png')
  }
  catch {
    return null
  }
}

/**
 * 生成实例图标 - 从图集或用户图标生成小预览图
 */
export async function generateInstanceIcon(
  atlasImage: string,
  packIcon?: Uint8Array,
  size = 32,
): Promise<Uint8Array | undefined> {
  try {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    if (packIcon) {
      // 使用用户上传的图标
      const blob = new Blob([packIcon.buffer.slice(packIcon.byteOffset, packIcon.byteOffset + packIcon.byteLength) as ArrayBuffer], { type: 'image/png' })
      const img = await loadImage(blob)
      ctx.drawImage(img, 0, 0, size, size)
    }
    else {
      // 从图集生成4宫格图标
      const img = await loadImage(atlasImage)
      const iconSize = Math.min(img.width, img.height) / 16

      // 绘制2x2网格
      for (let i = 0; i < 4; i++) {
        const row = Math.floor(i / 2)
        const col = i % 2
        const cellSize = size / 2

        ctx.drawImage(
          img,
          col * iconSize,
          row * iconSize,
          iconSize,
          iconSize,
          col * cellSize,
          row * cellSize,
          cellSize,
          cellSize,
        )
      }
    }

    const blob = await canvasToBlob(canvas, 'image/png')
    const arrayBuffer = await blob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }
  catch (error) {
    logger.error('Error generating instance icon:', error)
    return undefined
  }
}

/**
 * 渲染包图标预览 - 在Canvas上绘制图标预览
 * 通用的图标预览渲染函数，用于多个组件复用
 */
export function renderPackIconPreview(
  canvas: HTMLCanvasElement,
  packIcon?: Uint8Array,
  atlasImage?: string,
  size = 48,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Cannot get canvas context'))
      return
    }

    ctx.clearRect(0, 0, size, size)
    ctx.imageSmoothingEnabled = false

    if (packIcon) {
      const blob = new Blob([packIcon.buffer.slice(packIcon.byteOffset, packIcon.byteOffset + packIcon.byteLength) as ArrayBuffer], { type: 'image/png' })
      const url = URL.createObjectURL(blob)

      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size)
        URL.revokeObjectURL(url)
        resolve()
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load pack icon'))
      }
      img.src = url
    }
    else if (atlasImage) {
      const img = new Image()
      img.onload = () => {
        const iconSize = Math.min(img.width, img.height) / 16
        for (let i = 0; i < 4; i++) {
          const row = Math.floor(i / 2)
          const col = i % 2
          const cellSize = size / 2
          ctx.drawImage(
            img,
            col * iconSize,
            row * iconSize,
            iconSize,
            iconSize,
            col * cellSize,
            row * cellSize,
            cellSize,
            cellSize,
          )
        }
        resolve()
      }
      img.onerror = () => reject(new Error('Failed to load atlas image'))
      img.src = atlasImage
    }
    else {
      resolve()
    }
  })
}
