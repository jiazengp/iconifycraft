/**
 * 材质包元数据管理服务
 * 负责元数据的创建、验证、导出和模板管理
 */

import type { AtlasResult } from '~/types/atlas'
import type {
  AtlasMetadata,
  CustomMetadata,
  FontMetadata,
  MetadataExportOptions,
  MetadataTemplate,
  MetadataValidationResult,
  PackMetadata,
} from '~/types/metadata'
import type { MinecraftVersion } from '~/types/minecraft'
import { cloneDeep } from 'lodash-es'
import { DEFAULT_CUSTOM_METADATA } from '~/types/metadata'
import { MetadataExporters } from '~/utils/metadata-exporters'
import { MetadataValidator } from '~/utils/metadata-validation'
import { getPackFormatForVersion } from '~/utils/pack-format'

export class MetadataService {
  private templates: Map<string, MetadataTemplate> = new Map()
  private validator = new MetadataValidator()
  private exporters = new MetadataExporters()

  constructor() {
    this.initializeBuiltInTemplates()
  }

  /**
   * 创建基础pack.mcmeta内容
   */
  createPackMcmeta(metadata: CustomMetadata, minecraftVersion: MinecraftVersion): PackMetadata {
    const packMeta: PackMetadata = {
      pack: {
        pack_format: metadata.compatibility.packFormat || minecraftVersion.packFormat,
        description: this.formatDescription(metadata.description, metadata.displayName),
      },
    }

    if (metadata.compatibility.maxVersion) {
      packMeta.pack.supported_formats = {
        min_inclusive: metadata.compatibility.packFormat,
        max_inclusive: getPackFormatForVersion(metadata.compatibility.maxVersion),
      }
    }

    if (metadata.author || metadata.version || metadata.homepage) {
      packMeta.meta = {
        created_by: metadata.author,
        version: metadata.version,
        homepage: metadata.homepage,
        license: metadata.license,
      }

      if (metadata.compatibility.minVersion) {
        packMeta.meta.game_versions = [metadata.compatibility.minVersion]
        if (metadata.compatibility.maxVersion) {
          packMeta.meta.game_versions.push(metadata.compatibility.maxVersion)
        }
      }
    }

    return packMeta
  }

  /**
   * 创建字体元数据
   */
  createFontMetadata(atlasResult: AtlasResult, fontPath: string): FontMetadata {
    const chars: string[] = []

    for (const info of Object.values(atlasResult.atlasDict)) {
      const char = String.fromCharCode(Number.parseInt(info.unicode, 16))
      chars.push(char)
    }

    return {
      providers: [
        {
          type: 'bitmap',
          file: fontPath,
          height: atlasResult.metadata.tileSize,
          ascent: Math.floor(atlasResult.metadata.tileSize * 0.8),
          chars: [chars.join('')],
        },
      ],
    }
  }

  /**
   * 创建图集元数据
   */
  createAtlasMetadata(sources: string[]): AtlasMetadata {
    return {
      sources: sources.map(source => ({
        type: 'directory' as const,
        source,
      })),
    }
  }

  /**
   * 验证元数据
   */
  validateMetadata(metadata: CustomMetadata): MetadataValidationResult {
    return this.validator.validate(metadata)
  }

  /**
   * 导出元数据
   */
  exportMetadata(
    metadata: CustomMetadata,
    options: MetadataExportOptions = {
      format: 'mcmeta',
      includeCustomFields: true,
      minify: false,
      validateFormat: true,
    },
  ): string {
    const { format, includeCustomFields, minify, validateFormat } = options

    if (validateFormat) {
      const validation = this.validateMetadata(metadata)
      if (!validation.isValid) {
        throw new Error(`metadata.errors.invalid: ${validation.errors.map(e => e.message).join(', ')}`)
      }
    }

    switch (format) {
      case 'mcmeta':
        return this.exporters.exportAsMcmeta(metadata, minify || false)
      case 'json':
        return this.exporters.exportAsJson(metadata, includeCustomFields || false, minify || false)
      case 'yaml':
        return this.exporters.exportAsYaml(metadata, includeCustomFields || false)
      case 'toml':
        return this.exporters.exportAsToml(metadata, includeCustomFields || false)
      default:
        throw new Error(`metadata.errors.unsupportedFormat: ${format}`)
    }
  }

  /**
   * 从模板创建元数据
   */
  createFromTemplate(templateId: string, overrides: Partial<CustomMetadata> = {}): CustomMetadata {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`metadata.errors.templateNotFound: ${templateId}`)
    }

    const baseMetadata = cloneDeep(DEFAULT_CUSTOM_METADATA)
    const templateMetadata = cloneDeep(template.template)

    return {
      ...baseMetadata,
      ...templateMetadata,
      ...overrides,
    }
  }

  /**
   * 保存自定义模板
   */
  saveTemplate(template: Omit<MetadataTemplate, 'isBuiltIn'>): void {
    this.templates.set(template.id, { ...template, isBuiltIn: false })
  }

  /**
   * 获取所有模板
   */
  getTemplates(): MetadataTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 删除自定义模板
   */
  deleteTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId)
    if (!template || template.isBuiltIn) {
      return false
    }

    return this.templates.delete(templateId)
  }

  /**
   * 生成包文件名
   */
  generatePackFileName(metadata: CustomMetadata): string {
    const sanitizedName = metadata.name.replace(/[^a-z0-9_-]/g, '_')
    return `${sanitizedName}_v${(metadata.version || '1.0.0').replace(/\./g, '_')}`
  }

  /**
   * 自动填充元数据
   */
  autoFillMetadata(partial: Partial<CustomMetadata>): CustomMetadata {
    const metadata = { ...DEFAULT_CUSTOM_METADATA, ...partial }

    if (!metadata.name && metadata.displayName) {
      metadata.name = metadata.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    if (metadata.changelog.length === 0) {
      metadata.changelog.push({
        version: metadata.version || '1.0.0',
        date: new Date().toISOString().split('T')[0],
        changes: ['metadata.changelog.initialRelease'],
      })
    }

    if (!metadata.tags.includes('icons')) {
      metadata.tags.unshift('icons')
    }

    return metadata
  }

  // 私有方法
  private formatDescription(description: string, _displayName: string): string {
    if (description.length <= 256) {
      return description
    }

    return `${description.substring(0, 253)}...`
  }

  private initializeBuiltInTemplates(): void {
    // 初始化内置模板的实现
  }
}
