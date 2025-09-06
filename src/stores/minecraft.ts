/**
 * Minecraft版本状态管理
 */

import type { MinecraftVersion, TextureCompatibility } from '~/types/minecraft'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { MinecraftService } from '~/services/core/MinecraftService'

export const useMinecraftStore = defineStore('minecraft', () => {
  // 服务实例
  const minecraftService = new MinecraftService()

  // 响应式状态
  const selectedVersion = ref<string | null>(null)
  const compatibilityCache = ref(new Map<string, TextureCompatibility>())
  const isValidating = ref(false)

  // 计算属性
  const supportedVersions = computed(() =>
    minecraftService.getSupportedVersions(),
  )

  const currentVersionInfo = computed(() =>
    selectedVersion.value ? minecraftService.getVersionInfo(selectedVersion.value) : null,
  )

  const recommendedVersion = computed(() =>
    minecraftService.getRecommendedVersion(),
  )

  const isRecommendedVersion = computed(() =>
    selectedVersion.value ? selectedVersion.value === recommendedVersion.value.id : false,
  )

  // 方法
  const clearCompatibilityCache = (): void => {
    compatibilityCache.value.clear()
    minecraftService.clearCache()
  }

  const setSelectedVersion = (versionId: string | null): boolean => {
    if (!versionId) {
      selectedVersion.value = null
      clearCompatibilityCache()
      return true
    }

    const version = minecraftService.getVersionInfo(versionId)
    if (version) {
      selectedVersion.value = versionId
      clearCompatibilityCache()
      return true
    }
    return false
  }

  const checkCompatibility = (textureId: string, version?: string): TextureCompatibility => {
    const targetVersion = version || selectedVersion.value || ''
    const cacheKey = `${textureId}:${targetVersion}`

    if (compatibilityCache.value.has(cacheKey)) {
      return compatibilityCache.value.get(cacheKey)!
    }

    const result = minecraftService.checkTextureCompatibility(textureId, targetVersion)
    compatibilityCache.value.set(cacheKey, result)

    return result
  }

  const validateTextures = async (textureIds: string[]): Promise<{
    compatible: string[]
    incompatible: Array<{ id: string, reason: string }>
  }> => {
    isValidating.value = true

    try {
      const compatible: string[] = []
      const incompatible: Array<{ id: string, reason: string }> = []

      for (const textureId of textureIds) {
        const compatibility = checkCompatibility(textureId)

        if (compatibility.isCompatible) {
          compatible.push(textureId)
        }
        else {
          incompatible.push({
            id: textureId,
            reason: compatibility.reason || 'unknown',
          })
        }
      }

      return { compatible, incompatible }
    }
    finally {
      isValidating.value = false
    }
  }

  const getVersionsByPackFormat = (packFormat: number): MinecraftVersion[] => {
    return supportedVersions.value.filter(v => v.packFormat === packFormat)
  }

  const getCompatibleVersions = (textureId: string): MinecraftVersion[] => {
    return supportedVersions.value.filter(version =>
      minecraftService.checkTextureCompatibility(textureId, version.id).isCompatible,
    )
  }

  const compareVersions = (versionA: string, versionB: string): number => {
    const vA = minecraftService.getVersionInfo(versionA)
    const vB = minecraftService.getVersionInfo(versionB)

    if (!vA || !vB)
      return 0

    return new Date(vB.releaseDate).getTime() - new Date(vA.releaseDate).getTime()
  }

  const getVersionStats = () => {
    const total = supportedVersions.value.length
    const snapshots = supportedVersions.value.filter(v => v.isSnapshot).length
    const releases = total - snapshots

    const byYear = supportedVersions.value.reduce((acc, version) => {
      const year = new Date(version.releaseDate).getFullYear()
      acc[year] = (acc[year] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return {
      total,
      releases,
      snapshots,
      byYear,
      oldest: supportedVersions.value[supportedVersions.value.length - 1],
      newest: supportedVersions.value[0],
    }
  }

  const isVersionSupported = (versionId: string): boolean => {
    return supportedVersions.value.some(v => v.id === versionId)
  }

  const getVersionPackFormat = (versionId: string): number | undefined => {
    return minecraftService.getVersionInfo(versionId)?.packFormat
  }

  // 返回公共API
  return {
    // 状态
    selectedVersion,
    isValidating: readonly(isValidating),

    // 计算属性
    supportedVersions,
    currentVersionInfo,
    recommendedVersion,
    isRecommendedVersion,

    // 方法
    setSelectedVersion,
    checkCompatibility,
    validateTextures,
    getVersionsByPackFormat,
    getCompatibleVersions,
    compareVersions,
    clearCompatibilityCache,
    getVersionStats,
    isVersionSupported,
    getVersionPackFormat,
  }
})
