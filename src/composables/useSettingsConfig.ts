import type { SettingSection } from '~/types/settings'
import type { LogLevel } from '~/utils/logger'
import { LOG_LEVEL_NAMES, LOG_LEVELS } from '~/utils/logger'
import { useAppSettings } from './useAppSettings'
import { useLangs } from './useLangs'

export function useSettingsConfig() {
  const { t } = useI18n()
  const {
    autoSaveEnabled,
    autoSaveInterval,
    promptOnLeave,
    toastPosition,
    toastDuration,
    logLevel,
    logStorageEnabled,
    maxLogEntries,
  } = useAppSettings()
  const { currentLang, switchToLang } = useLangs()

  const settingsConfig: SettingSection[] = [
    {
      id: 'appearance',
      title: computed(() => t('settings.appearance.title')),
      description: computed(() => t('settings.appearance.description')),
      animationDelay: 0.1,
      className: 'slide-enter-left',
      items: [
        {
          id: 'language',
          type: 'select',
          label: computed(() => t('settings.appearance.language.title')),
          description: computed(() => t('settings.appearance.language.description')),
          options: [
            { value: 'zh', label: '中文' },
            { value: 'en', label: 'English' },
          ],
          width: 'w-48',
          modelValue: computed(() => currentLang.value.code),
          onUpdate: (value: unknown) => {
            type SupportedLang = 'zh' | 'en'
            const isSupportedLang = (val: unknown): val is SupportedLang =>
              typeof val === 'string' && ['zh', 'en'].includes(val)

            if (isSupportedLang(value)) {
              switchToLang(value)
            }
          },
        },
        {
          id: 'theme',
          type: 'component',
          component: 'ThemeVisualSelector',
          label: computed(() => t('settings.appearance.theme.title')),
          description: computed(() => t('settings.appearance.theme.description')),
        },
        {
          id: 'toastPosition',
          type: 'component',
          component: 'ToastPositionSelector',
          label: computed(() => t('settings.appearance.toastPosition.title')),
          description: computed(() => t('settings.appearance.toastPosition.description')),
          modelValue: computed(() => toastPosition.value),
          onUpdate: (value: unknown) => { toastPosition.value = value as ToastPosition },
        },
        {
          id: 'toastDuration',
          type: 'select',
          label: computed(() => t('settings.appearance.toastDuration.title')),
          description: computed(() => t('settings.appearance.toastDuration.description')),
          options: computed(() => [
            { value: 'fast', label: t('settings.appearance.toastDuration.fast') },
            { value: 'default', label: t('settings.appearance.toastDuration.default') },
            { value: 'slow', label: t('settings.appearance.toastDuration.slow') },
          ]),
          width: 'w-48',
          modelValue: computed(() => toastDuration.value),
          onUpdate: (value: unknown) => { toastDuration.value = value as ToastDuration },
        },
      ],
    },
    {
      id: 'behavior',
      title: computed(() => t('settings.behavior.title')),
      description: computed(() => t('settings.behavior.description')),
      animationDelay: 0.5,
      className: 'slide-enter-left',
      items: [
        {
          id: 'autoSave',
          type: 'switch',
          label: computed(() => t('settings.autoSave.title')),
          description: computed(() => t('settings.autoSave.description')),
          color: 'primary',
          size: 'md',
          modelValue: computed(() => autoSaveEnabled.value),
          onUpdate: (value: unknown) => { autoSaveEnabled.value = value as boolean },
          children: [
            {
              id: 'autoSaveInterval',
              type: 'select',
              label: computed(() => t('settings.autoSave.interval')),
              description: computed(() => t('settings.autoSave.intervalDescription')),
              options: [
                { value: 1000, label: '1s' },
                { value: 3000, label: '3s' },
                { value: 5000, label: '5s' },
                { value: 10000, label: '10s' },
                { value: 30000, label: '30s' },
              ],
              width: 'max-w-xs',
              modelValue: computed(() => autoSaveInterval.value),
              onUpdate: (value: unknown) => { autoSaveInterval.value = value as number },
            },
          ],
        },
        {
          id: 'promptOnLeave',
          type: 'switch',
          label: computed(() => t('settings.promptOnLeave.title')),
          description: computed(() => t('settings.promptOnLeave.description')),
          color: 'primary',
          size: 'md',
          modelValue: computed(() => promptOnLeave.value),
          onUpdate: (value: unknown) => { promptOnLeave.value = value as boolean },
        },
      ],
    },
    {
      id: 'debugging',
      title: computed(() => t('settings.debugging.title')),
      description: computed(() => t('settings.debugging.description')),
      animationDelay: 0.9,
      className: 'slide-enter-left',
      items: [
        {
          id: 'logLevel',
          type: 'select',
          label: computed(() => t('settings.debugging.logLevel.title')),
          description: computed(() => t('settings.debugging.logLevel.description')),
          options: [
            { value: LOG_LEVELS.SILENT, label: LOG_LEVEL_NAMES[LOG_LEVELS.SILENT] },
            { value: LOG_LEVELS.ERROR, label: LOG_LEVEL_NAMES[LOG_LEVELS.ERROR] },
            { value: LOG_LEVELS.WARN, label: LOG_LEVEL_NAMES[LOG_LEVELS.WARN] },
            { value: LOG_LEVELS.INFO, label: LOG_LEVEL_NAMES[LOG_LEVELS.INFO] },
            { value: LOG_LEVELS.DEBUG, label: LOG_LEVEL_NAMES[LOG_LEVELS.DEBUG] },
            { value: LOG_LEVELS.VERBOSE, label: LOG_LEVEL_NAMES[LOG_LEVELS.VERBOSE] },
          ],
          width: 'w-48',
          modelValue: computed(() => logLevel.value),
          onUpdate: (value: unknown) => { logLevel.value = value as LogLevel },
        },
        {
          id: 'logStorage',
          type: 'switch',
          label: computed(() => t('settings.debugging.logStorage.title')),
          description: computed(() => t('settings.debugging.logStorage.description')),
          color: 'primary',
          size: 'md',
          modelValue: computed(() => logStorageEnabled.value),
          onUpdate: (value: unknown) => { logStorageEnabled.value = value as boolean },
          children: [
            {
              id: 'maxLogEntries',
              type: 'select',
              label: computed(() => t('settings.debugging.maxLogEntries.title')),
              description: computed(() => t('settings.debugging.maxLogEntries.description')),
              options: [
                { value: 100, label: '100' },
                { value: 500, label: '500' },
                { value: 1000, label: '1000' },
                { value: 2000, label: '2000' },
                { value: 5000, label: '5000' },
              ],
              width: 'w-32',
              modelValue: computed(() => maxLogEntries.value),
              onUpdate: (value: unknown) => { maxLogEntries.value = value as number },
            },
          ],
        },
        {
          id: 'logDownload',
          type: 'component',
          component: 'LogDownloadButton',
          label: computed(() => t('settings.debugging.logDownload.title')),
          description: computed(() => t('settings.debugging.logDownload.description')),
        },
      ],
    },
  ]

  return {
    settingsConfig,
  }
}
