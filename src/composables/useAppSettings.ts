import type { LogLevel } from '~/utils/logger'
import { useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import { logger } from '~/utils/logger'

export type ToastPosition
  = | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

export type ToastDuration = 'default' | 'fast' | 'slow'

interface AppSettings {
  autoSaveEnabled: boolean
  autoSaveInterval: number
  promptOnLeave: boolean
  toastPosition: ToastPosition
  toastDuration: ToastDuration
  logLevel: LogLevel
  logStorageEnabled: boolean
  maxLogEntries: number
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSaveEnabled: false,
  autoSaveInterval: 3000,
  promptOnLeave: true,
  toastPosition: 'top-right',
  toastDuration: 'default',
  logLevel: 3,
  logStorageEnabled: false,
  maxLogEntries: 1000,
}

export function useAppSettings() {
  const settings = useStorage<AppSettings>('mc-chat-icons:app-settings', DEFAULT_SETTINGS, localStorage, {
    mergeDefaults: true,
  })

  const autoSaveEnabled = computed({
    get: () => settings.value.autoSaveEnabled,
    set: (value: boolean) => {
      settings.value.autoSaveEnabled = value
    },
  })

  const autoSaveInterval = computed({
    get: () => settings.value.autoSaveInterval,
    set: (value: number) => {
      settings.value.autoSaveInterval = Math.max(1000, value)
    },
  })

  const promptOnLeave = computed({
    get: () => settings.value.promptOnLeave,
    set: (value: boolean) => {
      settings.value.promptOnLeave = value
    },
  })

  const toastPosition = computed({
    get: () => settings.value.toastPosition,
    set: (value: ToastPosition) => {
      settings.value.toastPosition = value
    },
  })

  const toastDuration = computed({
    get: () => settings.value.toastDuration,
    set: (value: ToastDuration) => {
      settings.value.toastDuration = value
    },
  })

  const logLevel = computed({
    get: () => settings.value.logLevel,
    set: (value: LogLevel) => {
      settings.value.logLevel = value
    },
  })

  const logStorageEnabled = computed({
    get: () => settings.value.logStorageEnabled,
    set: (value: boolean) => {
      settings.value.logStorageEnabled = value
    },
  })

  const maxLogEntries = computed({
    get: () => settings.value.maxLogEntries,
    set: (value: number) => {
      settings.value.maxLogEntries = Math.max(100, Math.min(5000, value))
    },
  })

  watch(
    [logLevel, logStorageEnabled, maxLogEntries],
    ([level, storageEnabled, maxEntries]) => {
      logger.updateSettings({
        level,
        storage: {
          enabled: storageEnabled,
          maxEntries,
          storageKey: 'iconifycraft_logs',
        },
      })
    },
    { immediate: true },
  )

  const resetToDefaults = () => {
    Object.assign(settings.value, DEFAULT_SETTINGS)
  }

  const updateSettings = (updates: Partial<AppSettings>) => {
    Object.assign(settings.value, updates)
  }

  const exportSettings = (): string => {
    return JSON.stringify(settings.value, null, 2)
  }

  const importSettings = (settingsJson: string): boolean => {
    try {
      const importedSettings = JSON.parse(settingsJson) as Partial<AppSettings>

      if (typeof importedSettings !== 'object' || importedSettings === null) {
        return false
      }

      const validSettings: Partial<AppSettings> = {}

      if (typeof importedSettings.autoSaveEnabled === 'boolean') {
        validSettings.autoSaveEnabled = importedSettings.autoSaveEnabled
      }

      if (typeof importedSettings.autoSaveInterval === 'number' && importedSettings.autoSaveInterval >= 1000) {
        validSettings.autoSaveInterval = importedSettings.autoSaveInterval
      }

      if (typeof importedSettings.promptOnLeave === 'boolean') {
        validSettings.promptOnLeave = importedSettings.promptOnLeave
      }

      if (typeof importedSettings.toastPosition === 'string'
        && ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].includes(importedSettings.toastPosition)) {
        validSettings.toastPosition = importedSettings.toastPosition as ToastPosition
      }

      if (typeof importedSettings.toastDuration === 'string'
        && ['default', 'fast', 'slow'].includes(importedSettings.toastDuration)) {
        validSettings.toastDuration = importedSettings.toastDuration as ToastDuration
      }

      if (typeof importedSettings.logLevel === 'number'
        && importedSettings.logLevel >= 0 && importedSettings.logLevel <= 5) {
        validSettings.logLevel = importedSettings.logLevel as LogLevel
      }

      if (typeof importedSettings.logStorageEnabled === 'boolean') {
        validSettings.logStorageEnabled = importedSettings.logStorageEnabled
      }

      if (typeof importedSettings.maxLogEntries === 'number'
        && importedSettings.maxLogEntries >= 100 && importedSettings.maxLogEntries <= 5000) {
        validSettings.maxLogEntries = importedSettings.maxLogEntries
      }

      if (Object.keys(validSettings).length > 0) {
        updateSettings(validSettings)
        return true
      }

      return false
    }
    catch (error) {
      logger.error('Failed to import settings:', error)
      return false
    }
  }

  return {
    autoSaveEnabled,
    autoSaveInterval,
    promptOnLeave,
    toastPosition,
    toastDuration,
    logLevel,
    logStorageEnabled,
    maxLogEntries,

    settings: computed(() => settings.value),

    resetToDefaults,
    updateSettings,
    exportSettings,
    importSettings,
  }
}
