import type { ComputedRef, Ref } from 'vue'
import type { AtlasResult } from '~/types/atlas'
import type { IconItem } from '~/types/icon'
import type { MinecraftVersion } from '~/types/minecraft'
import NProgress from 'nprogress'
import { computed, ref } from 'vue'
import { TEXTURE_TRANSLATION_MAPPING } from '~/data/texture-translation-mapping'
import { ExportService } from '~/services/core/ExportService'
import { logger } from '~/utils/logger'
import { useCopyToClipboard } from './useCopyToClipboard'
import { useNotification } from './useNotification'

export interface ExportSettings {
  packName: string
  packDescription: string
  supportedFormats: string
  customSupportedFormats: string
  allowedIncompatible: boolean
  includeTranslationKeys: boolean
  includeReadme: boolean
  agreeContentRules: boolean
  packIcon?: Uint8Array
  licenseFile?: File | null
  packFormat: number
  namespace?: string
}

interface AtlasState {
  readonly atlasGenerated: boolean
  readonly iconList: readonly IconItem[]
  readonly atlasImage: string
  readonly atlasSize: number
  readonly textureSize: number
  readonly unicodeStart: string
  readonly unicodeEnd: string
  readonly atlasResult: AtlasResult | null
}

export function useIconExport(atlasState?: ComputedRef<AtlasState>, selectedVersion?: Ref<string | null>, fontNamespace?: Ref<string>) {
  const { showSuccess, showError } = useNotification()
  const { copyToClipboard } = useCopyToClipboard()
  const { t } = useI18n()

  const exportService = new ExportService()

  // 响应式状态
  const showExportSettings = ref(false)
  const showExportConfirmation = ref(false)
  const currentExportData = ref<ExportSettings | null>(null)
  const currentLicenseFileName = ref('')
  const isExporting = ref(false)
  const exportProgress = ref({
    progress: 0,
    message: '',
    stage: 'preparing' as 'preparing' | 'generating' | 'compressing' | 'finalizing' | 'complete' | 'error',
  })

  // 计算属性
  const canExport = computed(() => {
    if (!atlasState?.value)
      return false
    return atlasState.value.atlasGenerated && atlasState.value.iconList.length > 0
  })
  const totalIcons = computed(() => atlasState?.value?.iconList.length || 0)

  // 辅助函数
  const generateTranslations = (iconList: IconItem[]) => {
    const translations: Record<string, Record<string, string>> = {
      en_us: {},
    }

    for (const icon of iconList) {
      // 原有的翻译键映射到对应的Unicode字符
      translations.en_us[icon.translationKey] = icon.unicodeChar

      // 如果是原版minecraft材质，还需要添加正确的Minecraft翻译key
      if (icon.namespace === 'minecraft') {
        // 检查映射表中是否有对应的翻译key
        const cleanName = icon.name.replace(/\.(png|jpg|jpeg|gif)$/, '')
        const mapping = TEXTURE_TRANSLATION_MAPPING[cleanName]

        if (mapping) {
          // 替换原翻译key最后一个.后面的内容
          const lastDotIndex = icon.translationKey.lastIndexOf('.')
          const prefix = icon.translationKey.substring(0, lastDotIndex + 1)
          const mappedTranslationKey = prefix + mapping.translationKey

          // 添加映射的翻译key（如果与原有key不同）
          if (mappedTranslationKey !== icon.translationKey) {
            translations.en_us[mappedTranslationKey] = icon.unicodeChar
          }
        }
      }
    }

    return translations
  }

  const downloadFile = (blob: Blob, filename: string) => {
    logger.debug('downloadFile called with:', {
      blobSize: blob.size,
      blobType: blob.type,
      filename,
    })

    if (blob.size === 0) {
      logger.error('Blob is empty!')
      showError('export.errors.failed', { message: 'export.errors.emptyFile' })
      return
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.debug('Download triggered successfully')
  }

  const minecraftVersions = [
    { id: '1.21.4', name: 'Minecraft 1.21.4', packFormat: 46 },
    { id: '1.21.3', name: 'Minecraft 1.21.3', packFormat: 42 },
    { id: '1.21.2', name: 'Minecraft 1.21.2', packFormat: 42 },
    { id: '1.21.1', name: 'Minecraft 1.21.1', packFormat: 34 },
    { id: '1.21', name: 'Minecraft 1.21', packFormat: 34 },
    { id: '1.20.6', name: 'Minecraft 1.20.6', packFormat: 32 },
    { id: '1.20.5', name: 'Minecraft 1.20.5', packFormat: 32 },
    { id: '1.20.4', name: 'Minecraft 1.20.4', packFormat: 22 },
    { id: '1.20.3', name: 'Minecraft 1.20.3', packFormat: 22 },
    { id: '1.20.2', name: 'Minecraft 1.20.2', packFormat: 18 },
    { id: '1.20.1', name: 'Minecraft 1.20.1', packFormat: 15 },
    { id: '1.20', name: 'Minecraft 1.20', packFormat: 15 },
    { id: '1.19.4', name: 'Minecraft 1.19.4', packFormat: 13 },
    { id: '1.19.3', name: 'Minecraft 1.19.3', packFormat: 12 },
    { id: '1.19.2', name: 'Minecraft 1.19.2', packFormat: 9 },
    { id: '1.19.1', name: 'Minecraft 1.19.1', packFormat: 9 },
    { id: '1.19', name: 'Minecraft 1.19', packFormat: 9 },
    { id: '1.18.2', name: 'Minecraft 1.18.2', packFormat: 9 },
    { id: '1.18.1', name: 'Minecraft 1.18.1', packFormat: 8 },
    { id: '1.18', name: 'Minecraft 1.18', packFormat: 8 },
    { id: '1.17.1', name: 'Minecraft 1.17.1', packFormat: 7 },
    { id: '1.17', name: 'Minecraft 1.17', packFormat: 7 },
    { id: '1.16.5', name: 'Minecraft 1.16.5', packFormat: 6 },
    { id: '1.16.4', name: 'Minecraft 1.16.4', packFormat: 6 },
    { id: '1.16.3', name: 'Minecraft 1.16.3', packFormat: 6 },
    { id: '1.16.2', name: 'Minecraft 1.16.2', packFormat: 6 },
    { id: '1.16.1', name: 'Minecraft 1.16.1', packFormat: 5 },
    { id: '1.16', name: 'Minecraft 1.16', packFormat: 5 },
    { id: '1.15.2', name: 'Minecraft 1.15.2', packFormat: 5 },
    { id: '1.15.1', name: 'Minecraft 1.15.1', packFormat: 5 },
    { id: '1.15', name: 'Minecraft 1.15', packFormat: 5 },
  ]

  // 方法
  const openExportSettings = () => {
    if (!canExport.value) {
      showError('export.errors.failed', { message: 'export.errors.noAtlas' })
      return
    }
    showExportSettings.value = true
  }

  const handleExportSettings = (exportData: ExportSettings) => {
    currentExportData.value = exportData
    currentLicenseFileName.value = exportData.licenseFile?.name || ''
    showExportSettings.value = false
    showExportConfirmation.value = true
  }

  const handleGoBack = () => {
    showExportConfirmation.value = false
    showExportSettings.value = true
  }

  const confirmExport = async (): Promise<void> => {
    if (!currentExportData.value || !canExport.value) {
      return
    }

    isExporting.value = true
    // 开始进度条
    NProgress.start()

    // 更新进度的辅助函数
    const updateProgress = (progress: number, message: string, stage: typeof exportProgress.value.stage) => {
      exportProgress.value = { progress, message, stage }
      NProgress.set(progress / 100)
    }

    try {
      // 准备导出数据 (10%)
      updateProgress(10, '准备导出数据...', 'preparing')

      if (!atlasState?.value) {
        throw new Error('export.errors.atlasUnavailable')
      }

      // 准备元数据 (20%)
      updateProgress(20, '生成材质包元数据...', 'preparing')
      // 生成安全的包名
      let safeName = currentExportData.value.packName.replace(/[^a-z0-9\u4E00-\u9FFF]/gi, '_')

      // 清理连续的下划线
      safeName = safeName.replace(/_+/g, '_').replace(/^_|_$/g, '')

      // 如果处理后的名称为空，使用默认名称
      if (!safeName) {
        safeName = 'minecraft_icons'
      }

      const metadata = {
        name: safeName,
        displayName: currentExportData.value.packName || 'Minecraft Icons',
        description: currentExportData.value.packDescription || 'IconifyCraft Resource Pack',
        supportedFormats: currentExportData.value.supportedFormats === 'custom'
          ? currentExportData.value.customSupportedFormats
          : currentExportData.value.supportedFormats,
        allowedIncompatible: currentExportData.value.allowedIncompatible,
        tags: ['icons', 'chat', 'unicode'],
        category: 'utility' as const,
        compatibility: {
          minVersion: selectedVersion?.value || '',
          packFormat: currentExportData.value.packFormat || 48,
        },
        features: [],
        credits: [],
        changelog: [],
      }

      const foundVersion = minecraftVersions.find(v => v.id === selectedVersion?.value)
        || minecraftVersions[0] // 如果没找到，使用第一个版本作为默认值

      if (!foundVersion) {
        throw new Error('No Minecraft versions available')
      }

      // 使用对象扩展来创建符合 MinecraftVersion 接口的对象
      const versionInfo: MinecraftVersion = {
        ...foundVersion,
        releaseDate: new Date().toISOString().split('T')[0],
        protocolVersion: 0, // 默认值，如果需要的话可以从其他地方获取
        dataVersion: 0,
        textureChanges: [], // 默认空数组
      } as MinecraftVersion

      // 准备图集数据 (40%)
      updateProgress(40, '处理图集数据...', 'generating')
      // 从全局状态获取完整的图集结果（支持多图集）
      const atlasResult = atlasState.value.atlasResult

      if (!atlasResult) {
        throw new Error('图集数据不可用，请重新生成图集')
      }

      // 生成翻译数据 (60%)
      updateProgress(60, '生成字体文件...', 'generating')
      const translations = currentExportData.value.includeTranslationKeys
        ? generateTranslations([...atlasState.value.iconList])
        : {}

      // 导出材质包 (70% - 90%)
      updateProgress(70, '打包资源文件...', 'compressing')
      const result = await exportService.exportResourcePack(
        metadata,
        atlasResult,
        translations,
        versionInfo,
        {
          includeAtlas: true,
          includeFont: true,
          includeTranslations: currentExportData.value.includeTranslationKeys,
          includeSounds: false,
          includeModels: false,
          compressionLevel: 6,
          generateReadme: currentExportData.value.includeReadme,
          generateChangelog: false,
          supportedFormats: currentExportData.value.supportedFormats === 'custom'
            ? currentExportData.value.customSupportedFormats
            : currentExportData.value.supportedFormats,
          allowedIncompatible: currentExportData.value.allowedIncompatible,
        },
        currentExportData.value.packIcon,
        `${currentExportData.value.namespace || fontNamespace?.value || 'iconifycraft'}:default`,
        currentExportData.value.licenseFile,
      )

      // 下载文件 (95%)
      updateProgress(95, '准备下载...', 'finalizing')
      downloadFile(result.blob, result.filename)

      // 完成 (100%)
      updateProgress(100, '导出完成!', 'complete')

      showSuccess(t('export.success.completed'), {
        message: t('export.success.details', { filename: result.filename }),
        action: {
          label: t('export.copysha1'),
          onClick: () => {
            copyToClipboard(
              result.checksum,
              'SHA1',
              'export-sha1',
              () => showSuccess(t('clipboard.success.copied'), {
                message: t('clipboard.success.sha1Copied'),
              }),
              errorMsg => showError(t('clipboard.errors.failed'), {
                message: errorMsg,
              }),
            )
          },
        },
      })

      // 稍等一会让用户看到完成状态，然后关闭对话框
      setTimeout(() => {
        showExportConfirmation.value = false
        currentExportData.value = null
      }, 1500)
    }
    catch (error) {
      updateProgress(0, error instanceof Error ? error.message : 'export.errors.failed', 'error')
      showError('export.errors.failed', {
        message: error instanceof Error ? error.message : 'export.errors.unknown',
      })
    }
    finally {
      isExporting.value = false
      // 完成进度条
      NProgress.done()
    }
  }

  const quickExport = async () => {
    if (!canExport.value) {
      showError('export.errors.failed', { message: 'export.errors.noAtlas' })
      return
    }

    const defaultSettings: ExportSettings = {
      packName: 'minecraft-icons',
      packDescription: 'Generated chat icons from IconifyCraft',
      supportedFormats: 'auto',
      customSupportedFormats: '',
      allowedIncompatible: false,
      includeTranslationKeys: true,
      includeReadme: true,
      agreeContentRules: false,
      packFormat: minecraftVersions.find(v => v.id === selectedVersion?.value)?.packFormat || 48,
      namespace: 'iconifycraft',
    }

    currentExportData.value = defaultSettings
    await confirmExport()
  }

  return {
    // 状态
    showExportSettings,
    showExportConfirmation,
    currentExportData,
    currentLicenseFileName,
    isExporting,
    exportProgress,

    // 计算属性
    canExport,
    totalIcons,

    // 方法
    openExportSettings,
    handleExportSettings,
    handleGoBack,
    confirmExport,
    quickExport,
  }
}
