/**
 * 格式化工具函数
 */

/**
 * 格式化Unicode字符
 */
export function formatUnicode(codePoint: number): string {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
}

/**
 * 格式化文件大小
 */
export function formatStorage(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
}
