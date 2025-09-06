/**
 * pack.mcmeta生成器
 */
import type { CustomMetadata, PackMetadata } from '~/types/metadata'
import type { MinecraftVersion } from '~/types/minecraft'
import { getPackFormatForVersion } from '~/utils/pack-format'

export class PackMetaGenerator {
  /**
   * 生成pack.mcmeta内容
   */
  generate(metadata: CustomMetadata, version: MinecraftVersion, supportedFormats?: string, allowedIncompatible?: boolean): string {
    const packMeta: PackMetadata = {
      pack: {
        pack_format: metadata.compatibility.packFormat || version.packFormat,
        description: this.formatDescription(metadata.description),
      },
    }

    // 处理支持的格式设置
    if (supportedFormats && supportedFormats !== 'none') {
      packMeta.pack.supported_formats = this.parseSupportedFormats(supportedFormats)
    }
    else if (metadata.compatibility.maxVersion) {
      // 兜底逻辑：如果有最大版本，使用版本范围
      packMeta.pack.supported_formats = {
        min_inclusive: metadata.compatibility.packFormat || version.packFormat,
        max_inclusive: getPackFormatForVersion(metadata.compatibility.maxVersion),
      }
    }

    // 如果允许不兼容版本，添加过滤器
    if (allowedIncompatible && packMeta.pack.supported_formats) {
      packMeta.pack.filter = {
        block: [],
      }
    }

    return JSON.stringify(packMeta, null, 2)
  }

  /**
   * 解析支持的格式字符串
   */
  private parseSupportedFormats(supportedFormats: string): number[] | { min_inclusive: number, max_inclusive: number } | number | string {
    try {
      // 尝试解析为数组格式 [15, 18, 22]
      if (supportedFormats.startsWith('[') && supportedFormats.endsWith(']')) {
        return JSON.parse(supportedFormats)
      }

      // 尝试解析为范围格式 {min_inclusive:15,max_inclusive:46}
      if (supportedFormats.startsWith('{') && supportedFormats.endsWith('}')) {
        return JSON.parse(supportedFormats)
      }

      // 如果是单个数字
      const singleFormat = Number.parseInt(supportedFormats, 10)
      if (!Number.isNaN(singleFormat)) {
        return singleFormat
      }

      // 默认返回原始字符串
      return supportedFormats
    }
    catch {
      // 解析失败，返回原始字符串
      return supportedFormats
    }
  }

  /**
   * 格式化描述文本
   */
  private formatDescription(description: string | undefined): string {
    if (!description) {
      return 'IconifyCraft Resource Pack'
    }

    if (description.length <= 256) {
      return description
    }

    return `${description.substring(0, 253)}...`
  }
}
