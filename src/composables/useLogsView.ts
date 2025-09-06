/**
 * @fileoverview 日志查看组合函数
 * 提供日志查看页面的状态管理和业务逻辑
 */

import type { InstanceLogInfo, LogQueryOptions } from '~/services/InstanceLogStorage'
import type { StoredLogEntry } from '~/utils/logger'
import type { LogModule } from '~/utils/logger-context'
import type { GroupFilter, GroupTreeNode } from '~/utils/logger-groups'
import { computed, ref, watch } from 'vue'
import { instanceLogStorage } from '~/services/InstanceLogStorage'
import { logger } from '~/utils/logger'

export interface LogsViewState {
  selectedInstanceId: string | null
  selectedModules: LogModule[]
  selectedLevels: number[]
  searchText: string
  timeRange: {
    start: Date | null
    end: Date | null
  }
  sortBy: 'timestamp' | 'level' | 'module'
  sortOrder: 'asc' | 'desc'
  pageSize: number
  currentPage: number
  isRealtime: boolean
  showDetails: boolean
  selectedLogId: string | null
}

export function useLogsView() {
  // 状态管理
  const state = ref<LogsViewState>({
    selectedInstanceId: null,
    selectedModules: [],
    selectedLevels: [1, 2, 3, 4, 5], // 默认显示除 SILENT 外的所有级别
    searchText: '',
    timeRange: {
      start: null,
      end: null,
    },
    sortBy: 'timestamp',
    sortOrder: 'desc',
    pageSize: 50,
    currentPage: 1,
    isRealtime: false,
    showDetails: false,
    selectedLogId: null,
  })

  const loading = ref(false)
  const instanceInfos = ref<InstanceLogInfo[]>([])
  const logs = ref<StoredLogEntry[]>([])
  const totalLogs = ref(0)
  const groupTree = ref<GroupTreeNode[]>([])

  // 计算属性
  const currentFilter = computed<GroupFilter>(() => ({
    modules: state.value.selectedModules.length > 0 ? state.value.selectedModules : undefined,
    levels: state.value.selectedLevels.length > 0 ? state.value.selectedLevels : undefined,
    searchText: state.value.searchText || undefined,
    timeRange: (state.value.timeRange.start && state.value.timeRange.end)
      ? {
          start: state.value.timeRange.start,
          end: state.value.timeRange.end,
        }
      : undefined,
  }))

  const queryOptions = computed<LogQueryOptions>(() => ({
    ...currentFilter.value,
    limit: state.value.pageSize,
    offset: (state.value.currentPage - 1) * state.value.pageSize,
    sortBy: state.value.sortBy,
    sortOrder: state.value.sortOrder,
  }))

  const selectedLog = computed(() => {
    if (!state.value.selectedLogId)
      return null
    return logs.value.find(log => log.id === state.value.selectedLogId)
  })

  const hasFilters = computed(() => {
    return state.value.selectedInstanceId !== null
      || state.value.selectedModules.length > 0
      || state.value.selectedLevels.length < 5
      || state.value.searchText !== ''
      || state.value.timeRange.start !== null
      || state.value.timeRange.end !== null
  })

  const totalPages = computed(() => {
    return Math.ceil(totalLogs.value / state.value.pageSize)
  })

  // 方法
  async function loadInstanceInfos(): Promise<void> {
    try {
      loading.value = true
      instanceInfos.value = instanceLogStorage.getInstanceLogInfos()
    }
    catch (error) {
      console.error('Failed to load instance infos:', error)
      instanceInfos.value = []
    }
    finally {
      loading.value = false
    }
  }

  async function loadLogs(): Promise<void> {
    if (!state.value.selectedInstanceId) {
      logs.value = []
      totalLogs.value = 0
      return
    }

    try {
      loading.value = true

      const instanceId = state.value.selectedInstanceId === 'all'
        ? 'global'
        : state.value.selectedInstanceId

      // 查询日志
      const result = instanceLogStorage.queryLogs(instanceId, queryOptions.value)
      logs.value = result

      // 获取总数（不分页）
      const totalResult = instanceLogStorage.queryLogs(instanceId, {
        ...currentFilter.value,
        limit: undefined,
        offset: undefined,
      })
      totalLogs.value = totalResult.length
    }
    catch (error) {
      console.error('Failed to load logs:', error)
      logs.value = []
      totalLogs.value = 0
    }
    finally {
      loading.value = false
    }
  }

  async function loadGroupTree(): Promise<void> {
    try {
      groupTree.value = logger.getGroupTree(currentFilter.value)
    }
    catch (error) {
      console.error('Failed to load group tree:', error)
      groupTree.value = []
    }
  }

  function selectInstance(instanceId: string | null): void {
    state.value.selectedInstanceId = instanceId
    state.value.currentPage = 1
  }

  function toggleModule(module: LogModule): void {
    const index = state.value.selectedModules.indexOf(module)
    if (index > -1) {
      state.value.selectedModules.splice(index, 1)
    }
    else {
      state.value.selectedModules.push(module)
    }
    state.value.currentPage = 1
  }

  function toggleLevel(level: number): void {
    const index = state.value.selectedLevels.indexOf(level)
    if (index > -1) {
      state.value.selectedLevels.splice(index, 1)
    }
    else {
      state.value.selectedLevels.push(level)
    }
    state.value.currentPage = 1
  }

  function setSearchText(text: string): void {
    state.value.searchText = text
    state.value.currentPage = 1
  }

  function setTimeRange(start: Date | null, end: Date | null): void {
    state.value.timeRange.start = start
    state.value.timeRange.end = end
    state.value.currentPage = 1
  }

  function setSorting(sortBy: 'timestamp' | 'level' | 'module', sortOrder?: 'asc' | 'desc'): void {
    state.value.sortBy = sortBy
    if (sortOrder) {
      state.value.sortOrder = sortOrder
    }
    else {
      // 切换排序方向
      state.value.sortOrder = state.value.sortOrder === 'asc' ? 'desc' : 'asc'
    }
    state.value.currentPage = 1
  }

  function setPage(page: number): void {
    if (page >= 1 && page <= totalPages.value) {
      state.value.currentPage = page
    }
  }

  function selectLog(logId: string | null): void {
    state.value.selectedLogId = logId
    state.value.showDetails = !!logId
  }

  function toggleRealtime(): void {
    state.value.isRealtime = !state.value.isRealtime
  }

  function clearFilters(): void {
    state.value.selectedInstanceId = null
    state.value.selectedModules = []
    state.value.selectedLevels = [1, 2, 3, 4, 5]
    state.value.searchText = ''
    state.value.timeRange.start = null
    state.value.timeRange.end = null
    state.value.currentPage = 1
  }

  async function clearLogs(instanceId?: string): Promise<void> {
    try {
      if (instanceId) {
        instanceLogStorage.clearInstanceLogs(instanceId)
      }
      else {
        instanceLogStorage.clearInstanceLogs('global')
        logger.getInstanceIds().forEach((id: string) => {
          instanceLogStorage.clearInstanceLogs(id)
        })
      }

      await Promise.all([
        loadInstanceInfos(),
        loadLogs(),
        loadGroupTree(),
      ])
    }
    catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  async function exportLogs(format: 'json' | 'csv' | 'txt' = 'json'): Promise<void> {
    if (!state.value.selectedInstanceId)
      return

    try {
      const instanceId = state.value.selectedInstanceId === 'all'
        ? 'global'
        : state.value.selectedInstanceId

      const content = instanceLogStorage.exportLogs(instanceId, {
        format,
        includeContext: true,
        includeArgs: true,
        dateRange: (state.value.timeRange.start && state.value.timeRange.end)
          ? {
              start: state.value.timeRange.start,
              end: state.value.timeRange.end,
            }
          : undefined,
      })

      // 下载文件
      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `logs-${instanceId}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    catch (error) {
      console.error('Failed to export logs:', error)
    }
  }

  // 监听状态变化
  watch([() => state.value.selectedInstanceId, currentFilter, queryOptions], () => {
    loadLogs()
  }, { deep: true })

  watch(currentFilter, () => {
    loadGroupTree()
  }, { deep: true })

  // 实时更新
  let realtimeInterval: ReturnType<typeof setInterval> | null = null

  watch(() => state.value.isRealtime, (isRealtime) => {
    if (isRealtime) {
      realtimeInterval = setInterval(() => {
        loadLogs()
        loadGroupTree()
      }, 2000) // 每2秒刷新
    }
    else {
      if (realtimeInterval) {
        clearInterval(realtimeInterval)
        realtimeInterval = null
      }
    }
  })

  // 初始化
  onMounted(() => {
    loadInstanceInfos()
  })

  onUnmounted(() => {
    if (realtimeInterval) {
      clearInterval(realtimeInterval)
    }
  })

  return {
    // 状态
    state: readonly(state),
    loading: readonly(loading),
    instanceInfos: readonly(instanceInfos),
    logs: readonly(logs),
    totalLogs: readonly(totalLogs),
    groupTree: readonly(groupTree),

    // 计算属性
    selectedLog,
    hasFilters,
    totalPages,

    // 方法
    loadInstanceInfos,
    loadLogs,
    loadGroupTree,
    selectInstance,
    toggleModule,
    toggleLevel,
    setSearchText,
    setTimeRange,
    setSorting,
    setPage,
    selectLog,
    toggleRealtime,
    clearFilters,
    clearLogs,
    exportLogs,
  }
}
