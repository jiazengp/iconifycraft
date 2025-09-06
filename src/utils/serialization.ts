import { toRaw } from 'vue'
import { logger } from '~/utils/logger'

/**
 * 使用现代 structuredClone API 和 Vue 的 toRaw 进行数据序列化
 */
export function serializeForStorage<T>(obj: T): T {
  try {
    // 深度清理响应式代理和不可序列化对象
    const cleanedData = deepToRaw(obj)

    // 使用浏览器内置的 structuredClone 进行深拷贝
    // 这会自动处理 Uint8Array、Date、Blob 等复杂类型
    return structuredClone(cleanedData)
  }
  catch (error) {
    // 降级方案：手动序列化
    logger.warn('structuredClone failed, using fallback:', error)
    return deepCloneWithFallback(obj)
  }
}

export function deserializeFromStorage<T>(obj: T): T {
  // IndexedDB 存储的数据已经是结构化克隆，直接返回
  return obj
}

function deepToRaw<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj !== 'object') {
    return obj
  }

  // 特殊对象直接返回
  if (obj instanceof Blob || obj instanceof Uint8Array || obj instanceof Date) {
    return obj
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepToRaw(toRaw(item))) as T
  }

  // 处理普通对象
  const rawObj = toRaw(obj)
  const result = {} as Record<string, unknown>

  for (const key in rawObj) {
    if (Object.prototype.hasOwnProperty.call(rawObj, key)) {
      const value = (rawObj as Record<string, unknown>)[key]
      result[key] = deepToRaw(toRaw(value))
    }
  }

  return result as T
}

function deepCloneWithFallback<T>(obj: T): T {
  // 先进行深度toRaw处理
  const rawData = deepToRaw(obj)

  if (rawData === null || rawData === undefined) {
    return rawData
  }

  if (typeof rawData !== 'object') {
    return rawData
  }

  if (rawData instanceof Blob) {
    return rawData
  }

  if (rawData instanceof Uint8Array) {
    return new Uint8Array(rawData) as T
  }

  if (rawData instanceof Date) {
    return new Date(rawData) as T
  }

  if (Array.isArray(rawData)) {
    return rawData.map(deepCloneWithFallback) as T
  }

  const result = {} as Record<string, unknown>
  for (const key in rawData) {
    if (Object.prototype.hasOwnProperty.call(rawData, key)) {
      result[key] = deepCloneWithFallback((rawData as Record<string, unknown>)[key])
    }
  }
  return result as T
}
