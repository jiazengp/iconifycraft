import type { ParsedTexture } from '~/types/resource-pack'

export class AtlasTextureProcessor {
  /**
   * 合并材质，处理重复和覆盖
   */
  static mergeTextures(textures: ParsedTexture[]): {
    merged: ParsedTexture[]
    conflicts: string[]
    packStats: Record<string, { used: number, overridden: number }>
  } {
    const mergedTextures = new Map<string, ParsedTexture>()
    const conflicts: string[] = []
    const packStats: Record<string, { used: number, overridden: number }> = {}

    // 初始化统计
    for (const texture of textures) {
      const packName = texture.sourcePack || 'unknown'
      if (!packStats[packName]) {
        packStats[packName] = { used: 0, overridden: 0 }
      }
    }

    for (const texture of textures) {
      const textureKey = `${texture.namespace}:${texture.category}/${texture.path}`
      const packName = texture.sourcePack || 'unknown'

      if (mergedTextures.has(textureKey)) {
        // 已存在相同材质，前面的资源包优先级更高，跳过后来的
        const existing = mergedTextures.get(textureKey)!
        const existingPack = existing.sourcePack || 'unknown'

        // 记录冲突：当前材质被已有材质覆盖
        conflicts.push(`${textureKey}: ${packName} 被 ${existingPack} 覆盖`)

        // 更新统计：当前包的材质被覆盖，已有包保持使用状态
        packStats[packName].overridden++
        // 注意：不修改existing pack的used计数，因为它仍在使用中
      }
      else {
        // 新材质，直接使用
        mergedTextures.set(textureKey, texture)
        packStats[packName].used++
      }
    }

    return {
      merged: Array.from(mergedTextures.values()),
      conflicts,
      packStats,
    }
  }

  /**
   * 计算图集布局
   */
  static calculateLayout(textureCount: number): {
    texturesPerRow: number
    totalRows: number
    atlasSize: number
  } {
    const texturesPerRow = Math.ceil(Math.sqrt(textureCount))
    const totalRows = Math.ceil(textureCount / texturesPerRow)
    const atlasSize = Math.max(texturesPerRow * 16, totalRows * 16) // 假设材质大小为16px

    return {
      texturesPerRow,
      totalRows,
      atlasSize,
    }
  }

  /**
   * 分割材质为多个图集组
   */
  static splitIntoAtlasGroups(textures: ParsedTexture[], maxTexturesPerAtlas: number = 256): ParsedTexture[][] {
    const groups: ParsedTexture[][] = []

    for (let i = 0; i < textures.length; i += maxTexturesPerAtlas) {
      groups.push(textures.slice(i, i + maxTexturesPerAtlas))
    }

    return groups
  }

  /**
   * 生成材质统计信息
   */
  static generateStatistics(
    textures: ParsedTexture[],
    packStats?: Record<string, { used: number, overridden: number }>,
  ): {
    byNamespace: Record<string, number>
    byCategory: Record<string, number>
    byPack?: Record<string, { used: number, overridden: number, percentage: number }>
  } {
    const byNamespace: Record<string, number> = {}
    const byCategory: Record<string, number> = {}

    for (const texture of textures) {
      byNamespace[texture.namespace] = (byNamespace[texture.namespace] || 0) + 1
      byCategory[texture.category] = (byCategory[texture.category] || 0) + 1
    }

    const result = { byNamespace, byCategory }

    // 添加资源包统计（包含百分比）
    if (packStats) {
      const totalTextures = textures.length
      const byPack: Record<string, { used: number, overridden: number, percentage: number }> = {}

      for (const [packName, stats] of Object.entries(packStats)) {
        if (stats.used > 0) {
          byPack[packName] = {
            used: stats.used,
            overridden: stats.overridden,
            percentage: totalTextures > 0 ? Math.round((stats.used / totalTextures) * 100) : 0,
          }
        }
      }

      return { ...result, byPack }
    }

    return result
  }
}
