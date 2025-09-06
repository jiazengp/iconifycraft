/**
 * 元数据格式导出器
 */
import type { CustomMetadata } from '~/types/metadata'

export class MetadataExporters {
  /**
   * 导出为McMenu格式
   */
  exportAsMcmeta(metadata: CustomMetadata, minify: boolean): string {
    const packMeta = {
      pack: {
        pack_format: metadata.compatibility.packFormat,
        description: this.formatDescription(metadata.description, metadata.displayName),
      },
    }

    return minify ? JSON.stringify(packMeta) : JSON.stringify(packMeta, null, 2)
  }

  /**
   * 导出为JSON格式
   */
  exportAsJson(metadata: CustomMetadata, includeCustomFields: boolean, minify: boolean): string {
    const exportData = includeCustomFields
      ? metadata
      : {
          name: metadata.name,
          displayName: metadata.displayName,
          description: metadata.description,
          version: metadata.version,
          author: metadata.author,
        }

    return minify ? JSON.stringify(exportData) : JSON.stringify(exportData, null, 2)
  }

  /**
   * 导出为YAML格式
   */
  exportAsYaml(metadata: CustomMetadata, includeCustomFields: boolean): string {
    const data = includeCustomFields
      ? metadata
      : {
          name: metadata.name,
          displayName: metadata.displayName,
          description: metadata.description,
          version: metadata.version,
          author: metadata.author,
        }

    return this.objectToYaml(data)
  }

  /**
   * 导出为TOML格式
   */
  exportAsToml(metadata: CustomMetadata, includeCustomFields: boolean): string {
    const data = includeCustomFields
      ? metadata
      : {
          name: metadata.name,
          displayName: metadata.displayName,
          description: metadata.description,
          version: metadata.version,
          author: metadata.author,
        }

    return this.objectToToml(data)
  }

  /**
   * 格式化描述
   */
  private formatDescription(description: string, _displayName: string): string {
    if (description.length <= 256) {
      return description
    }

    return `${description.substring(0, 253)}...`
  }

  /**
   * 对象转YAML
   */
  private objectToYaml(obj: Record<string, unknown>, indent = 0): string {
    const spaces = ' '.repeat(indent)
    let result = ''

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result += `${spaces}${key}:\n${this.objectToYaml(value as Record<string, unknown>, indent + 2)}`
      }
      else if (Array.isArray(value)) {
        result += `${spaces}${key}:\n`
        for (const item of value) {
          result += `${spaces}  - ${JSON.stringify(item)}\n`
        }
      }
      else {
        result += `${spaces}${key}: ${JSON.stringify(value)}\n`
      }
    }

    return result
  }

  /**
   * 对象转TOML
   */
  private objectToToml(obj: Record<string, unknown>): string {
    let result = ''

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result += `${key} = "${value}"\n`
      }
      else if (typeof value === 'number') {
        result += `${key} = ${value}\n`
      }
      else if (Array.isArray(value)) {
        result += `${key} = [${value.map(v => JSON.stringify(v)).join(', ')}]\n`
      }
    }

    return result
  }
}
