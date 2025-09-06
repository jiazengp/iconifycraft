/**
 * @fileoverview 日志分组管理系统
 * 提供分组的创建、管理、显示等功能
 */

import type { LogEntry, LogGroup, LogModule } from './logger-context'

export interface GroupDisplayConfig {
  icon: string
  color: string
  collapsed: boolean
  priority: number
}

export interface GroupFilter {
  modules?: LogModule[]
  instanceIds?: string[]
  levels?: number[]
  timeRange?: {
    start: Date
    end: Date
  }
  searchText?: string
}

/**
 * 日志分组管理器
 */
class LogGroupManager {
  private groups = new Map<string, LogGroup>()
  private displayConfigs = new Map<LogModule, GroupDisplayConfig>()

  constructor() {
    this.initializeDisplayConfigs()
  }

  /**
   * 初始化显示配置
   */
  private initializeDisplayConfigs(): void {
    const configs: Record<LogModule, GroupDisplayConfig> = {
      Instance: {
        icon: '📱',
        color: '#3b82f6', // blue-500
        collapsed: false,
        priority: 1,
      },
      Atlas: {
        icon: '🎨',
        color: '#8b5cf6', // violet-500
        collapsed: false,
        priority: 2,
      },
      ResourcePack: {
        icon: '📦',
        color: '#10b981', // emerald-500
        collapsed: false,
        priority: 3,
      },
      Export: {
        icon: '🚀',
        color: '#f59e0b', // amber-500
        collapsed: false,
        priority: 4,
      },
      Settings: {
        icon: '⚙️',
        color: '#6b7280', // gray-500
        collapsed: true,
        priority: 5,
      },
      System: {
        icon: '🖥️',
        color: '#ef4444', // red-500
        collapsed: true,
        priority: 6,
      },
    }

    Object.entries(configs).forEach(([module, config]) => {
      this.displayConfigs.set(module as LogModule, config)
    })
  }

  /**
   * 添加日志分组
   */
  addGroup(group: LogGroup): void {
    this.groups.set(group.id, group)
  }

  /**
   * 移除日志分组
   */
  removeGroup(groupId: string): boolean {
    return this.groups.delete(groupId)
  }

  /**
   * 获取日志分组
   */
  getGroup(groupId: string): LogGroup | undefined {
    return this.groups.get(groupId)
  }

  /**
   * 获取所有分组
   */
  getAllGroups(): LogGroup[] {
    return Array.from(this.groups.values())
  }

  /**
   * 根据筛选条件获取分组
   */
  getFilteredGroups(filter: GroupFilter): LogGroup[] {
    let groups = this.getAllGroups()

    // 按模块筛选
    if (filter.modules && filter.modules.length > 0) {
      groups = groups.filter(group => filter.modules!.includes(group.module))
    }

    // 按实例筛选
    if (filter.instanceIds && filter.instanceIds.length > 0) {
      groups = groups.filter(group =>
        !group.instanceId || filter.instanceIds!.includes(group.instanceId),
      )
    }

    // 按时间范围筛选
    if (filter.timeRange) {
      groups = groups.filter(group =>
        group.startTime >= filter.timeRange!.start
        && group.startTime <= filter.timeRange!.end,
      )
    }

    // 按搜索文本筛选
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase()
      groups = groups.filter(group =>
        group.title.toLowerCase().includes(searchLower)
        || group.entries.some(entry =>
          entry.message.toLowerCase().includes(searchLower),
        ),
      )
    }

    // 按日志级别筛选条目
    if (filter.levels && filter.levels.length > 0) {
      groups = groups.map(group => ({
        ...group,
        entries: group.entries.filter(entry =>
          filter.levels!.includes(entry.level),
        ),
      })).filter(group => group.entries.length > 0)
    }

