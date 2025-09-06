/**
 * 验证工具函数
 */

import { z } from 'zod'

/**
 * 验证是否为有效的PNG图片数据
 */
export function isValidPNG(data: Uint8Array): boolean {
  // PNG文件签名：89 50 4E 47 0D 0A 1A 0A
  const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]

  if (data.length < 8)
    return false

  for (let i = 0; i < 8; i++) {
    if (data[i] !== pngSignature[i])
      return false
  }

  return true
}

/**
 * 验证ZIP文件签名
 */
export function isValidZIP(data: Uint8Array): boolean {
  // ZIP文件签名：50 4B 03 04 或 50 4B 05 06 或 50 4B 07 08
  if (data.length < 4)
    return false

  return (data[0] === 0x50 && data[1] === 0x4B
    && (data[2] === 0x03 || data[2] === 0x05 || data[2] === 0x07))
}

/**
 * 验证文件大小
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize
}

/**
 * 验证Unicode编码点范围
 */
export function isValidUnicodeRange(start: number, end: number): boolean {
  return start >= 0x0000 && start <= 0x10FFFF
    && end >= 0x0000 && end <= 0x10FFFF
    && start <= end
}

/**
 * 验证Minecraft版本格式
 */
export const MinecraftVersionSchema = z.string().regex(
  /^\d+\.\d+(\.\d+)?(-\w+)?$/,
  'Invalid Minecraft version format',
)

/**
 * 验证材质包格式
 */
export const ResourcePackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  textures: z.array(z.object({
    id: z.string().min(1),
    namespace: z.string().min(1),
    category: z.enum(['block', 'item']),
    path: z.string().min(1),
    data: z.instanceof(Uint8Array),
  })),
  size: z.number().positive(),
  uploadedAt: z.date(),
})

/**
 * 验证图集配置
 */
export const AtlasOptionsSchema = z.object({
  size: z.number().min(64).max(4096),
  tileSize: z.number().min(8).max(128),
  padding: z.number().min(0).max(32),
  backgroundColor: z.string().optional(),
  compression: z.enum(['lossless', 'lossy']).optional(),
  quality: z.number().min(0).max(1).optional(),
})

/**
 * 验证颜色值
 */
export function isValidColor(color: string): boolean {
  const colorRegex = /^#(?:[A-F0-9]{6}|[A-F0-9]{3})$/i
  return colorRegex.test(color) || color === 'transparent'
}

/**
 * 验证URL格式
 */
export function isValidURL(url: string): boolean {
  try {
    return URL.canParse(url)
  }
  catch {
    return false
  }
}

/**
 * 验证邮箱格式
 */
export const EmailSchema = z.string().email('Invalid email format')

/**
 * 验证命名空间格式
 */
export function isValidNamespace(namespace: string): boolean {
  return /^[a-z0-9_.-]+$/.test(namespace)
}
