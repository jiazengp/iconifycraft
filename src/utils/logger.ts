/* eslint-disable no-console */
import type { LogObject } from 'consola'
import type { LogContext, LogEntry, LogGroup } from './logger-context'
import type { GroupFilter, GroupTreeNode } from './logger-groups'
import { createConsola } from 'consola'
import { logContext } from './logger-context'
import { logGroupManager } from './logger-groups'

export interface LogStorageOptions {
  enabled: boolean
  maxEntries: number
  storageKey: string
}

export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5

// 定义日志级别常量
export const LOG_LEVELS = {
  SILENT: 0 as const,
  ERROR: 1 as const,
  WARN: 2 as const,
  INFO: 3 as const,
  DEBUG: 4 as const,
  VERBOSE: 5 as const,
}

export const LOG_LEVEL_NAMES = {
  [LOG_LEVELS.SILENT]: 'Silent',
  [LOG_LEVELS.ERROR]: 'Error',
  [LOG_LEVELS.WARN]: 'Warning',
  [LOG_LEVELS.INFO]: 'Info',
  [LOG_LEVELS.DEBUG]: 'Debug',
  [LOG_LEVELS.VERBOSE]: 'Verbose',
} as const

export interface LoggerSettings {
  level: LogLevel
  storage: LogStorageOptions
}

export interface StoredLogEntry {
  id: string
  timestamp: string
  level: number
  message: string
  module: string
  instanceId?: string
  sessionId?: string
  operation?: string
  args?: unknown[]
  error?: string
}

class LocalStorageReporter {
  constructor(private options: LogStorageOptions, private storageLevel: LogLevel) {}

  log(logObj: LogObject) {
    if (!this.options.enabled) {
      return
    }

    // 根据存储级别过滤日志
    if ((logObj.level ?? 0) > this.storageLevel) {
      return
    }

    try {
      const currentContext = logContext.getCurrentContext()
      const timestamp = new Date()

      // 创建增强的日志条目
      const logEntry: LogEntry = {
        id: crypto.randomUUID(),
        timestamp,
        level: logObj.level ?? 3,
        message: this.formatMessage(logObj),
        context: currentContext || { module: 'System' },
        args: logObj.args,
        error: logObj.type === 'error' ? new Error(String(logObj.message)) : undefined,
      }

      // 添加到分组管理器
      logContext.addLogEntry(logEntry)

      // 存储日志到不同的存储键
      this.storeLogEntry(logEntry)
    }
    catch (error) {
      console.error('Failed to save log to localStorage:', error)
    }
  }

  private formatMessage(logObj: LogObject): string {
    if (typeof logObj.message === 'string') {
      return logObj.message
    }
    return String(logObj.message)
  }

  private storeLogEntry(entry: LogEntry): void {
    // 根据实例ID决定存储位置
    const storageKey = entry.context.instanceId
      ? `${this.options.storageKey}_instance_${entry.context.instanceId}`
      : `${this.options.storageKey}_global`

    const logs = this.getLogsFromKey(storageKey)

    // 添加简化的日志条目用于存储
    const storageEntry: StoredLogEntry = {
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      module: entry.context.module,
      instanceId: entry.context.instanceId,
      sessionId: entry.context.sessionId,
      operation: entry.context.operation,
      args: entry.args,
      error: entry.error?.message,
    }

    logs.push(storageEntry)

    // 限制日志数量
    if (logs.length > this.options.maxEntries) {
      logs.splice(0, logs.length - this.options.maxEntries)
    }

    localStorage.setItem(storageKey, JSON.stringify(logs))
  }

