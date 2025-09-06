/**
 * @fileoverview 实例日志存储服务
 * 提供实例级别的日志存储、查询、清理功能
 */

import type { StoredLogEntry } from '~/utils/logger'
import type { LogModule } from '~/utils/logger-context'
import type { GroupFilter } from '~/utils/logger-groups'
import { logger } from '~/utils/logger'

export interface InstanceLogInfo {
  instanceId: string
  instanceName?: string
  totalEntries: number
  lastActivity: Date
  modules: LogModule[]
  storageSize: number
}

export interface LogQueryOptions extends GroupFilter {
  limit?: number
  offset?: number
  sortBy?: 'timestamp' | 'level' | 'module'
  sortOrder?: 'asc' | 'desc'
}

export interface LogExportOptions {
  format: 'json' | 'csv' | 'txt'
  includeContext: boolean
  includeArgs: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

/**
 * 实例日志存储服务
 */
export class InstanceLogStorage {
  private static instance: InstanceLogStorage
  private readonly STORAGE_PREFIX = 'iconifycraft_logs'

  static getInstance(): InstanceLogStorage {
    if (!InstanceLogStorage.instance) {
      InstanceLogStorage.instance = new InstanceLogStorage()
    }
    return InstanceLogStorage.instance
  }

  /**
   * 获取所有有日志的实例信息
   */
  getInstanceLogInfos(): InstanceLogInfo[] {
    const instanceIds = logger.getInstanceIds()
    const infos: InstanceLogInfo[] = []

    // 添加全局日志信息
    const globalLogs = this.getStoredLogs('global')
    if (globalLogs.length > 0) {
      infos.push({
        instanceId: 'global',
        instanceName: 'Global System',
        totalEntries: globalLogs.length,
        lastActivity: new Date(Math.max(...globalLogs.map(log => new Date(log.timestamp).getTime()))),
        modules: [...new Set(globalLogs.map(log => log.module).filter((module): module is LogModule =>
          ['Instance', 'Atlas', 'ResourcePack', 'Export', 'Settings', 'System'].includes(module),
        ))],
        storageSize: this.calculateStorageSize(`${this.STORAGE_PREFIX}_global`),
      })
    }

    // 添加实例日志信息
    instanceIds.forEach((instanceId) => {
      const logs = this.getStoredLogs(instanceId)
      if (logs.length > 0) {
        infos.push({
          instanceId,
          instanceName: this.getInstanceName(instanceId),
          totalEntries: logs.length,
          lastActivity: new Date(Math.max(...logs.map(log => new Date(log.timestamp).getTime()))),
          modules: [...new Set(logs.map(log => log.module).filter((module): module is LogModule =>
            ['Instance', 'Atlas', 'ResourcePack', 'Export', 'Settings', 'System'].includes(module),
          ))],
          storageSize: this.calculateStorageSize(`${this.STORAGE_PREFIX}_instance_${instanceId}`),
        })
      }
    })

    return infos.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  /**
   * 查询指定实例的日志
   */
  queryLogs(instanceId: string | 'global', options: LogQueryOptions = {}): StoredLogEntry[] {
    const logs = this.getStoredLogs(instanceId)
    let filteredLogs = [...logs]

    // 应用过滤条件
    if (options.modules && options.modules.length > 0) {
      filteredLogs = filteredLogs.filter(log =>
        options.modules!.includes(log.module as LogModule),
      )
    }

    if (options.levels && options.levels.length > 0) {
      filteredLogs = filteredLogs.filter(log => options.levels!.includes(log.level))
    }

    if (options.timeRange) {
      filteredLogs = filteredLogs.filter((log) => {
        const logTime = new Date(log.timestamp)
        return logTime >= options.timeRange!.start && logTime <= options.timeRange!.end
      })
    }

    if (options.searchText) {
      const searchLower = options.searchText.toLowerCase()
      filteredLogs = filteredLogs.filter(log =>
        log.message.toLowerCase().includes(searchLower)
        || (log.operation && log.operation.toLowerCase().includes(searchLower)),
      )
    }

    // 排序
    const sortBy = options.sortBy || 'timestamp'
    const sortOrder = options.sortOrder || 'desc'

    filteredLogs.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case 'level':
          aValue = a.level
          bValue = b.level
          break
        case 'module':
          aValue = a.module
          bValue = b.module
          break
        default:
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      else {
        return aValue < bValue ? 1 : -1
      }
    })

    // 分页
    if (options.offset || options.limit) {
      const offset = options.offset || 0
      const limit = options.limit || 100
      filteredLogs = filteredLogs.slice(offset, offset + limit)
    }

    return filteredLogs
  }

  /**
   * 导出实例日志
   */
  exportLogs(instanceId: string | 'global', options: LogExportOptions): string {
    const logs = this.getStoredLogs(instanceId)
    let filteredLogs = logs

    // 应用日期范围过滤
    if (options.dateRange) {
      filteredLogs = logs.filter((log) => {
        const logTime = new Date(log.timestamp)
        return logTime >= options.dateRange!.start && logTime <= options.dateRange!.end
      })
    }

    switch (options.format) {
      case 'json':
        return this.exportAsJson(filteredLogs, options)
      case 'csv':
        return this.exportAsCsv(filteredLogs, options)
      case 'txt':
        return this.exportAsTxt(filteredLogs, options)
      default:
        return this.exportAsJson(filteredLogs, options)
    }
  }

