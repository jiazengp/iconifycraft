/**
 * 字体文件处理器
 */
import type JSZip from 'jszip'
import type { AtlasResult } from '~/types/atlas'
import { FontFileGenerator } from '../generators/FontFileGenerator'

export class FontFileHandler {
  private fontGenerator = new FontFileGenerator()

  /**
   * 添加字体文件到ZIP
   */
  async addFontFiles(
    zip: JSZip,
    atlasResult: AtlasResult,
    files: string[],
    fontName: string = 'minecraft:default',
  ): Promise<void> {
    const [namespace, fontFileName] = this.parseNamespace(fontName)

    // 优先使用新的FontGroups逻辑
    if (atlasResult.fontGroups && atlasResult.fontGroups.length > 0) {
      await this.addFontGroupFiles(zip, atlasResult, files, namespace)
    }
    else if (atlasResult.atlasGroups && atlasResult.atlasGroups.length > 1) {
      await this.addMultipleFontFiles(zip, atlasResult, files, namespace)
    }
    else {
      await this.addSingleFontFile(zip, atlasResult, files, namespace, fontFileName)
    }
  }

  /**
   * 解析命名空间
   */
  private parseNamespace(fontName: string): [string, string] {
    return fontName.includes(':')
      ? fontName.split(':', 2) as [string, string]
      : ['minecraft', fontName]
  }

  /**
   * 添加FontGroup字体文件 (新逻辑)
   */
  private async addFontGroupFiles(
    zip: JSZip,
    atlasResult: AtlasResult,
    files: string[],
    namespace: string,
  ): Promise<void> {
    const fontFiles = this.fontGenerator.generateFromFontGroups(
      [...atlasResult.fontGroups!],
      namespace,
      atlasResult.metadata.tileSize,
    )

    for (const fontFile of fontFiles) {
      const fontPath = `assets/${namespace}/font/${fontFile.fontName}.json`
      zip.file(fontPath, fontFile.content)
      files.push(fontPath)
    }
  }

  /**
   * 添加多个字体文件 (旧逻辑，向后兼容)
   */
  private async addMultipleFontFiles(
    zip: JSZip,
    atlasResult: AtlasResult,
    files: string[],
    namespace: string,
  ): Promise<void> {
    const fontFiles = this.fontGenerator.generateMultiple(
      atlasResult.atlasGroups!,
      namespace,
      atlasResult.metadata.tileSize,
    )

    for (const fontFile of fontFiles) {
      const fontPath = `assets/${namespace}/font/${fontFile.fontName}.json`
      zip.file(fontPath, fontFile.content)
      files.push(fontPath)
    }
  }

  /**
   * 添加单个字体文件
   */
  private async addSingleFontFile(
    zip: JSZip,
    atlasResult: AtlasResult,
    files: string[],
    namespace: string,
    fontFileName: string,
  ): Promise<void> {
    const fontPath = `assets/${namespace}/font/${fontFileName}.json`
    const fontContent = this.fontGenerator.generateSingle(atlasResult, namespace, fontFileName)

    zip.file(fontPath, fontContent)
    files.push(fontPath)
  }
}
