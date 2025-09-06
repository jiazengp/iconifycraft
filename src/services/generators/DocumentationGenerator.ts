import type { AtlasResult } from '~/types/atlas'
/**
 * 文档生成器 (README/CHANGELOG)
 */
import type { CustomMetadata } from '~/types/metadata'
import { compareVersions } from '~/utils/pack-format'

export class DocumentationGenerator {
  /**
   * 生成README内容
   */
  generateReadme(metadata: CustomMetadata, atlasResult: AtlasResult | null, sha1?: string): string {
    const lines: string[] = []
    const currentDate = new Date().toISOString().split('T')[0]

    lines.push(`# ${metadata.displayName}`)
    lines.push('')
    lines.push(metadata.description)
    lines.push('')

    // 生成信息
    lines.push('## Generation Info')
    lines.push('')
    lines.push(`- **Generated Date**: ${currentDate}`)
    lines.push(`- **Generator**: IconifyCraft`)
    lines.push(`- **Version**: ${metadata.version || '1.0.0'}`)
    if (sha1) {
      lines.push(`- **File SHA1**: \`${sha1}\``)
    }
    lines.push('')

    // 基本信息
    lines.push('## Basic Information')
    lines.push('')
    lines.push(`- **Pack Version**: ${metadata.version || '1.0.0'}`)
    lines.push(`- **Category**: ${metadata.category}`)
    lines.push(`- **Minecraft Compatibility**: ${metadata.compatibility.minVersion}${metadata.compatibility.maxVersion ? ` - ${metadata.compatibility.maxVersion}` : '+'}`)

    if (metadata.homepage) {
      lines.push(`- **Homepage**: ${metadata.homepage}`)
    }

    if (metadata.license) {
      lines.push(`- **License**: ${metadata.license}`)
    }
    lines.push('')

    // 功能特性
    if (metadata.features.length > 0) {
      lines.push('## Features')
      lines.push('')
      for (const feature of metadata.features) {
        lines.push(`- ${feature}`)
      }
      lines.push('')
    }

    // 图集信息
    if (atlasResult) {
      lines.push('## Atlas Information')
      lines.push('')
      lines.push(`- **Atlas Size**: ${atlasResult.metadata.atlasSize}x${atlasResult.metadata.atlasSize} pixels`)
      lines.push(`- **Texture Size**: ${atlasResult.metadata.tileSize}x${atlasResult.metadata.tileSize} pixels`)
      lines.push(`- **Total Textures**: ${atlasResult.metadata.totalTextures}`)
      lines.push(`- **Unicode Range**: U+${atlasResult.metadata.unicodeRange.start} - U+${atlasResult.metadata.unicodeRange.end}`)
      lines.push('')
    }

    // 使用说明
    lines.push('## How to Use')
    lines.push('')
    lines.push('1. **Install the Resource Pack**')
    lines.push('   - Download and place this resource pack ZIP file in your Minecraft `resourcepacks` folder')
    lines.push('   - Enable it in Minecraft\'s Resource Packs settings')
    lines.push('')
    lines.push('2. **Use Chat Icons**')
    lines.push('   - In chat, use the Unicode characters from the range above to display item/block icons')
    lines.push('   - Each character corresponds to a specific Minecraft texture')
    lines.push('')
    lines.push('3. **Font Integration**')
    lines.push('   - The pack includes bitmap font files that map Unicode characters to textures')
    lines.push('   - Icons will display automatically when using the correct Unicode characters')
    lines.push('')

    // 标签
    if (metadata.tags.length > 0) {
      lines.push('## Tags')
      lines.push('')
      lines.push(metadata.tags.map(tag => `\`${tag}\``).join(', '))
      lines.push('')
    }

    // 制作人员
    if (metadata.credits.length > 0) {
      lines.push('## Credits')
      lines.push('')
      for (const credit of metadata.credits) {
        lines.push(`- **${credit.name}** (${credit.role}): ${credit.contribution}`)
      }
      lines.push('')
    }

    // 版权信息
    lines.push('## Copyright & Legal')
    lines.push('')
    lines.push('This resource pack was generated using IconifyCraft.')
    lines.push('')
    lines.push('- **Minecraft** is a trademark of Mojang Studios')
    lines.push('- **Original Textures**: Property of Mojang Studios/Microsoft')
    lines.push('- **Resource Pack Structure**: Following Minecraft\'s resource pack format specifications')
    if (metadata.license) {
      lines.push(`- **Pack License**: ${metadata.license}`)
    }
    lines.push('')
    lines.push('This pack is intended for personal or educational use. Please respect Minecraft\'s Terms of Service and EULA.')

    return lines.join('\n')
  }

  /**
   * 生成CHANGELOG内容
   */
  generateChangelog(metadata: CustomMetadata): string {
    const lines: string[] = []

    lines.push(`# ${metadata.displayName} - Changelog`)
    lines.push('')
    lines.push('This document tracks all notable changes to this resource pack.')
    lines.push('')

    // 按版本倒序排列
    const sortedChangelog = [...metadata.changelog].sort((a, b) =>
      compareVersions(b.version, a.version),
    )

    for (const entry of sortedChangelog) {
      lines.push(`## [${entry.version}] - ${entry.date}`)
      lines.push('')

      for (const change of entry.changes) {
        lines.push(`- ${change}`)
      }
      lines.push('')
    }

    return lines.join('\n')
  }
}
