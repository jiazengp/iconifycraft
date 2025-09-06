/**
 * 导出功能状态管理
 * 重构后的轻量化状态管理，职责更加专一
 */

import type { ExportOptions, ExportResult } from '~/types/export'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { useExportProgress } from '~/composables/useExportProgress'
import { useExportValidation } from '~/composables/useExportValidation'
import { ExportService } from '~/services/core/ExportService'
import { ExportHelpers } from '~/utils/export-helpers'
import { useAtlasStore } from './atlas'
// import { useTranslationStore } from './translation' // 暂时注释掉不存在的store
import { useMetadataStore } from './metadata'
import { useMinecraftStore } from './minecraft'
import { useResourcePackStore } from './resource-pack'

export const useExportStore = defineStore('export', () => {
  // 服务实例
  const exportService = new ExportService()

  // 状态管理组合
  const {
    isExporting,
    exportProgress,
    exportStatus,
    errors,
    progressPercentage,
    hasErrors,
    startExport,
    updateProgress,
    finishExport,
    failExport,
    clearErrors,
    resetProgress,
  } = useExportProgress()

  // 其他状态
  const isGeneratingPreview = ref(false)
  const exportResult = ref<ExportResult | null>(null)
  const previewData = ref<{
    atlasUrl: string
    atlasDict: Record<string, any>
    translations: Record<string, Record<string, string>>
  } | null>(null)

  // 持久化导出配置
  const exportOptions = useStorage('mc-export-options', {
    format: 'resource_pack' as const,
    compression: 'fast' as const,
    includeMetadata: true,
    validateContent: true,
    includeReadme: true,
  } satisfies ExportOptions)

  // 依赖的Store
  const packStore = useResourcePackStore()
  const atlasStore = useAtlasStore()
  const metadataStore = useMetadataStore()
  const minecraftStore = useMinecraftStore()

  // 验证逻辑
  const validationContext = computed(() => ({
    hasVanillaPack: packStore.hasVanillaPack,
    hasAtlas: atlasStore.hasAtlas,
    hasTranslations: true, // Placeholder for now
    isMetadataValid: metadataStore.isValid,
    hasVersionSelected: !!minecraftStore.currentVersionInfo,
  }))

  const {
    canExport,
    canPreview,
    validationIssues,
  } = useExportValidation({
    includeAtlas: true,
    includeFont: true,
    includeTranslations: true,
    includeSounds: false,
    includeModels: false,
    compressionLevel: 6,
    generateReadme: exportOptions.value.includeReadme,
    generateChangelog: false,
  }, validationContext.value)

  // 计算属性
  const estimatedSize = computed(() =>
    ExportHelpers.estimateExportSize({
      includeAtlas: true,
      includeTranslations: true,
      generateReadme: exportOptions.value.includeReadme,
      generateChangelog: false,
      atlasBlob: atlasStore.atlasResult?.atlasBlob,
    }),
  )

  const estimatedSizeFormatted = computed(() =>
    ExportHelpers.formatFileSize(estimatedSize.value),
  )

  const exportSummary = computed(() =>
    ExportHelpers.generateExportSummary({
      includeAtlas: true,
      includeFont: true,
      includeTranslations: true,
      generateReadme: exportOptions.value.includeReadme,
      generateChangelog: false,
      totalTextures: atlasStore.totalTextures,
    }),
  )

  // Actions
  const exportResourcePack = async (): Promise<ExportResult> => {
    if (!canExport.value) {
      throw new Error('export.cannotExport')
    }

    startExport()

    try {
      const metadata = metadataStore.currentMetadata
      const atlasResult = atlasStore.atlasResult
      const translations = {} // Placeholder for translations
      const minecraftVersion = minecraftStore.currentVersionInfo

      if (!minecraftVersion) {
        throw new Error('export.noVersionSelected')
      }

      updateProgress(10, 'export.generatingFiles')

      const result = await exportService.exportResourcePack(
        metadata,
        atlasResult,
        translations,
        minecraftVersion,
        {
          includeAtlas: true,
          includeFont: true,
          includeTranslations: true,
          includeSounds: false,
          includeModels: false,
          compressionLevel: 6,
          generateReadme: exportOptions.value.includeReadme,
          generateChangelog: false,
        },
      )

      updateProgress(90, 'export.compressing')

      // 模拟压缩时间
      await new Promise(resolve => setTimeout(resolve, 500))

      exportResult.value = result
      finishExport()

      return result
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'export.failed'
      failExport(message)
      throw error
    }
  }

  const generatePreview = async (): Promise<void> => {
    if (!canPreview.value) {
      throw new Error('export.cannotPreview')
    }

    isGeneratingPreview.value = true

    try {
      if (atlasStore.hasAtlas) {
        const preview = await exportService.exportPreviewData(
          atlasStore.atlasResult!,
          {}, // Placeholder for translations
        )
        previewData.value = preview
      }
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'export.preview.failed'
      failExport(message)
      throw error
    }
    finally {
      isGeneratingPreview.value = false
    }
  }

  const downloadExportedPack = (): void => {
    if (!exportResult.value) {
      throw new Error('export.noResult')
    }

    ExportHelpers.downloadFile(exportResult.value.blob, exportResult.value.filename)
  }

  const exportSingleFile = async (
    type: 'mcmeta' | 'font' | 'atlas' | 'readme' | 'changelog',
    filename?: string,
  ): Promise<void> => {
    try {
      let content: string | Blob
      let defaultFilename: string
      let mimeType = 'text/plain'

      const metadata = metadataStore.currentMetadata
      const atlasResult = atlasStore.atlasResult!

      switch (type) {
        case 'readme':
          content = ExportHelpers.generateReadmeContent(metadata, atlasResult)
          defaultFilename = 'README.md'
          mimeType = 'text/markdown'
          break

        case 'changelog':
          content = ExportHelpers.generateChangelogContent(metadata)
          defaultFilename = 'CHANGELOG.md'
          mimeType = 'text/markdown'
          break

        default:
          // 其他类型委托给service处理
          content = await exportService.generateFileContent(type, metadata, atlasResult)
          defaultFilename = exportService.getDefaultFilename(type)
          mimeType = exportService.getMimeType(type)
      }

      const isBlob = (value: string | Blob): value is Blob => value instanceof Blob

      if (isBlob(content)) {
        ExportHelpers.downloadFile(content, filename || defaultFilename)
      }
      else {
        const blob = new Blob([content], { type: mimeType })
        ExportHelpers.downloadFile(blob, filename || defaultFilename)
      }
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'export.singleFile.failed'
      failExport(message)
      throw error
    }
  }

  const exportAtlasImage = async (): Promise<void> => {
    if (!atlasStore.hasAtlas) {
      throw new Error('export.noAtlas')
    }

    try {
      const filename = `${metadataStore.packFileName}_atlas.png`
      ExportHelpers.downloadFile(atlasStore.atlasResult!.atlasBlob, filename)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'export.atlas.failed'
      failExport(message)
      throw error
    }
  }

  const updateExportOptions = (updates: Partial<ExportOptions>): void => {
    Object.assign(exportOptions.value, updates)
  }

  const resetExportState = (): void => {
    exportResult.value = null
    resetProgress()

    // 清理预览数据中的URL
    if (previewData.value?.atlasUrl) {
      URL.revokeObjectURL(previewData.value.atlasUrl)
      previewData.value = null
    }
  }

  return {
    // 状态
    isExporting: readonly(isExporting),
    isGeneratingPreview: readonly(isGeneratingPreview),
    exportProgress: readonly(exportProgress),
    exportStatus: readonly(exportStatus),
    exportResult: readonly(exportResult),
    previewData: readonly(previewData),
    errors: readonly(errors),
    exportOptions,

    // 计算属性
    canExport,
    canPreview,
    estimatedSize,
    estimatedSizeFormatted,
    exportSummary,
    validationIssues,
    progressPercentage,
    hasErrors,

    // 方法
    exportResourcePack,
    generatePreview,
    downloadExportedPack,
    exportSingleFile,
    exportAtlasImage,
    updateExportOptions,
    resetExportState,
    clearErrors,
  }
})
