import type { ExportSettings } from './useIconExport'
import type { IconItem } from '~/types/icon'
import type { ResourcePack } from '~/types/resource-pack'
import { useStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAtlasGenerator } from './useAtlasGenerator'
import { useIconExport } from './useIconExport'
import { useNotification } from './useNotification'

/**
 * 应用全局状态管理
 * @returns {object} 应用状态和操作方法
 */
export function useAppState() {
  const { t } = useI18n()
  const { showSuccess, showError, showInfo } = useNotification()

  // 持久化状态
  const selectedVersion = useStorage<string>('mc-selected-version', '')
  const namespace = useStorage<string>('mc-namespace', 'iconifycraft')
  const appSettings = useStorage('mc-app-settings', {
    theme: 'auto' as 'light' | 'dark' | 'auto',
    language: 'zh-CN' as string,
    showAdvancedOptions: false,
    autoSave: true,
    compressionLevel: 6,
  })

  // 运行时状态
  const resourcePacks = ref<ResourcePack[]>([])
  const selectedIcon = ref<IconItem | null>(null)
  const showIconDetail = ref(false)
  const isInitialized = ref(false)

  // 计算属性
  const hasResourcePacks = computed(() => resourcePacks.value.length > 0)
  const hasVanillaPack = computed(() =>
    resourcePacks.value.some(pack => pack.name?.startsWith('Vanilla_')),
  )
  const allTextures = computed(() => {
    const textures = []
    for (const pack of resourcePacks.value) {
      for (const texture of pack.textures) {
        if ((texture.category === 'item' && texture.fullPath.includes('/textures/item/'))
          || (texture.category === 'block' && texture.fullPath.includes('/textures/block/'))) {
          textures.push({
            ...texture,
            sourcePack: pack.name,
          })
        }
      }
    }
    return textures
  })

  // 集成图集生成器
  const atlasGenerator = useAtlasGenerator(() => allTextures.value)

  // 集成导出功能
  const exportManager = useIconExport(
    computed(() => ({
      atlasGenerated: atlasGenerator.atlasGenerated.value,
      iconList: atlasGenerator.iconList.value,
      atlasImage: atlasGenerator.atlasImage.value,
      atlasSize: atlasGenerator.atlasSize.value,
      textureSize: atlasGenerator.textureSize.value,
      unicodeStart: atlasGenerator.unicodeStart.value,
      unicodeEnd: atlasGenerator.unicodeEnd.value,
      atlasResult: atlasGenerator.atlasResult.value,
    })),
    selectedVersion,
    namespace,
  )

  // 业务逻辑方法
  const addResourcePacks = (packs: ResourcePack[]) => {
    resourcePacks.value.push(...packs)
    showSuccess(t('upload.success'), {
      message: t('notification.packs.added', { count: packs.length }),
    })
  }

  const removeResourcePack = (packId: string) => {
    const index = resourcePacks.value.findIndex(pack => pack.id === packId)
    if (index >= 0) {
      const removed = resourcePacks.value.splice(index, 1)[0]
      showInfo(t('pack.removed'), {
        message: t('notification.pack.removed', { name: removed.name }),
      })
    }
  }

  const reorderResourcePacks = (packs: ResourcePack[]) => {
    resourcePacks.value = packs
  }

  const checkCompatibility = async () => {
    if (!selectedVersion.value) {
      showError(t('minecraft.selectVersion.required'))
      return
    }

    try {
      showInfo(t('minecraft.checkCompatibility.progress'))
      // TODO: 实现兼容性检查逻辑
      showSuccess(t('minecraft.allCompatible'), {})
    }
    catch {
      showError(t('minecraft.validationError'))
    }
  }

  const selectVersion = async (version: string) => {
    try {
      selectedVersion.value = version
      showSuccess(t('minecraft.versionChanged', { version }), {})

      // 触发兼容性检查
      if (hasResourcePacks.value) {
        await checkCompatibility()
      }
    }
    catch {
      showError(t('minecraft.versionChanged.failed'))
    }
  }

  const generateAtlas = async () => {
    if (!hasVanillaPack.value) {
      showError(t('upload.vanilla.required'))
      return
    }

    try {
      const result = await atlasGenerator.generateAtlas()
      if (result) {
        showSuccess(t('atlas.generation.success'), {
          message: t('notification.atlas.generated', {
            count: result.atlasGroups?.length || 1,
            total: result.metadata.totalTextures,
          }),
        })
      }
    }
    catch {
      showError(t('atlas.generation.failed'))
    }
  }

  const exportResourcePack = async (options: ExportSettings) => {
    try {
      exportManager.handleExportSettings(options)
      await exportManager.confirmExport()
      showSuccess(t('export.success'))
    }
    catch {
      showError(t('export.failed'))
    }
  }

  const showIconDetails = (icon: IconItem) => {
    selectedIcon.value = icon
    showIconDetail.value = true
  }

  const updateSettings = (newSettings: Partial<typeof appSettings.value>) => {
    Object.assign(appSettings.value, newSettings)
    showInfo(t('settings.updated'))
  }

  // 初始化
  const initialize = async () => {
    if (isInitialized.value)
      return

    try {
      // 恢复上次的状态
      if (selectedVersion.value && hasResourcePacks.value) {
        await checkCompatibility()
      }

      isInitialized.value = true
    }
    catch {
      showError(t('app.initialization.failed'))
    }
  }

  // 监听变化
  watch(selectedVersion, (newVersion) => {
    if (newVersion && hasResourcePacks.value) {
      checkCompatibility()
    }
  })

  return {
    // 状态
    selectedVersion,
    namespace,
    appSettings,
    resourcePacks,
    selectedIcon,
    showIconDetail,
    isInitialized,

    // 计算属性
    hasResourcePacks,
    hasVanillaPack,
    allTextures,

    // 集成的功能
    atlasGenerator,
    exportManager,

    // 方法
    addResourcePacks,
    removeResourcePack,
    reorderResourcePacks,
    selectVersion,
    checkCompatibility,
    generateAtlas,
    exportResourcePack,
    showIconDetails,
    updateSettings,
    initialize,
  }
}

/**
 * 全局应用状态实例（单例模式）
 */
let appStateInstance: ReturnType<typeof useAppState> | null = null

/**
 * 获取全局应用状态实例
 * @returns {ReturnType<typeof useAppState>} 应用状态实例
 */
export function useGlobalAppState() {
  if (!appStateInstance) {
    appStateInstance = useAppState()
  }
  return appStateInstance
}
