/**
 * 材质包导出服务
 * 协调各个生成器完成材质包导出
 */

import type { TranslationFiles } from '../generators/TranslationGenerator'
import type { AtlasResult } from '~/types/atlas'
import type { CustomMetadata } from '~/types/metadata'
import type { MinecraftVersion } from '~/types/minecraft'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { generateTimestampFilename } from '~/utils/filename'
import { createPackIcon } from '~/utils/image'
import { DocumentationGenerator } from '../generators/DocumentationGenerator'
import { PackMetaGenerator } from '../generators/PackMetaGenerator'
import { TranslationGenerator } from '../generators/TranslationGenerator'
import { AtlasFileHandler } from './AtlasFileHandler'
import { FontFileHandler } from './FontFileHandler'

export interface ExportOptions {
  includeAtlas: boolean
  includeFont: boolean
  includeTranslations: boolean
  includeSounds: boolean
  includeModels: boolean
  compressionLevel: number
  generateReadme: boolean
  generateChangelog: boolean
  supportedFormats?: string
  allowedIncompatible?: boolean
}

export interface ExportResult {
  blob: Blob
  size: number
  filename: string
  files: string[]
  checksum: string
  metadata: {
    generatedAt: Date
    totalFiles: number
    totalSize: number
    format: string
    version: string
    includedFeatures: string[]
  }
}

export class ExportService {
  private packMetaGenerator = new PackMetaGenerator()
  private docGenerator = new DocumentationGenerator()
  private translationGenerator = new TranslationGenerator()
  private atlasHandler = new AtlasFileHandler()
  private fontHandler = new FontFileHandler()

