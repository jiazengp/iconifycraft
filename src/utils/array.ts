/**
 * 数组操作工具函数
 * @fileoverview 提供常用的数组操作方法，支持泛型类型
 */

/**
 * 将数组按指定大小分块
 * @template T - 数组元素类型
 * @param {T[]} array - 要分块的数组
 * @param {number} size - 每块的大小
 * @returns {T[][]} 分块后的二维数组
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 移除数组中的重复项
 * @template T - 数组元素类型
 * @param {T[]} array - 包含重复项的数组
 * @returns {T[]} 去重后的数组
 * @example
 * ```typescript
 * unique([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
 * ```
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}
