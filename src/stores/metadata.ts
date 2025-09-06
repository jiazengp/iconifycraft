/**
 * 元数据管理状态
 */

import type {
  CustomMetadata,
  MetadataExportOptions,
  MetadataTemplate,
  MetadataValidationResult,
} from '~/types/metadata'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { MetadataService } from '~/services/core/MetadataService'
import { MinecraftService } from '~/services/core/MinecraftService'
import {
  BUILTIN_TEMPLATES,
  DEFAULT_CUSTOM_METADATA,
} from '~/types/metadata'
import { useAtlasStore } from './atlas'
import { useMinecraftStore } from './minecraft'

export const useMetadataStore = defineStore('metadata', () => {
  // 服务实例
  const metadataService = new MetadataService()

  // 响应式状态
  const currentMetadata = ref<CustomMetadata>({ ...DEFAULT_CUSTOM_METADATA })
  const isValidating = ref(false)
  const isSaving = ref(false)
  const isExporting = ref(false)
  const validationResult = ref<MetadataValidationResult | null>(null)
  const errors = ref<string[]>([])

  // 持久化模板
  const customTemplates = useStorage<MetadataTemplate[]>('mc-metadata-templates', [])

  // 依赖的Store
  const minecraftStore = useMinecraftStore()
  const atlasStore = useAtlasStore()

  // 计算属性
  const allTemplates = computed(() => [
    ...BUILTIN_TEMPLATES,
    ...customTemplates.value,
  ])

  const isValid = computed(() =>
    validationResult.value?.isValid ?? false,
  )

  const hasErrors = computed(() =>
    validationResult.value?.errors.some(e => e.severity === 'error') ?? false,
  )

  const hasWarnings = computed(() =>
    validationResult.value?.errors.some(e => e.severity === 'warning') ?? false,
  )

  const validationErrors = computed(() =>
    validationResult.value?.errors.filter(e => e.severity === 'error') ?? [],
  )

  const validationWarnings = computed(() =>
    validationResult.value?.errors.filter(e => e.severity === 'warning') ?? [],
  )

  const suggestions = computed(() =>
    validationResult.value?.suggestions ?? [],
  )

  const packFileName = computed(() =>
    metadataService.generatePackFileName(currentMetadata.value),
  )

  const isMetadataComplete = computed(() => {
    const meta = currentMetadata.value
    return !!(
      meta.name
      && meta.displayName
      && meta.description
      && meta.version
      && meta.author
      && meta.compatibility.minVersion
    )
  })

  const validateMetadata = async (): Promise<MetadataValidationResult> => {
    isValidating.value = true

    try {
      const result = metadataService.validateMetadata(currentMetadata.value)
      validationResult.value = result
      return result
    }
    finally {
      isValidating.value = false
    }
  }

  // Actions
  const loadMetadata = (metadata: CustomMetadata): void => {
    currentMetadata.value = { ...metadata }
    validateMetadata()
  }

  const updateMetadata = (updates: Partial<CustomMetadata>): void => {
    Object.assign(currentMetadata.value, updates)
    validateMetadata()
  }

  const autoFillMetadata = (): void => {
    const autoFilled = metadataService.autoFillMetadata(currentMetadata.value)
    currentMetadata.value = autoFilled
    validateMetadata()
  }

  const createFromTemplate = (templateId: string, overrides: Partial<CustomMetadata> = {}): void => {
    try {
      const metadata = metadataService.createFromTemplate(templateId, overrides)
      loadMetadata(metadata)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'metadata.template.loadFailed'
      errors.value = [message]
    }
  }

  const saveAsTemplate = (
    templateData: Omit<MetadataTemplate, 'isBuiltIn' | 'template'> & {
      includeFields?: (keyof CustomMetadata)[]
    },
  ): void => {
    const { includeFields, ...templateInfo } = templateData

    // 确定要包含的字段
    const fieldsToInclude = includeFields || [
      'category',
      'tags',
      'features',
      'compatibility',
    ]

    // 创建模板数据
    const template: Partial<CustomMetadata> = {}
    for (const field of fieldsToInclude) {
      if (currentMetadata.value[field] !== undefined) {
        template[field] = currentMetadata.value[field]
      }
    }

    const newTemplate: MetadataTemplate = {
      ...templateInfo,
      template,
      isBuiltIn: false,
    }

    // 保存到自定义模板
    const existingIndex = customTemplates.value.findIndex(t => t.id === newTemplate.id)
    if (existingIndex >= 0) {
      customTemplates.value[existingIndex] = newTemplate
    }
    else {
      customTemplates.value.push(newTemplate)
    }

    metadataService.saveTemplate(newTemplate)
  }

  const deleteTemplate = (templateId: string): boolean => {
    const templateIndex = customTemplates.value.findIndex(t => t.id === templateId)
    if (templateIndex >= 0) {
      customTemplates.value.splice(templateIndex, 1)
      return metadataService.deleteTemplate(templateId)
    }
    return false
  }

  const exportMetadata = async (options: MetadataExportOptions): Promise<string> => {
    isExporting.value = true

    try {
      const exported = metadataService.exportMetadata(currentMetadata.value, options)

      // 下载文件
      const extension = options.format === 'mcmeta' ? 'json' : options.format
      const filename = `pack.${extension}`
      const mimeType = options.format === 'yaml'
        ? 'text/yaml'
        : options.format === 'toml' ? 'text/plain' : 'application/json'

      const blob = new Blob([exported], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)

      return exported
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'metadata.export.failed'
      errors.value = [message]
      throw error
    }
    finally {
      isExporting.value = false
    }
  }

  const generatePackMcmeta = (): string => {
    const selectedVersion = minecraftStore.currentVersionInfo
    if (!selectedVersion) {
      throw new Error('metadata.noVersionSelected')
    }

    const packMeta = metadataService.createPackMcmeta(currentMetadata.value, selectedVersion)
    return JSON.stringify(packMeta, null, 2)
  }

  const generateFontJson = (): string => {
    if (!atlasStore.hasAtlas) {
      throw new Error('metadata.noAtlasGenerated')
    }

    const fontMeta = metadataService.createFontMetadata(
      atlasStore.atlasResult!,
      'textures/font/default.png',
    )
    return JSON.stringify(fontMeta, null, 2)
  }

  const generateAtlasJson = (sources: string[] = ['textures/']): string => {
    const atlasMeta = metadataService.createAtlasMetadata(sources)
    return JSON.stringify(atlasMeta, null, 2)
  }

  const updateCompatibility = (minVersion: string, packFormat?: number): void => {
    const minecraftService = new MinecraftService()
    const versionInfo = minecraftService.getVersionInfo(minVersion)
    if (!versionInfo) {
      throw new Error(`metadata.invalidVersion: ${minVersion}`)
    }

    updateMetadata({
      compatibility: {
        ...currentMetadata.value.compatibility,
        minVersion,
        packFormat: packFormat || versionInfo.packFormat,
      },
    })
  }

  const addFeature = (feature: string): void => {
    if (!currentMetadata.value.features.includes(feature)) {
      currentMetadata.value.features.push(feature)
      validateMetadata()
    }
  }

  const removeFeature = (feature: string): void => {
    const index = currentMetadata.value.features.indexOf(feature)
    if (index >= 0) {
      currentMetadata.value.features.splice(index, 1)
      validateMetadata()
    }
  }

  const addTag = (tag: string): void => {
    if (!currentMetadata.value.tags.includes(tag)) {
      currentMetadata.value.tags.push(tag)
      validateMetadata()
    }
  }

  const removeTag = (tag: string): void => {
    const index = currentMetadata.value.tags.indexOf(tag)
    if (index >= 0) {
      currentMetadata.value.tags.splice(index, 1)
      validateMetadata()
    }
  }

  const addCredit = (credit: { name: string, role: string, contribution: string }): void => {
    currentMetadata.value.credits.push(credit)
    validateMetadata()
  }

  const removeCredit = (index: number): void => {
    if (index >= 0 && index < currentMetadata.value.credits.length) {
      currentMetadata.value.credits.splice(index, 1)
      validateMetadata()
    }
  }

  const addChangelogEntry = (entry: { version: string, date: string, changes: string[] }): void => {
    // 按版本排序插入
    const insertIndex = currentMetadata.value.changelog.findIndex(e =>
      compareVersions(e.version, entry.version) < 0,
    )

    if (insertIndex >= 0) {
      currentMetadata.value.changelog.splice(insertIndex, 0, entry)
    }
    else {
      currentMetadata.value.changelog.push(entry)
    }

    validateMetadata()
  }

  const removeChangelogEntry = (index: number): void => {
    if (index >= 0 && index < currentMetadata.value.changelog.length) {
      currentMetadata.value.changelog.splice(index, 1)
      validateMetadata()
    }
  }

  const resetMetadata = (): void => {
    currentMetadata.value = { ...DEFAULT_CUSTOM_METADATA }
    validationResult.value = null
    errors.value = []
  }

  const clearErrors = (): void => {
    errors.value = []
  }

  // 工具函数
  function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    const maxLength = Math.max(parts1.length, parts2.length)

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0

      if (part1 < part2)
        return 1
      if (part1 > part2)
        return -1
    }

    return 0
  }

  return {
    // 状态
    currentMetadata,
    isValidating: readonly(isValidating),
    isSaving: readonly(isSaving),
    isExporting: readonly(isExporting),
    validationResult: readonly(validationResult),
    errors: readonly(errors),
    customTemplates: readonly(customTemplates),

    // 计算属性
    allTemplates,
    isValid,
    hasErrors,
    hasWarnings,
    validationErrors,
    validationWarnings,
    suggestions,
    packFileName,
    isMetadataComplete,

    // 方法
    loadMetadata,
    updateMetadata,
    validateMetadata,
    autoFillMetadata,
    createFromTemplate,
    saveAsTemplate,
    deleteTemplate,
    exportMetadata,
    generatePackMcmeta,
    generateFontJson,
    generateAtlasJson,
    updateCompatibility,
    addFeature,
    removeFeature,
    addTag,
    removeTag,
    addCredit,
    removeCredit,
    addChangelogEntry,
    removeChangelogEntry,
    resetMetadata,
    clearErrors,
  }
})