  private getLogsFromKey(storageKey: string): StoredLogEntry[] {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    }
    catch {
      return []
    }
  }

  clearLogs() {
    // 清空全局日志
    localStorage.removeItem(`${this.options.storageKey}_global`)

    // 清空所有实例日志
    this.clearInstanceLogs()
  }

  clearInstanceLogs(instanceId?: string): void {
    if (instanceId) {
      // 清空特定实例的日志
      localStorage.removeItem(`${this.options.storageKey}_instance_${instanceId}`)
    }
    else {
      // 清空所有实例日志
      const keys = Object.keys(localStorage)
      const instanceLogKeys = keys.filter(key =>
        key.startsWith(`${this.options.storageKey}_instance_`),
      )
      instanceLogKeys.forEach(key => localStorage.removeItem(key))
    }
  }

  exportLogs(instanceId?: string): StoredLogEntry[] {
    if (instanceId) {
      return this.getLogsFromKey(`${this.options.storageKey}_instance_${instanceId}`)
    }

    // 导出所有日志
    const globalLogs = this.getLogsFromKey(`${this.options.storageKey}_global`)
    const instanceLogs: StoredLogEntry[] = []

    const keys = Object.keys(localStorage)
    const instanceLogKeys = keys.filter(key =>
      key.startsWith(`${this.options.storageKey}_instance_`),
    )

    instanceLogKeys.forEach((key) => {
      const logs = this.getLogsFromKey(key)
      instanceLogs.push(...logs)
    })

    return [...globalLogs, ...instanceLogs].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
  }

  getInstanceIds(): string[] {
    const keys = Object.keys(localStorage)
    const instanceLogKeys = keys.filter(key =>
      key.startsWith(`${this.options.storageKey}_instance_`),
    )

    return instanceLogKeys.map((key) => {
      const match = key.match(/_instance_(.+)$/)
      return match ? match[1] : ''
    }).filter(Boolean)
  }
}

class LoggerService {
  private consola!: ReturnType<typeof createConsola>
  private storageReporter: LocalStorageReporter
  private settings: LoggerSettings

  constructor() {
    this.settings = {
      level: 3, // Info level by default (for storage)
      storage: {
        enabled: false,
        maxEntries: 1000,
        storageKey: 'iconifycraft_logs',
      },
    }

    this.storageReporter = new LocalStorageReporter(this.settings.storage, this.settings.level)
    this.createLogger()
  }

  private createLogger() {
    const defaultConsola = createConsola()

    // 控制台输出级别：开发环境全量输出，生产环境不输出 debug
    const consoleLevel = import.meta.env.DEV ? LOG_LEVELS.VERBOSE : LOG_LEVELS.INFO

    this.consola = createConsola({
      level: consoleLevel,
      reporters: [
        // 保留默认的控制台输出
        ...defaultConsola.options.reporters,
        // 添加存储 reporter
        this.storageReporter,
      ],
    })
  }

  updateSettings(newSettings: Partial<LoggerSettings>) {
    this.settings = {
      ...this.settings,
      ...newSettings,
      storage: {
        ...this.settings.storage,
        ...newSettings.storage,
      },
    }

    this.storageReporter = new LocalStorageReporter(this.settings.storage, this.settings.level)
    this.createLogger()
  }

  // 日志方法
  silent(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.silent(message, ...optionalParams)
  }

  error(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.error(message, ...optionalParams)
  }

  warn(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.warn(message, ...optionalParams)
  }

  info(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.info(message, ...optionalParams)
  }

  debug(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.debug(message, ...optionalParams)
  }

  verbose(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.verbose(message, ...optionalParams)
  }

  // 特殊日志方法
  success(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.success(message, ...optionalParams)
  }

  start(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.start(message, ...optionalParams)
  }

  ready(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.ready(message, ...optionalParams)
  }

  box(message?: unknown, ...optionalParams: unknown[]) {
    this.consola.box(message, ...optionalParams)
  }

  // 增强的分组日志方法
  group(title: string, context?: Partial<LogContext>, ...optionalParams: unknown[]): string {
    const currentContext = logContext.getCurrentContext()
    const prefix = currentContext ? logContext.formatLogPrefix(currentContext) : ''
    const fullTitle = `${prefix} ${title}`

    // 创建日志分组
    const groupId = logContext.startGroup(title, context)

    this.consola.info(`🔽 ${fullTitle}`, ...optionalParams)

    // 在浏览器环境中使用原生的 console.group
    if (typeof window !== 'undefined' && console.group) {
      console.group(fullTitle, ...optionalParams)
    }

    return groupId
  }

  groupCollapsed(title: string, context?: Partial<LogContext>, ...optionalParams: unknown[]): string {
    const currentContext = logContext.getCurrentContext()
    const prefix = currentContext ? logContext.formatLogPrefix(currentContext) : ''
    const fullTitle = `${prefix} ${title}`

    // 创建日志分组
    const groupId = logContext.startGroup(title, context)

    this.consola.info(`▶️ ${fullTitle}`, ...optionalParams)

    // 在浏览器环境中使用原生的 console.groupCollapsed
    if (typeof window !== 'undefined' && console.groupCollapsed) {
      console.groupCollapsed(fullTitle, ...optionalParams)
    }

    return groupId
  }

