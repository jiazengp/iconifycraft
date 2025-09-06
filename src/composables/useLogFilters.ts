/**
 * @fileoverview 日志筛选组合函数
 * 提供日志筛选相关的状态管理和工具函数
 */

import type { LogModule } from '~/utils/logger-context'
import { computed } from 'vue'
import { LOG_LEVEL_NAMES, LOG_LEVELS } from '~/utils/logger'

export interface FilterOption<T = string | number> {
  value: T
  label: string
  count?: number
  disabled?: boolean
}

export interface TimeRangePreset {
  key: string
  label: string
  getValue: () => { start: Date, end: Date }
}

export function useLogFilters() {
  const { t } = useI18n()

  // 模块筛选选项
  const moduleOptions = computed<FilterOption<LogModule>[]>(() => [
    {
      value: 'Instance',
      label: t('logs.modules.instance', '实例管理'),
    },
    {
      value: 'Atlas',
      label: t('logs.modules.atlas', '图集生成'),
    },
    {
      value: 'ResourcePack',
      label: t('logs.modules.resourcePack', '资源包'),
    },
    {
      value: 'Export',
      label: t('logs.modules.export', '导出操作'),
    },
    {
      value: 'Settings',
      label: t('logs.modules.settings', '设置管理'),
    },
    {
      value: 'System',
      label: t('logs.modules.system', '系统操作'),
    },
  ])

  // 日志级别筛选选项
  const levelOptions = computed<FilterOption<number>[]>(() => [
    {
      value: LOG_LEVELS.ERROR,
      label: LOG_LEVEL_NAMES[LOG_LEVELS.ERROR],
    },
    {
      value: LOG_LEVELS.WARN,
      label: LOG_LEVEL_NAMES[LOG_LEVELS.WARN],
    },
    {
      value: LOG_LEVELS.INFO,
      label: LOG_LEVEL_NAMES[LOG_LEVELS.INFO],
    },
    {
      value: LOG_LEVELS.DEBUG,
      label: LOG_LEVEL_NAMES[LOG_LEVELS.DEBUG],
    },
    {
      value: LOG_LEVELS.VERBOSE,
      label: LOG_LEVEL_NAMES[LOG_LEVELS.VERBOSE],
    },
  ])

  // 时间范围预设选项
  const timeRangePresets = computed<TimeRangePreset[]>(() => [
    {
      key: 'last-hour',
      label: t('logs.timeRange.lastHour', '最近1小时'),
      getValue: () => {
        const end = new Date()
        const start = new Date(end.getTime() - 60 * 60 * 1000)
        return { start, end }
      },
    },
    {
      key: 'last-day',
      label: t('logs.timeRange.lastDay', '最近1天'),
      getValue: () => {
        const end = new Date()
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
        return { start, end }
      },
    },
    {
      key: 'last-week',
      label: t('logs.timeRange.lastWeek', '最近1周'),
      getValue: () => {
        const end = new Date()
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { start, end }
      },
    },
    {
      key: 'today',
      label: t('logs.timeRange.today', '今天'),
      getValue: () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
        return { start, end }
      },
    },
    {
      key: 'yesterday',
      label: t('logs.timeRange.yesterday', '昨天'),
      getValue: () => {
        const today = new Date()
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
        return { start, end }
      },
    },
  ])

  // 排序选项
  const sortOptions = computed<FilterOption<'timestamp' | 'level' | 'module'>[]>(() => [
    {
      value: 'timestamp',
      label: t('logs.sort.timestamp', '按时间'),
    },
    {
      value: 'level',
      label: t('logs.sort.level', '按级别'),
    },
    {
      value: 'module',
      label: t('logs.sort.module', '按模块'),
    },
  ])

  // 页面大小选项
  const pageSizeOptions = computed<FilterOption<number>[]>(() => [
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 200, label: '200' },
  ])

  // 导出格式选项
  const exportFormatOptions = computed<FilterOption<'json' | 'csv' | 'txt'>[]>(() => [
    {
      value: 'json',
      label: 'JSON',
    },
    {
      value: 'csv',
      label: 'CSV',
    },
    {
      value: 'txt',
      label: 'TXT',
    },
  ])

  // 工具函数
  function getModuleIcon(module: LogModule): string {
    const icons: Record<LogModule, string> = {
      Instance: '📱',
      Atlas: '🎨',
      ResourcePack: '📦',
      Export: '🚀',
      Settings: '⚙️',
      System: '🖥️',
    }
    return icons[module] || '📋'
  }

  function getModuleColor(module: LogModule): string {
    const colors: Record<LogModule, string> = {
      Instance: '#3b82f6', // blue-500
      Atlas: '#8b5cf6', // violet-500
      ResourcePack: '#10b981', // emerald-500
      Export: '#f59e0b', // amber-500
      Settings: '#6b7280', // gray-500
      System: '#ef4444', // red-500
    }
    return colors[module] || '#6b7280'
  }

  function getLevelIcon(level: number): string {
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

  function getLevelColor(level: number): string {
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

  function formatTimestamp(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    }
    else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`
    }
    else {
      return `${(ms / 60000).toFixed(1)}m`
    }
  }

  function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`
  }

  function debounceSearch(fn: (text: string) => void, delay: number = 300) {
    let timeoutId: ReturnType<typeof setTimeout>

    return (text: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(text), delay)
    }
  }

  function createFilterSummary(filters: {
    instanceId?: string | null
    modules?: LogModule[]
    levels?: number[]
    searchText?: string
    timeRange?: { start: Date | null, end: Date | null }
  }): string[] {
    const summary: string[] = []

    if (filters.instanceId && filters.instanceId !== 'all') {
      summary.push(t('logs.filter.instance', `实例: ${filters.instanceId}`))
    }

    if (filters.modules && filters.modules.length > 0) {
      const moduleLabels = filters.modules
        .map(module => moduleOptions.value.find(opt => opt.value === module)?.label)
        .filter(Boolean)
      summary.push(t('logs.filter.modules', `模块: ${moduleLabels.join(', ')}`))
    }

    if (filters.levels && filters.levels.length > 0 && filters.levels.length < 5) {
      const levelLabels = filters.levels
        .map(level => levelOptions.value.find(opt => opt.value === level)?.label)
        .filter(Boolean)
      summary.push(t('logs.filter.levels', `级别: ${levelLabels.join(', ')}`))
    }

    if (filters.searchText) {
      summary.push(t('logs.filter.search', `搜索: "${filters.searchText}"`))
    }

    if (filters.timeRange?.start && filters.timeRange.end) {
      const start = formatTimestamp(filters.timeRange.start).split(' ')[0]
      const end = formatTimestamp(filters.timeRange.end).split(' ')[0]
      summary.push(t('logs.filter.timeRange', `时间: ${start} - ${end}`))
    }

    return summary
  }

  return {
    // 选项
    moduleOptions,
    levelOptions,
    timeRangePresets,
    sortOptions,
    pageSizeOptions,
    exportFormatOptions,

    // 工具函数
    getModuleIcon,
    getModuleColor,
    getLevelIcon,
    getLevelColor,
    formatTimestamp,
    formatDuration,
    formatFileSize,
    debounceSearch,
    createFilterSummary,
  }
}
