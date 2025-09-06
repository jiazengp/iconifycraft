/**
 * 文件名生成工具
 */
import type { CustomMetadata } from '~/types/metadata'

/**
 * 生成时间戳文件名
 */
export function generateTimestampFilename(metadata: CustomMetadata, sha1?: string): string {
  const now = new Date()
  const timestamp = now.getFullYear().toString().slice(2)
    + (now.getMonth() + 1).toString().padStart(2, '0')
    + now.getDate().toString().padStart(2, '0')
    + now.getHours().toString().padStart(2, '0')
    + now.getMinutes().toString().padStart(2, '0')

  const safeName = metadata.name.replace(/[^a-z0-9\u4E00-\u9FFF]/gi, '_')

  // 如果有 SHA1，添加前8位到文件名中
  if (sha1) {
    const shortSha1 = sha1.substring(0, 8)
    return `${safeName}_${timestamp}_${shortSha1}.zip`
  }

  return `${safeName}_${timestamp}.zip`
}

/**
 * 生成安全的文件名（移除非法字符）
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*]/g, '_')
}

/**
 * 生成版本化文件名
 */
export function generateVersionedFilename(name: string, version: string, extension = ''): string {
  const safeName = sanitizeFilename(name)
  const safeVersion = version.replace(/\./g, '_')
  return `${safeName}_v${safeVersion}${extension}`
}