  /**
   * 清理实例日志
   */
  clearInstanceLogs(instanceId: string | 'global'): void {
    logger.clearInstanceLogs(instanceId === 'global' ? undefined : instanceId)
  }

  /**
   * 清理过期日志
   */
  cleanupExpiredLogs(maxAge: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoffDate = new Date(Date.now() - maxAge)
    const instanceInfos = this.getInstanceLogInfos()
    let cleanedCount = 0

    instanceInfos.forEach((info) => {
      const logs = this.getStoredLogs(info.instanceId)
      const validLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate)

      if (validLogs.length < logs.length) {
        cleanedCount += logs.length - validLogs.length
        this.storeLogsDirectly(info.instanceId, validLogs)
      }
    })

    return cleanedCount
  }

  /**
   * 获取存储统计信息
   */
  getStorageStats(): {
    totalInstances: number
    totalEntries: number
    totalSize: number
    oldestEntry?: Date
    newestEntry?: Date
  } {
    const infos = this.getInstanceLogInfos()
    const totalInstances = infos.length
    const totalEntries = infos.reduce((sum, info) => sum + info.totalEntries, 0)
    const totalSize = infos.reduce((sum, info) => sum + info.storageSize, 0)

    const allTimestamps = infos.reduce((timestamps: Date[], info) => {
      const logs = this.getStoredLogs(info.instanceId)
      timestamps.push(...logs.map(log => new Date(log.timestamp)))
      return timestamps
    }, [])

    const oldestEntry = allTimestamps.length > 0
      ? new Date(Math.min(...allTimestamps.map(d => d.getTime())))
      : undefined

    const newestEntry = allTimestamps.length > 0
      ? new Date(Math.max(...allTimestamps.map(d => d.getTime())))
      : undefined

    return {
      totalInstances,
      totalEntries,
      totalSize,
      oldestEntry,
      newestEntry,
    }
  }

  /**
   * 获取存储的日志数据
   */
  private getStoredLogs(instanceId: string | 'global'): StoredLogEntry[] {
    const storageKey = instanceId === 'global'
      ? `${this.STORAGE_PREFIX}_global`
      : `${this.STORAGE_PREFIX}_instance_${instanceId}`

    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    }
    catch {
      return []
    }
  }

  /**
   * 直接存储日志数据
   */
  private storeLogsDirectly(instanceId: string | 'global', logs: StoredLogEntry[]): void {
    const storageKey = instanceId === 'global'
      ? `${this.STORAGE_PREFIX}_global`
      : `${this.STORAGE_PREFIX}_instance_${instanceId}`

    try {
      localStorage.setItem(storageKey, JSON.stringify(logs))
    }
    catch (error) {
      console.error('Failed to store logs:', error)
    }
  }

  /**
   * 计算存储大小
   */
  private calculateStorageSize(storageKey: string): number {
    const data = localStorage.getItem(storageKey)
    return data ? new Blob([data]).size : 0
  }

  /**
   * 获取实例名称
   */
  private getInstanceName(instanceId: string): string {
    // 尝试从实例存储中获取实例名称
    // 这里可以集成实例管理服务
    return `Instance ${instanceId.substring(0, 8)}...`
  }

  /**
   * 导出为 JSON 格式
   */
  private exportAsJson(logs: StoredLogEntry[], options: LogExportOptions): string {
    const exportData = logs.map((log) => {
      const entry: Record<string, unknown> = {
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        module: log.module,
      }

      if (options.includeContext) {
        entry.instanceId = log.instanceId
        entry.sessionId = log.sessionId
        entry.operation = log.operation
      }

      if (options.includeArgs && log.args) {
        entry.args = log.args
      }

      return entry
    })

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 导出为 CSV 格式
   */
  private exportAsCsv(logs: StoredLogEntry[], options: LogExportOptions): string {
    if (logs.length === 0)
      return ''

    const headers = ['timestamp', 'level', 'message', 'module']

    if (options.includeContext) {
      headers.push('instanceId', 'sessionId', 'operation')
    }

    const csvRows = [headers.join(',')]

    logs.forEach((log) => {
      const row = [
        log.timestamp,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.module,
      ]

      if (options.includeContext) {
        row.push(log.instanceId || '', log.sessionId || '', log.operation || '')
      }

      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  /**
   * 导出为 TXT 格式
   */
  private exportAsTxt(logs: StoredLogEntry[], options: LogExportOptions): string {
    return logs.map((log) => {
      const timestamp = new Date(log.timestamp).toLocaleString()
      const level = log.level
      const message = log.message
      const module = log.module

      let line = `[${timestamp}] [${level}] [${module}] ${message}`

      if (options.includeContext && log.operation) {
        line += ` (${log.operation})`
      }

      return line
    }).join('\n')
  }
}

// 创建全局实例
export const instanceLogStorage = InstanceLogStorage.getInstance()
