/**
 * Minecraft版本管理服务
 * 负责版本兼容性检查和材质过滤
 */

import type {
  MinecraftVersion,
  TextureAvailability,
  TextureCompatibility,
} from '~/types/minecraft'
import type { ParsedTexture } from '~/types/resource-pack'
import { memoize } from 'lodash-es'
import { MC_VERSIONS } from '~/types/minecraft'

export class MinecraftService {
  private readonly versionCache = new Map<string, MinecraftVersion>()
  private readonly compatibilityCache = new Map<string, TextureCompatibility>()

  /**
   * 获取支持的MC版本列表（按发布日期排序）
   */
  getSupportedVersions(): MinecraftVersion[] {
    return MC_VERSIONS.sort((a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
    )
  }

  /**
   * 获取特定版本信息
   */
  getVersionInfo(versionId: string): MinecraftVersion | undefined {
    if (this.versionCache.has(versionId)) {
      return this.versionCache.get(versionId)
    }

    const version = MC_VERSIONS.find(v => v.id === versionId)
    if (version) {
      this.versionCache.set(versionId, version)
    }

    return version
  }

  /**
   * 检查材质在指定版本中的兼容性
   */
  checkTextureCompatibility = memoize((textureId: string, version: string): TextureCompatibility => {
    const cacheKey = `${textureId}:${version}`

    if (this.compatibilityCache.has(cacheKey)) {
      return this.compatibilityCache.get(cacheKey)!
    }

    const versionData = this.getVersionInfo(version)
    if (!versionData) {
      const result = { isCompatible: false, reason: 'version.unknown' }
      this.compatibilityCache.set(cacheKey, result)
      return result
    }

    const availability = this.getTextureAvailability(textureId)

    // 检查材质是否在版本中添加
    if (availability.addedIn && this.compareVersions(version, availability.addedIn) < 0) {
      const result = {
        isCompatible: false,
        reason: 'texture.notAvailable',
        addedIn: availability.addedIn,
      }
      this.compatibilityCache.set(cacheKey, result)
      return result
    }

    // 检查材质是否在版本中移除
    if (availability.removedIn && this.compareVersions(version, availability.removedIn) >= 0) {
      const result = {
        isCompatible: false,
        reason: 'texture.removed',
        removedIn: availability.removedIn,
      }
      this.compatibilityCache.set(cacheKey, result)
      return result
    }

    const result = { isCompatible: true }
    this.compatibilityCache.set(cacheKey, result)
    return result
  }, (textureId: string, version: string) => `${textureId}:${version}`)

  /**
   * 过滤指定版本兼容的材质
   */
  filterCompatibleTextures(textures: ParsedTexture[], version: string): ParsedTexture[] {
    return textures.filter(texture =>
      this.checkTextureCompatibility(texture.id, version).isCompatible,
    )
  }

  /**
   * 获取材质的可用性信息
   */
  private getTextureAvailability(textureId: string): TextureAvailability {
    const availability: TextureAvailability = { textureId }

    // 查找所有版本中的材质变更
    for (const version of MC_VERSIONS) {
      const changes = version.textureChanges.filter(change =>
        change.texture === textureId,
      )

      for (const change of changes) {
        switch (change.changeType) {
          case 'added':
            if (!availability.addedIn || this.compareVersions(change.fromVersion!, availability.addedIn) < 0) {
              availability.addedIn = change.fromVersion
            }
            break
          case 'removed':
            if (!availability.removedIn || this.compareVersions(change.toVersion!, availability.removedIn) > 0) {
              availability.removedIn = change.toVersion
            }
            break
          case 'renamed':
            if (change.oldPath === textureId) {
              availability.renamedTo = change.newPath
            }
            else if (change.newPath === textureId) {
              availability.renamedFrom = change.oldPath
            }
            break
        }
      }
    }

    return availability
  }

  /**
   * 语义化版本比较
   * 返回值: -1 (a < b), 0 (a = b), 1 (a > b)
   */
  private compareVersions(a: string, b: string): number {
    const parseVersion = (v: string) => {
      const parts = v.split('.').map(n => Number.parseInt(n, 10) || 0)
      return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0,
      }
    }

    const versionA = parseVersion(a)
    const versionB = parseVersion(b)

    if (versionA.major !== versionB.major) {
      return versionA.major - versionB.major
    }

    if (versionA.minor !== versionB.minor) {
      return versionA.minor - versionB.minor
    }

    return versionA.patch - versionB.patch
  }

  /**
   * 获取版本兼容性统计
   */
  getCompatibilityStats(textures: ParsedTexture[], version: string) {
    const stats = {
      total: textures.length,
      compatible: 0,
      incompatible: 0,
      missing: 0,
      details: [] as Array<{
        textureId: string
        status: 'compatible' | 'incompatible' | 'missing'
        reason?: string
      }>,
    }

    for (const texture of textures) {
      const compatibility = this.checkTextureCompatibility(texture.id, version)

      if (compatibility.isCompatible) {
        stats.compatible++
        stats.details.push({
          textureId: texture.id,
          status: 'compatible',
        })
      }
      else {
        stats.incompatible++
        stats.details.push({
          textureId: texture.id,
          status: 'incompatible',
          reason: compatibility.reason,
        })
      }
    }

    return stats
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.versionCache.clear()
    this.compatibilityCache.clear()
  }

  /**
   * 获取推荐版本（最新稳定版）
   */
  getRecommendedVersion(): MinecraftVersion {
    const stableVersions = MC_VERSIONS.filter(v => !v.isSnapshot)
    return stableVersions.sort((a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
    )[0]
  }
}