  groupEnd(groupId?: string) {
    if (groupId) {
      const group = logContext.endGroup(groupId)
      if (group) {
        // 将完成的分组添加到分组管理器
        logGroupManager.addGroup(group)

        const duration = group.endTime
          ? group.endTime.getTime() - group.startTime.getTime()
          : 0

        this.consola.info(`🔼 ${group.title} (${duration}ms)`)
      }
    }
    else {
      this.consola.info('🔼 Group End')
    }

    // 在浏览器环境中使用原生的 console.groupEnd
    if (typeof window !== 'undefined' && console.groupEnd) {
      console.groupEnd()
    }
  }

  // 便捷的分组执行方法
  async withGroup<T>(
    title: string,
    fn: () => T | Promise<T>,
    context?: Partial<LogContext>,
  ): Promise<T> {
    const groupId = this.group(title, context)

    try {
      const result = await fn()
      return result
    }
    finally {
      this.groupEnd(groupId)
    }
  }

  // 计时器方法 (类似 console.time)
  time(label: string) {
    this.consola.info(`⏱️ Timer started: ${label}`)
    if (typeof window !== 'undefined' && console.time) {
      console.time(label)
    }
  }

  timeEnd(label: string) {
    this.consola.info(`⏱️ Timer ended: ${label}`)
    if (typeof window !== 'undefined' && console.timeEnd) {
      console.timeEnd(label)
    }
  }

  // 表格方法 (类似 console.table)
  table(data: unknown) {
    this.consola.info('📊 Table data:', data)
    if (typeof window !== 'undefined' && console.table) {
      console.table(data)
    }
  }

  // 工具方法
  clearLogs() {
    this.storageReporter.clearLogs()
  }

  exportLogs() {
    return this.storageReporter.exportLogs()
  }

  getCurrentLevel(): LogLevel {
    return this.settings.level
  }

  getStorageSettings() {
    return this.settings.storage
  }

  // 上下文管理方法
  setContext(context: Partial<LogContext>): void {
    logContext.setContext(context)
  }

  pushContext(context: Partial<LogContext>): void {
    logContext.pushContext(context)
  }

  popContext(): LogContext | null {
    return logContext.popContext()
  }

  clearContext(): void {
    logContext.clearContext()
  }

  getCurrentContext(): LogContext | null {
    return logContext.getCurrentContext()
  }

  // 实例日志管理
  clearInstanceLogs(instanceId?: string): void {
    this.storageReporter.clearInstanceLogs(instanceId)
    if (instanceId) {
      logGroupManager.clearGroupsByInstance(instanceId)
    }
    else {
      logGroupManager.clearAllGroups()
    }
  }

  exportInstanceLogs(instanceId?: string): StoredLogEntry[] {
    return this.storageReporter.exportLogs(instanceId)
  }

  getInstanceIds(): string[] {
    return this.storageReporter.getInstanceIds()
  }

  // 分组管理
  getGroups(filter?: GroupFilter): LogGroup[] {
    return logGroupManager.getFilteredGroups(filter || {})
  }

  getGroupTree(filter?: GroupFilter): GroupTreeNode[] {
    return logGroupManager.createGroupTree(filter)
  }

  getGroupStats() {
    return logGroupManager.getGroupStats()
  }

  // 创建带上下文的子记录器
  createContextualLogger(context: Partial<LogContext>) {
    return {
      info: (message: unknown, ...args: unknown[]) => {
        this.pushContext(context)
        try {
          this.info(message, ...args)
        }
        finally {
          this.popContext()
        }
      },
      error: (message: unknown, ...args: unknown[]) => {
        this.pushContext(context)
        try {
          this.error(message, ...args)
        }
        finally {
          this.popContext()
        }
      },
      warn: (message: unknown, ...args: unknown[]) => {
        this.pushContext(context)
        try {
          this.warn(message, ...args)
        }
        finally {
          this.popContext()
        }
      },
      debug: (message: unknown, ...args: unknown[]) => {
        this.pushContext(context)
        try {
          this.debug(message, ...args)
        }
        finally {
          this.popContext()
        }
      },
      withGroup: <T>(title: string, fn: () => T | Promise<T>) => {
        return this.withGroup(title, fn, context)
      },
      setContext: (newContext: Partial<LogContext>) => {
        this.setContext({ ...context, ...newContext })
      },
    }
  }
}

// 创建全局实例
export const logger = new LoggerService()

export default logger
