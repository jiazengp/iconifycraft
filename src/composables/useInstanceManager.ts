/**
 * @fileoverview 实例管理组合函数
 * 提供保存、加载、管理实例的核心功能
 */

import type { InstanceStats, SavedInstance } from '~/types/instance'
import type { ResourcePack } from '~/types/resource-pack'
import { computed, ref } from 'vue'
import { instanceStorage } from '~/services/InstanceStorageService'
import { generateInstanceIcon } from '~/utils/image'
import { logger } from '~/utils/logger'
import { useLocalizedRouter } from './useLocalizedRouter'
import { useNotification } from './useNotification'
import { useUnsavedChanges } from './useUnsavedChanges'

interface InstanceManagerState {
  instances: SavedInstance[]
  currentInstance: SavedInstance | null
  loading: boolean
  statsLoading: boolean
  stats: InstanceStats | null
}

interface SaveInstanceOptions {
  name?: string
  description?: string
  generateThumbnail?: boolean
  atlasImage?: string
  packIcon?: Uint8Array
  isAutoSave?: boolean
}

interface InstanceFilters {
  search?: string
  version?: string
  hasAtlas?: boolean
}

export function useInstanceManager() {
  const { pushLocalized } = useLocalizedRouter()
  const { showSuccess, showError, showInfo } = useNotification()
  const { t } = useI18n()
  const { markAsSaved, markAsAutoSaved, setCurrentInstance, disableTracking, enableTracking } = useUnsavedChanges()

  // 辅助函数 - 需要在使用前定义
  const generateUuidBasedName = (): string => {
    // 生成UUID并取前8位作为名称
    const uuid = crypto.randomUUID()
    return uuid.substring(0, 8)
  }

  const generateDefaultThumbnail = (ctx: CanvasRenderingContext2D, resolve: (blob: Blob) => void) => {
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#9ca3af'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📦', 64, 60)
    ctx.font = '12px sans-serif'
    ctx.fillText('Resource Pack', 64, 80)

    ctx.canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png', 0.8)
  }

  const generateResourcePackThumbnail = async (resourcePacks: ResourcePack[]): Promise<Blob> => {
    // 创建缩略图 (128x128)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = 128
    canvas.height = 128

    // 尝试使用第一个资源包的图标
    for (const pack of resourcePacks) {
      if (pack.icon) {
        const img = new Image()

        return new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, 128, 128)
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              }
              else {
                reject(new Error('Failed to generate thumbnail'))
              }
            }, 'image/png', 0.8)
          }
          img.onerror = () => {
            // 如果图标加载失败，生成默认缩略图
            generateDefaultThumbnail(ctx, resolve)
          }
          if (pack.icon) {
            img.src = pack.icon
          }
          else {
            generateDefaultThumbnail(ctx, resolve)
          }
        })
      }
    }

    // 默认缩略图
    return new Promise((resolve) => {
      generateDefaultThumbnail(ctx, resolve)
    })
  }

  // 响应式状态
  const state = ref<InstanceManagerState>({
    instances: [],
    currentInstance: null,
    loading: true, // 初始化时应该是loading状态
    statsLoading: true, // 统计数据也是loading状态
    stats: null,
  })

  /**
   * 刷新实例列表
   */
  const refreshInstances = async (): Promise<void> => {
    try {
      state.value.loading = true

      // 添加最小延迟以确保能看到骨架屏效果
      const [instances] = await Promise.all([
        instanceStorage.getAllInstances(),
        new Promise(resolve => setTimeout(resolve, 800)),
      ])

      state.value.instances = instances
    }
    catch (error) {
      logger.error('Failed to refresh instances:', error)
      showError(t('instances.refresh.failed'))
    }
    finally {
      state.value.loading = false
    }
  }

  // 计算属性
  const hasInstances = computed(() => state.value.instances.length > 0)
  const currentInstanceId = computed(() => state.value.currentInstance?.id)

  /**
   * 保存当前状态为实例
   */
  const saveInstance = async (
    minecraftVersion: string,
    namespace: string,
    resourcePacks: ResourcePack[],
    options: SaveInstanceOptions = {},
  ): Promise<string | null> => {
    if (!resourcePacks.length) {
      showError(t('instances.save.errors.noResourcePacks'))
      return null
    }

    try {
      state.value.loading = true

      // 检查是否有当前实例，决定是更新还是创建新实例
      const isUpdate = !!state.value.currentInstance

      // 生成默认名称（仅在创建新实例时）
      let instanceName: string
      if (options.name) {
        instanceName = options.name
      }
      else if (isUpdate) {
        instanceName = state.value.currentInstance!.name
      }
      else {
        instanceName = generateUuidBasedName()
      }

      // 生成缩略图（基于资源包图标，而不是图集）
      let thumbnail: Blob | undefined
      if (options.generateThumbnail) {
        thumbnail = await generateResourcePackThumbnail(resourcePacks)
      }

      // 生成实例图标
      let icon: Uint8Array | undefined
      if (options.atlasImage) {
        icon = await generateInstanceIcon(options.atlasImage, options.packIcon)
      }

      // 准备实例数据
      const instanceData: Omit<SavedInstance, 'id' | 'createdAt' | 'updatedAt'> = {
        name: instanceName,
        minecraftVersion,
        namespace,
        resourcePacks,
        exportSettings: {},
        metadata: {
          packCount: resourcePacks.length,
          hasThumbnail: !!thumbnail,
        },
        thumbnail,
        icon,
      }

      let instanceId: string

      if (isUpdate) {
        // 更新现有实例
        instanceId = state.value.currentInstance!.id
        await instanceStorage.updateInstance(instanceId, instanceData)
      }
      else {
        // 创建新实例
        instanceId = await instanceStorage.saveInstance(instanceData)
        // 设置为当前实例
        const newInstance = await instanceStorage.getInstance(instanceId)
        if (newInstance) {
          state.value.currentInstance = newInstance
        }
      }

      // 根据保存类型标记不同的状态
      if (options.isAutoSave) {
        markAsAutoSaved()
      }
      else {
        markAsSaved()
      }

      // 设置当前实例状态
      setCurrentInstance(instanceId, options.isAutoSave ? 'auto-saved' : 'manually-saved')

      // 临时禁用跟踪来避免刷新实例列表时触发变更检测
      disableTracking()
      await refreshInstances()
      enableTracking()

      const action = isUpdate ? 'updated' : 'created'
      showSuccess(t(`instances.save.${action}`), {
        message: t('instances.save.details', {
          name: instanceName,
          packCount: resourcePacks.length,
          version: minecraftVersion,
        }),
      })

      return instanceId
    }
    catch (error) {
      logger.error('Failed to save instance:', error)
      showError(t('instances.save.errors.failed'), {
        message: error instanceof Error ? error.message : t('instances.save.errors.unknown'),
      })
      return null
    }
    finally {
      state.value.loading = false
    }
  }

  /**
   * 加载指定实例
   */
  const loadInstance = async (instanceId: string): Promise<boolean> => {
    try {
      state.value.loading = true

      const instance = await instanceStorage.getInstance(instanceId)
      if (!instance) {
        showError(t('instances.load.errors.notFound'))
        return false
      }

      state.value.currentInstance = instance

      // 设置当前实例状态（加载现有实例时应该是已手动保存状态）
      setCurrentInstance(instanceId, 'manually-saved')

      // 更新最后打开时间
      await instanceStorage.updateInstance(instanceId, {
        lastOpenedAt: new Date(),
      })

      showSuccess(t('instances.load.success'), {
        message: t('instances.load.details', { name: instance.name }),
      })

      return true
    }
    catch (error) {
      logger.error('Failed to load instance:', error)
      showError(t('instances.load.errors.failed'))
      return false
    }
    finally {
      state.value.loading = false
    }
  }

  /**
   * 删除实例
   */
  const deleteInstance = async (instanceId: string): Promise<boolean> => {
    try {
      await instanceStorage.deleteInstance(instanceId)

      // 直接更新实例列表，不显示loading
      state.value.instances = state.value.instances.filter(instance => instance.id !== instanceId)

      // 如果删除的是当前实例，清除当前实例
      if (state.value.currentInstance?.id === instanceId) {
        state.value.currentInstance = null
      }

      return true
    }
    catch (error) {
      logger.error('Failed to delete instance:', error)
      throw error // 让调用者处理错误
    }
  }

  /**
   * 重命名实例
   */
  const renameInstance = async (instanceId: string, newName: string): Promise<boolean> => {
    if (!newName.trim()) {
      throw new Error('instances.rename.errors.emptyName')
    }

    try {
      await instanceStorage.renameInstance(instanceId, newName.trim())

      // 直接更新实例列表中的名称，不显示loading
      const instanceIndex = state.value.instances.findIndex(instance => instance.id === instanceId)
      if (instanceIndex !== -1) {
        state.value.instances[instanceIndex].name = newName.trim()
      }

      // 更新当前实例
      if (state.value.currentInstance?.id === instanceId) {
        state.value.currentInstance.name = newName.trim()
      }

      return true
    }
    catch (error) {
      logger.error('Failed to rename instance:', error)
      throw error // 让调用者处理错误
    }
  }

  /**
   * 搜索实例
   */
  const searchInstances = async (query: string): Promise<SavedInstance[]> => {
    try {
      if (!query.trim()) {
        return state.value.instances
      }

      return await instanceStorage.searchInstances(query.trim())
    }
    catch (error) {
      logger.error('Failed to search instances:', error)
      return []
    }
  }

  /**
   * 过滤实例
   */
  const filterInstances = (filters: InstanceFilters): SavedInstance[] => {
    let filtered = [...state.value.instances]

    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(instance =>
        instance.name.toLowerCase().includes(query)
        || instance.minecraftVersion.toLowerCase().includes(query),
      )
    }

    if (filters.version) {
      filtered = filtered.filter(instance =>
        instance.minecraftVersion === filters.version,
      )
    }

    if (filters.hasAtlas !== undefined) {
      // TODO: Add atlas generation status to SavedInstance interface if needed
      // For now, skip this filter as atlasGenerated property doesn't exist
      // filtered = filtered.filter(instance =>
      //   instance.atlasGenerated === filters.hasAtlas,
      // )
    }

    return filtered
  }

  /**
   * 获取存储统计信息
   */
  const getStorageStats = async (): Promise<void> => {
    try {
      state.value.statsLoading = true

      // 添加最小延迟以确保能看到骨架屏效果
      const [stats] = await Promise.all([
        instanceStorage.getStorageStats(),
        new Promise(resolve => setTimeout(resolve, 500)),
      ])

      state.value.stats = stats
    }
    catch (error) {
      logger.error('Failed to get storage stats:', error)
    }
    finally {
      state.value.statsLoading = false
    }
  }

  /**
   * 清理旧实例
   */
  const cleanupOldInstances = async (keepCount = 50): Promise<void> => {
    try {
      state.value.loading = true

      const deletedCount = await instanceStorage.cleanupOldInstances(keepCount)
      if (deletedCount > 0) {
        await refreshInstances()
        showInfo(t('instances.cleanup.success', { count: deletedCount }))
      }
      else {
        showInfo(t('instances.cleanup.nothingToClean'))
      }
    }
    catch (error) {
      logger.error('Failed to cleanup instances:', error)
      showError(t('instances.cleanup.failed'))
    }
    finally {
      state.value.loading = false
    }
  }

  /**
   * 导航到实例页面
   */
  const navigateToInstance = async (instanceId: string): Promise<void> => {
    await pushLocalized(`/instances/${instanceId}`)
  }

  /**
   * 导航到实例列表页面
   */
  const navigateToInstancesList = async (): Promise<void> => {
    await pushLocalized('/instances')
  }

  /**
   * 获取最近打开的实例
   */
  const getRecentInstances = (limit = 5): SavedInstance[] => {
    return [...state.value.instances]
      .filter(instance => instance.lastOpenedAt)
      .sort((a, b) => {
        const dateA = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0
        const dateB = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, limit)
  }

  /**
   * 自动保存当前状态
   */
  const autoSaveInstance = async (
    minecraftVersion: string,
    namespace: string,
    resourcePacks: ResourcePack[],
    options: Omit<SaveInstanceOptions, 'isAutoSave'> = {},
  ): Promise<string | null> => {
    return await saveInstance(minecraftVersion, namespace, resourcePacks, {
      ...options,
      isAutoSave: true,
    })
  }

  // 初始化
  refreshInstances()
  getStorageStats()

  return {
    // 状态
    instances: computed(() => state.value.instances),
    currentInstance: computed(() => state.value.currentInstance),
    loading: computed(() => state.value.loading),
    statsLoading: computed(() => state.value.statsLoading),
    stats: computed(() => state.value.stats),

    // 计算属性
    hasInstances,
    currentInstanceId,

    // 方法
    saveInstance,
    autoSaveInstance,
    loadInstance,
    deleteInstance,
    renameInstance,
    searchInstances,
    filterInstances,
    refreshInstances,
    getStorageStats,
    cleanupOldInstances,
    navigateToInstance,
    navigateToInstancesList,
    getRecentInstances,
  }
}
