/**
 * 通用类型定义
 */

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt?: Date
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * 排序参数
 */
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

/**
 * 过滤参数
 */
export interface FilterParams {
  [key: string]: unknown
}

/**
 * 搜索参数
 */
export interface SearchParams {
  query: string
  fields?: string[]
}

/**
 * API响应格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  code?: string | number
  timestamp: number
}

/**
 * 错误响应
 */
export interface ApiError {
  success: false
  message: string
  code: string | number
  details?: Record<string, unknown>
  timestamp: number
}

/**
 * 文件信息
 */
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  data?: ArrayBuffer | Uint8Array
}

/**
 * 位置信息
 */
export interface Position {
  x: number
  y: number
}

/**
 * 尺寸信息
 */
export interface Size {
  width: number
  height: number
}

/**
 * 矩形区域
 */
export interface Rectangle extends Position, Size {}

/**
 * 颜色值
 */
export type ColorValue = string | { r: number, g: number, b: number, a?: number }

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * 语言代码
 */
export type LanguageCode = 'zh-CN' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'ru'

/**
 * 状态类型
 */
export type Status = 'idle' | 'loading' | 'success' | 'error'

/**
 * 操作结果
 */
export interface OperationResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
}

/**
 * 键值对
 */
export interface KeyValuePair<K = string, V = unknown> {
  key: K
  value: V
}

/**
 * 统计信息
 */
export interface Statistics {
  total: number
  categories: Record<string, number>
  trends?: Record<string, number[]>
}

/**
 * 进度信息
 */
export interface Progress {
  current: number
  total: number
  percentage: number
  stage?: string
  message?: string
}

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 提取类型的键
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

/**
 * 数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * 函数参数类型
 */
export type FunctionArgs<T> = T extends (...args: infer A) => unknown ? A : never

/**
 * Promise解析类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T
