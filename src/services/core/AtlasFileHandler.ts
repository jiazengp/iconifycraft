/**
 * 图集文件处理器
 */
import type JSZip from 'jszip'
import type { AtlasResult } from '~/types/atlas'

export class AtlasFileHandler {
  /**
   * 添加图集文件到ZIP
   */
  async addAtlasFiles(
    zip: JSZip,
    atlasResult: AtlasResult,
    files: string[],
    fontName: string = 'minecraft:default',
  ): Promise<void> {
    const [namespace, fontFileName] = this.parseNamespace(fontName)

    // 优先使用FontGroups逻辑
    if (atlasResult.fontGroups && atlasResult.fontGroups.length > 0) {
      await this.addFontGroupAtlasFiles(zip, atlasResult, files, namespace)
    }
    else if (atlasResult.atlasBlobs && atlasResult.atlasBlobs.length > 1) {
      await this.addMultipleAtlasFiles(zip, atlasResult, files, namespace, fontFileName)
    }
    else {
      await this.addSingleAtlasFile(zip, atlasResult, files, namespace, fontFileName)
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
   * 添加FontGroup图集文件 (新逻辑)
   */
  private async addFontGroupAtlasFiles(
    zip: JSZip,
    atlasResult: AtlasResult,
    files: string[],
    namespace: string,
  ): Promise<void> {
    let blobIndex = 0

    for (const fontGroup of atlasResult.fontGroups!) {
      for (let atlasIndex = 0; atlasIndex < fontGroup.atlasGroups.length; atlasIndex++) {
        const atlasFileName = atlasIndex === 0 ? fontGroup.fontName : `${fontGroup.fontName}_${atlasIndex + 1}`
        const atlasPath = `assets/${namespace}/textures/font/${atlasFileName}.png`

        if (blobIndex < atlasResult.atlasBlobs!.length) {
          zip.file(atlasPath, atlasResult.atlasBlobs![blobIndex])
          files.push(atlasPath)
          blobIndex++
        }
      }
    }
  }

  /**
   * 添加多个图集文件 (旧逻辑，向后兼容)
   */
  private async addMultipleAtlasFiles(
    zip: JSZip,
    atlasResult: AtlasResult,
    files: string[],
    namespace: string,
    fontFileName: string,
  ): Promise<void> {
    for (let i = 0; i < atlasResult.atlasBlobs!.length; i++) {
      const group = atlasResult.atlasGroups?.[i]
      const atlasPath = `assets/${namespace}/textures/font/${group?.fontName || `${fontFileName}_${i + 1}`}.png`
      zip.file(atlasPath, atlasResult.atlasBlobs![i])
      files.push(atlasPath)
    }
  }

  /**
   * 添加单个图集文件
   */
  private async addSingleAtlasFile(
    zip: JSZip,
    atlasResult: AtlasResult,
    files: string[],
    namespace: string,
    fontFileName: string,
  ): Promise<void> {
    const atlasPath = `assets/${namespace}/textures/font/${fontFileName}.png`
    zip.file(atlasPath, atlasResult.atlasBlob)
    files.push(atlasPath)
  }
}
