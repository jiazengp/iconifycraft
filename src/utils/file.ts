/**
 * 文件处理工具函数
 */

/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/**
 * 验证文件类型
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type =>
    file.type === type || file.name.toLowerCase().endsWith(type.replace('/', '.')),
  )
}

/**
 * 读取文件为DataURL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * 读取文件为ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 生成安全的文件名
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^\w\u4E00-\u9FFF.\-]/g, '_')
    .replace(/_{2,}/g, '_')
    .trim()
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : ''
}

/**
 * 创建下载链接
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