    return this.sortGroups(groups)
  }

  /**
   * 按优先级和时间排序分组
   */
  private sortGroups(groups: LogGroup[]): LogGroup[] {
    return groups.sort((a, b) => {
      const configA = this.displayConfigs.get(a.module)
      const configB = this.displayConfigs.get(b.module)

      // 首先按优先级排序
      if (configA && configB) {
        if (configA.priority !== configB.priority) {
          return configA.priority - configB.priority
        }
      }

      // 然后按时间排序（最新的在前）
      return b.startTime.getTime() - a.startTime.getTime()
    })
  }

  /**
   * 获取分组的显示配置
   */
  getDisplayConfig(module: LogModule): GroupDisplayConfig | undefined {
    return this.displayConfigs.get(module)
  }

  /**
   * 更新分组的显示配置
   */
  updateDisplayConfig(module: LogModule, config: Partial<GroupDisplayConfig>): void {
    const existing = this.displayConfigs.get(module)
    if (existing) {
      this.displayConfigs.set(module, { ...existing, ...config })
    }
  }

  /**
   * 清空所有分组
   */
  clearAllGroups(): void {
    this.groups.clear()
  }

  /**
   * 按实例清空分组
   */
  clearGroupsByInstance(instanceId: string): void {
    const groupsToRemove = Array.from(this.groups.entries())
      .filter(([_, group]) => group.instanceId === instanceId)
      .map(([id]) => id)

    groupsToRemove.forEach(id => this.groups.delete(id))
  }

  /**
   * 获取分组统计信息
   */
  getGroupStats(): {
    totalGroups: number
    totalEntries: number
    groupsByModule: Record<LogModule, number>
    entriesByLevel: Record<number, number>
  } {
    const groups = this.getAllGroups()
    const totalGroups = groups.length
    let totalEntries = 0

    const groupsByModule: Record<string, number> = {}
    const entriesByLevel: Record<number, number> = {}

    groups.forEach((group) => {
      // 统计分组数量
      groupsByModule[group.module] = (groupsByModule[group.module] || 0) + 1

      // 统计条目
      totalEntries += group.entries.length
      group.entries.forEach((entry) => {
        entriesByLevel[entry.level] = (entriesByLevel[entry.level] || 0) + 1
      })
    })

    return {
      totalGroups,
      totalEntries,
      groupsByModule: groupsByModule as Record<LogModule, number>,
      entriesByLevel,
    }
  }

  /**
   * 创建分组树结构（用于UI显示）
   */
  createGroupTree(filter?: GroupFilter): GroupTreeNode[] {
    const groups = filter ? this.getFilteredGroups(filter) : this.getAllGroups()

    // 按模块分组
    const moduleGroups = new Map<LogModule, LogGroup[]>()
    groups.forEach((group) => {
      if (!moduleGroups.has(group.module)) {
        moduleGroups.set(group.module, [])
      }
      moduleGroups.get(group.module)!.push(group)
    })

    // 构建树结构
    return Array.from(moduleGroups.entries()).map(([module, groups]) => {
      const config = this.displayConfigs.get(module)
      return {
        id: `module-${module}`,
        title: module,
        icon: config?.icon || '📋',
        color: config?.color || '#6b7280',
        collapsed: config?.collapsed || false,
        type: 'module',
        module,
        children: groups.map(group => ({
          id: group.id,
          title: group.title,
          icon: config?.icon || '📋',
          color: config?.color || '#6b7280',
          collapsed: group.collapsed || false,
          type: 'group',
          group,
          children: group.entries.map(entry => ({
            id: entry.id,
            title: entry.message,
            icon: this.getLevelIcon(entry.level),
            color: this.getLevelColor(entry.level),
            collapsed: false,
            type: 'entry',
            entry,
            children: [],
          })),
        })),
      }
    })
  }

  /**
   * 获取日志级别图标
   */
  private getLevelIcon(level: number): string {
    const icons: Record<number, string> = {
      0: '🔇', // SILENT
      1: '❌', // ERROR
      2: '⚠️', // WARN
      3: 'ℹ️', // INFO
      4: '🐛', // DEBUG
      5: '📝', // VERBOSE
    }
    return icons[level] || 'ℹ️'
  }

  /**
   * 获取日志级别颜色
   */
  private getLevelColor(level: number): string {
    const colors: Record<number, string> = {
      0: '#6b7280', // SILENT - gray
      1: '#ef4444', // ERROR - red
      2: '#f59e0b', // WARN - amber
      3: '#3b82f6', // INFO - blue
      4: '#8b5cf6', // DEBUG - violet
      5: '#6b7280', // VERBOSE - gray
    }
    return colors[level] || '#6b7280'
  }
}

export interface GroupTreeNode {
  id: string
  title: string
  icon: string
  color: string
  collapsed: boolean
  type: 'module' | 'group' | 'entry'
  module?: LogModule
  group?: LogGroup
  entry?: LogEntry
  children: GroupTreeNode[]
}

// 创建全局实例
export const logGroupManager = new LogGroupManager()

/**
 * 格式化时间差显示
 */
export function formatDuration(startTime: Date, endTime?: Date): string {
  const end = endTime || new Date()
  const diff = end.getTime() - startTime.getTime()

  if (diff < 1000) {
    return `${diff}ms`
  }
  else if (diff < 60000) {
    return `${(diff / 1000).toFixed(1)}s`
  }
  else {
    return `${(diff / 60000).toFixed(1)}m`
  }
}

/**
 * 格式化时间显示
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
