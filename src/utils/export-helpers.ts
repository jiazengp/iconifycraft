import type { AtlasResult } from '~/types/atlas'
import type { CustomMetadata } from '~/types/metadata'

export class ExportHelpers {
  /**
   * 估算导出文件大小
   */
  static estimateExportSize(options: {
    includeAtlas: boolean
    includeTranslations: boolean
    generateReadme: boolean
    generateChangelog: boolean
    atlasBlob?: Blob
    translationsData?: Record<string, Record<string, string>>
  }): number {
    let size = 1024 // 基础文件大小 (pack.mcmeta等)

    if (options.includeAtlas && options.atlasBlob) {
      size += options.atlasBlob.size
    }

    if (options.includeTranslations && options.translationsData) {
      const translationJson = JSON.stringify(options.translationsData)
      size += new Blob([translationJson]).size
    }

    if (options.generateReadme) {
      size += 2048 // 估算README大小
    }

    if (options.generateChangelog) {
      size += 1024 // 估算CHANGELOG大小
    }

    return size
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024)
      return `${bytes} B`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /**
   * 生成导出摘要
   */
  static generateExportSummary(options: {
    includeAtlas: boolean
    includeFont: boolean
    includeTranslations: boolean
    generateReadme: boolean
    generateChangelog: boolean
    totalTextures?: number
    languageCount?: number
  }): string[] {
    const items: string[] = []

    if (options.includeAtlas && options.totalTextures) {
      items.push(`export.summary.atlas`)
    }

    if (options.includeFont) {
      items.push('export.summary.font')
    }

    if (options.includeTranslations && options.languageCount) {
      items.push(`export.summary.translations`)
    }

    if (options.generateReadme) {
      items.push('export.summary.readme')
    }

    if (options.generateChangelog) {
      items.push('export.summary.changelog')
    }

    return items
  }

  /**
   * 生成README内容
   */
  static generateReadmeContent(metadata: CustomMetadata, atlasResult?: AtlasResult): string {
    const lines: string[] = []

    lines.push(`# ${metadata.displayName}`)
    lines.push('')
    lines.push(metadata.description)
    lines.push('')

    lines.push('## Basic Information')
    lines.push('')
    lines.push(`- **Version**: ${metadata.version}`)
    lines.push(`- **Author**: ${metadata.author}`)
    lines.push(`- **Category**: ${metadata.category}`)

    if (atlasResult) {
      lines.push('')
      lines.push('## Atlas Information')
      lines.push('')
      lines.push(`- **Texture Count**: ${atlasResult.metadata.totalTextures}`)
      lines.push(`- **Atlas Size**: ${atlasResult.metadata.atlasSize}x${atlasResult.metadata.atlasSize}`)
    }

    return lines.join('\n')
  }

  /**
   * 生成更新日志内容
   */
  static generateChangelogContent(metadata: CustomMetadata): string {
    const lines: string[] = []

    lines.push(`# ${metadata.displayName} - Changelog`)
    lines.push('')

    for (const entry of metadata.changelog) {
      lines.push(`## [${entry.version}] - ${entry.date}`)
      lines.push('')

      for (const change of entry.changes) {
        lines.push(`- ${change}`)
      }
      lines.push('')
    }

    return lines.join('\n')
  }

  /**
   * 下载文件
   */
  static downloadFile(blob: Blob, filename: string): void {
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}