  /**
   * 导出完整材质包
   */
  async exportResourcePack(
    metadata: CustomMetadata,
    atlasResult: AtlasResult | null,
    translations: TranslationFiles,
    minecraftVersion: MinecraftVersion,
    options: ExportOptions,
    customIcon?: Uint8Array | null,
    fontName?: string,
    licenseFile?: File | null,
  ): Promise<ExportResult> {
    const zip = new JSZip()
    const files: string[] = []

    // 生成pack.mcmeta
    const packMcmeta = this.packMetaGenerator.generate(
      metadata,
      minecraftVersion,
      options.supportedFormats,
      options.allowedIncompatible,
    )
    zip.file('pack.mcmeta', packMcmeta)
    files.push('pack.mcmeta')

    // 添加图集文件
    if (options.includeAtlas && atlasResult) {
      await this.atlasHandler.addAtlasFiles(zip, atlasResult, files, fontName)
    }

    // 添加字体文件
    if (options.includeFont && atlasResult) {
      await this.fontHandler.addFontFiles(zip, atlasResult, files, fontName)
    }

    // 添加翻译文件
    if (options.includeTranslations && Object.keys(translations).length > 0) {
      const [namespace] = fontName?.includes(':') ? fontName.split(':', 2) : ['minecraft']
      this.addTranslationFiles(zip, translations, files, namespace)
    }

    // 添加文档文件
    if (options.generateReadme) {
      const readme = this.docGenerator.generateReadme(metadata, atlasResult)
      zip.file('README.md', readme)
      files.push('README.md')
    }

    if (options.generateChangelog && metadata.changelog.length > 0) {
      const changelog = this.docGenerator.generateChangelog(metadata)
      zip.file('CHANGELOG.md', changelog)
      files.push('CHANGELOG.md')
    }

    // 添加包图标
    await this.addPackIcon(zip, files, customIcon, atlasResult)

    // 添加许可证文件
    if (licenseFile) {
      zip.file('LICENSE.txt', licenseFile)
      files.push('LICENSE.txt')
    }

    // 生成ZIP文件
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: options.compressionLevel },
    })

    // 生成checksum (使用 SHA-1 而不是 SHA-256)
    const checksum = await this.generateSHA1(blob)

    // 如果需要 README，重新生成包含 SHA1 的版本
    if (options.generateReadme) {
      const readmeWithSha1 = this.docGenerator.generateReadme(metadata, atlasResult, checksum)
      zip.file('README.md', readmeWithSha1)
    }

    // 重新生成 ZIP 文件（包含更新的 README）
    const finalBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: options.compressionLevel },
    })

    // 重新计算最终的 checksum
    const finalChecksum = await this.generateSHA1(finalBlob)

    return {
      blob: finalBlob,
      size: finalBlob.size,
      filename: generateTimestampFilename(metadata, finalChecksum),
      files,
      checksum: finalChecksum,
      metadata: {
        generatedAt: new Date(),
        totalFiles: files.length,
        totalSize: finalBlob.size,
        format: 'resource_pack',
        version: metadata.version || '1.0.0',
        includedFeatures: this.getIncludedFeatures(options),
      },
    }
  }

  /**
   * 导出预览数据
   */
  async exportPreviewData(
    atlasResult: AtlasResult,
    translations: TranslationFiles,
  ): Promise<{
    atlasUrl: string
    atlasDict: Record<string, any>
    translations: TranslationFiles
  }> {
    return {
      atlasUrl: URL.createObjectURL(atlasResult.atlasBlob),
      atlasDict: atlasResult.atlasDict,
      translations,
    }
  }

  /**
   * 导出单个文件
   */
  async exportSingleFile(
    filename: string,
    content: string | Blob,
    mimeType: string = 'text/plain',
  ): Promise<void> {
    const blob = content instanceof Blob
      ? content
      : new Blob([content], { type: mimeType })

    FileSaver.saveAs(blob, filename)
  }

  /**
   * 添加翻译文件
   */
  private addTranslationFiles(
    zip: JSZip,
    translations: TranslationFiles,
    files: string[],
    namespace: string = 'minecraft',
  ): void {
    const translationFiles = this.translationGenerator.generate(translations, namespace)

    for (const file of translationFiles) {
      zip.file(file.path, file.content)
      files.push(file.path)
    }
  }

  /**
   * 添加包图标
   */
  private async addPackIcon(
    zip: JSZip,
    files: string[],
    customIcon?: Uint8Array | null,
    atlasResult?: AtlasResult | null,
  ): Promise<void> {
    if (customIcon) {
      zip.file('pack.png', customIcon)
      files.push('pack.png')
    }
    else if (atlasResult) {
      const iconBlob = await createPackIcon(atlasResult.atlasBlob)
      if (iconBlob) {
        zip.file('pack.png', iconBlob)
        files.push('pack.png')
      }
    }
  }

  /**
   * 生成指定类型的文件内容
   */
  async generateFileContent(type: string, metadata: CustomMetadata, atlasResult: AtlasResult | null): Promise<string> {
    switch (type) {
      case 'README':
        return this.docGenerator.generateReadme(metadata, atlasResult)
      case 'CHANGELOG':
        return this.docGenerator.generateChangelog(metadata)
      default:
        throw new Error(`Unsupported file type: ${type}`)
    }
  }

  /**
   * 获取默认文件名
   */
  getDefaultFilename(type: string): string {
    switch (type) {
      case 'README':
        return 'README.md'
      case 'CHANGELOG':
        return 'CHANGELOG.md'
      default:
        return `${type.toLowerCase()}.txt`
    }
  }

  /**
   * 获取MIME类型
   */
  getMimeType(type: string): string {
    switch (type) {
      case 'README':
      case 'CHANGELOG':
        return 'text/markdown'
      default:
        return 'text/plain'
    }
  }

  /**
   * 生成 SHA-1 hash
   */
  private async generateSHA1(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 获取包含的功能列表
   */
  private getIncludedFeatures(options: ExportOptions): string[] {
    const features: string[] = []
    if (options.includeAtlas)
      features.push('atlas')
    if (options.includeFont)
      features.push('font')
    if (options.includeTranslations)
      features.push('translations')
    if (options.generateReadme)
      features.push('readme')
    if (options.generateChangelog)
      features.push('changelog')
    return features
  }
}
