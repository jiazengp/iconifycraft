/**
 * 导出相关类型定义
 */

// import type { AtlasResult } from './atlas'
// import type { TranslationFiles } from './translation'
import type { ValidationError as BaseValidationError, ValidationResult as BaseValidationResult } from './validation'

export interface ExportConfig {
  packName: string
  description: string
  author: string
  version: string
  targetVersion: string
  includeTranslations: boolean
  selectedLanguages: string[]
  customFiles?: Record<string, string | Uint8Array>
  metadata: PackExportMetadata
}

export interface PackExportMetadata {
  packFormat: number
  description: string
  supportedVersions: string[]
  credits?: string[]
  website?: string
  license?: string
}

export interface BuildConfig extends ExportConfig {
  atlasBlob: Blob
  atlasDict: Record<string, unknown>
  translations: Record<string, Record<string, string>>
}

export interface ExportOptions {
  format: 'resource_pack' | 'atlas_only' | 'translation_only' | 'font_config'
  compression: 'none' | 'fast' | 'best'
  includeMetadata: boolean
  validateContent: boolean
  includeReadme: boolean
}

export interface ExportResult {
  blob: Blob
  filename: string
  size: number
  checksum: string
  metadata: ExportMetadata
}

export interface ExportMetadata {
  generatedAt: Date
  totalFiles: number
  totalSize: number
  format: string
  version: string
  includedFeatures: string[]
}

export interface ValidationResult extends BaseValidationResult {
  warnings: ValidationWarning[]
}

export interface ValidationError extends BaseValidationError {
  type: 'fatal' | 'error'
  file?: string
  line?: number
}

export interface ValidationWarning {
  type: 'warning' | 'info'
  code: string
  message: string
  file?: string
  suggestion?: string
}

export interface PackStructure {
  'pack.mcmeta': string
  'assets/minecraft/font/icon.json': string
  'assets/minecraft/textures/font/icon_atlas.png': Blob
  [languageFile: string]: string | Blob
}

// 新增导出确认对话框相关类型
export interface ExportConfirmationData {
  packName: string
  packDescription?: string
  packFormat: number
  supportedFormats?: string
  customSupportedFormats?: string
  allowedIncompatible?: boolean
  includeTranslationKeys?: boolean
  packIcon?: Uint8Array
}

export interface SourcePack {
  name: string
  author?: string
  description?: string
  iconCount: number
}

export interface AtlasPreviewData {
  atlasImage: string
  iconCount: number
  atlasSize: string
  layout: string
  fontFiles: string[]
}

export interface FileStructureItem {
  type: 'file' | 'folder'
  name: string
  path: string
  size?: number
  children?: FileStructureItem[]
}

export interface ExportProgress {
  stage: 'preparing' | 'generating' | 'compressing' | 'finalizing' | 'complete' | 'error'
  progress: number
  message: string
  error?: Error
}
