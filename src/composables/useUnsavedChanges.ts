/**
 * @fileoverview 未保存变更检测组合函数
 * 监听应用状态变化，提供未保存提醒功能
 */

import type { AtlasResult } from '~/types/atlas'
import type { ResourcePack } from '~/types/resource-pack'
import { tryOnScopeDispose, useEventListener } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'
import { useAppSettings } from './useAppSettings'

type SaveState = 'never-saved' | 'manually-saved' | 'auto-saved'

interface UnsavedChangesState {
  hasUnsavedChanges: boolean
  lastSavedAt: Date | null
  changesSince: string[]
  trackingEnabled: boolean
  saveState: SaveState
  currentInstanceId: string | null
}

interface TrackedState {
  resourcePacks: ResourcePack[]
  minecraftVersion: string
  namespace: string
  atlasGenerated: boolean
  atlasResult: AtlasResult | null
}

export function useUnsavedChanges() {
  const { t } = useI18n()
  const { autoSaveEnabled, promptOnLeave } = useAppSettings()

  const state = ref<UnsavedChangesState>({
    hasUnsavedChanges: false,
    lastSavedAt: null,
    changesSince: [],
    trackingEnabled: true,
    saveState: 'never-saved',
    currentInstanceId: null,
  })

  const trackedState = ref<TrackedState>({
    resourcePacks: [],
    minecraftVersion: '',
    namespace: 'iconifycraft',
    atlasGenerated: false,
    atlasResult: null,
  })

  // 计算属性
  const hasUnsavedChanges = computed(() => state.value.hasUnsavedChanges)
  const lastSavedAt = computed(() => state.value.lastSavedAt)
  const changesSince = computed(() => state.value.changesSince)
  const saveState = computed(() => state.value.saveState)
  const currentInstanceId = computed(() => state.value.currentInstanceId)
  const timeSinceLastSave = computed(() => {
    if (!state.value.lastSavedAt)
      return null
    return Date.now() - state.value.lastSavedAt.getTime()
  })

  /**
   * 标记为已变更
   */
  const markAsChanged = (changeType: string) => {
    if (!state.value.trackingEnabled)
      return

    if (!state.value.hasUnsavedChanges) {
      state.value.hasUnsavedChanges = true
      state.value.changesSince = []
    }

    if (!state.value.changesSince.includes(changeType)) {
      state.value.changesSince.push(changeType)
    }
  }

  /**
   * 开始跟踪状态变化
   */
  const startTracking = (initialState: Partial<TrackedState> = {}) => {
    // 设置初始状态
    Object.assign(trackedState.value, initialState)

    // 监听状态变化
    watch(
      () => trackedState.value.resourcePacks,
      (newPacks, oldPacks) => {
        if (!oldPacks || newPacks.length !== oldPacks.length) {
          markAsChanged('resourcePacks')
        }
        else {
          // 检查内容是否变化
          const hasChanged = newPacks.some((pack, index) =>
            !oldPacks[index] || pack.id !== oldPacks[index].id,
          )
          if (hasChanged) {
            markAsChanged('resourcePacks')
          }
        }
      },
      { deep: true },
    )

    watch(
      () => trackedState.value.minecraftVersion,
      (newVersion, oldVersion) => {
        if (oldVersion && newVersion !== oldVersion) {
          markAsChanged('minecraftVersion')
        }
      },
    )

    watch(
      () => trackedState.value.namespace,
      (newNamespace, oldNamespace) => {
        if (oldNamespace && newNamespace !== oldNamespace) {
          markAsChanged('namespace')
        }
      },
    )

    watch(
      () => trackedState.value.atlasGenerated,
      (generated, wasGenerated) => {
        if (generated && !wasGenerated) {
          markAsChanged('atlasGenerated')
        }
      },
    )
  }

  /**
   * 更新跟踪的状态
   */
  const updateTrackedState = (updates: Partial<TrackedState>) => {
    Object.assign(trackedState.value, updates)
  }

  /**
   * 标记为已保存（手动保存）
   */
  const markAsSaved = () => {
    state.value.hasUnsavedChanges = false
    state.value.lastSavedAt = new Date()
    state.value.changesSince = []
    state.value.saveState = 'manually-saved'
  }

  /**
   * 标记为自动保存
   */
  const markAsAutoSaved = () => {
    state.value.hasUnsavedChanges = false
    state.value.lastSavedAt = new Date()
    state.value.changesSince = []
    // 只有在从未保存时才设置为 auto-saved，如果已经手动保存过则保持 manually-saved
    if (state.value.saveState === 'never-saved') {
      state.value.saveState = 'auto-saved'
    }
  }

  /**
   * 设置当前实例
   */
  const setCurrentInstance = (instanceId: string | null, saveState: SaveState = 'never-saved') => {
    state.value.currentInstanceId = instanceId
    state.value.saveState = saveState
    if (instanceId) {
      // 加载现有实例时重置变更状态
      state.value.hasUnsavedChanges = false
      state.value.changesSince = []
      state.value.lastSavedAt = new Date()
    }
  }

  /**
   * 临时禁用变更跟踪
   */
  const disableTracking = () => {
    state.value.trackingEnabled = false
  }

  /**
   * 重新启用变更跟踪
   */
  const enableTracking = () => {
    state.value.trackingEnabled = true
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    state.value.hasUnsavedChanges = false
    state.value.lastSavedAt = null
    state.value.changesSince = []
    state.value.saveState = 'never-saved'
    state.value.currentInstanceId = null
    trackedState.value = {
      resourcePacks: [],
      minecraftVersion: '',
      namespace: 'iconifycraft',
      atlasGenerated: false,
      atlasResult: null,
    }
  }

  /**
   * 检查是否应该提示保存
   * 新规则：
   * 1. 新实例（never-saved）+ 有变更 → 提醒保存
   * 2. 手动保存过的实例 → 不提醒
   * 3. 只有自动保存的实例 + 有变更 → 提醒保存
   * 4. 无变更 → 不提醒
   */
  const shouldPromptSave = (): boolean => {
    if (!promptOnLeave.value || !state.value.hasUnsavedChanges) {
      return false
    }

    // 手动保存过的实例不提醒
    if (state.value.saveState === 'manually-saved') {
      return false
    }

    // 新实例或只有自动保存的实例才提醒
    return state.value.saveState === 'never-saved' || state.value.saveState === 'auto-saved'
  }

  /**
   * 获取未保存变更的描述
   */
  const getChangesDescription = (): string[] => {
    const descriptions: string[] = []

    state.value.changesSince.forEach((changeType) => {
      switch (changeType) {
        case 'resourcePacks':
          descriptions.push('Resource packs modified')
          break
        case 'minecraftVersion':
          descriptions.push('Minecraft version changed')
          break
        case 'namespace':
          descriptions.push('Namespace changed')
          break
        case 'atlasGenerated':
          descriptions.push('Atlas generated')
          break
        default:
          descriptions.push('Settings modified')
      }
    })

    return descriptions
  }

  // 页面离开拦截 (Vue Router)
  onBeforeRouteLeave((_to, _from) => {
    if (shouldPromptSave()) {
      // eslint-disable-next-line no-alert
      const answer = window.confirm(
        t('instances.unsavedChanges.confirmLeave'),
      )
      return answer
    }
    return true
  })

  // 浏览器关闭/刷新拦截
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (shouldPromptSave()) {
      const message = t('instances.unsavedChanges.confirmClose')
      event.preventDefault()
      event.returnValue = message
      return message
    }
  }

  // 注册事件监听器
  useEventListener('beforeunload', handleBeforeUnload)

  // 组件卸载时的清理
  tryOnScopeDispose(() => {
    resetState()
  })

  return {
    // 状态
    hasUnsavedChanges,
    lastSavedAt,
    changesSince,
    timeSinceLastSave,
    saveState,
    currentInstanceId,
    autoSaveEnabled,
    promptOnLeave,

    // 方法
    startTracking,
    updateTrackedState,
    markAsChanged,
    markAsSaved,
    markAsAutoSaved,
    setCurrentInstance,
    resetState,
    shouldPromptSave,
    getChangesDescription,
    disableTracking,
    enableTracking,
  }
}
