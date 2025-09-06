/**
 * Minecraft版本管理组合式函数
 */

import type { TextureCompatibility } from '~/types/minecraft'
import { computed, readonly, ref } from 'vue'
import { useMinecraftStore } from '~/stores/minecraft'
import { useResourcePackStore } from '~/stores/resource-pack'

interface ValidationResults {
  compatible: string[]
  incompatible: Array<{ id: string, reason: string }>
}

export function useMinecraft() {
  const minecraftStore = useMinecraftStore()
  const packStore = useResourcePackStore()

  // 本地状态
  const isValidating = ref(false)
  const validationResults = ref<ValidationResults | null>(null)

  // 计算属性
  const selectedVersion = computed(() => minecraftStore.selectedVersion)
  const supportedVersions = computed(() => minecraftStore.supportedVersions)
  const currentVersionInfo = computed(() => minecraftStore.currentVersionInfo)
  const isRecommendedVersion = computed(() => minecraftStore.isRecommendedVersion)

  const compatibilityRate = computed(() => {
    if (!validationResults.value)
      return 0
    const { compatible, incompatible } = validationResults.value
    const total = compatible.length + incompatible.length
    return total > 0 ? (compatible.length / total) * 100 : 0
  })

  // 方法
  const setVersion = (versionId: string): boolean => {
    return minecraftStore.setSelectedVersion(versionId)
  }

  const checkTextureCompatibility = (textureId: string, version?: string): TextureCompatibility => {
    return minecraftStore.checkCompatibility(textureId, version)
  }

  const validateTextures = async (textureIds: string[], _version?: string) => {
    isValidating.value = true
    try {
      const result = await minecraftStore.validateTextures(textureIds)

      validationResults.value = result
      return result
    }
    finally {
      isValidating.value = false
    }
  }

  const getCompatibleTextures = () => {
    const allTextures = packStore.allTextures
    return allTextures.filter(texture =>
      checkTextureCompatibility(texture.id).isCompatible,
    )
  }

  const getIncompatibleTextures = () => {
    const allTextures = packStore.allTextures
    return allTextures.filter(texture =>
      !checkTextureCompatibility(texture.id).isCompatible,
    ).map(texture => ({
      texture,
      compatibility: checkTextureCompatibility(texture.id),
    }))
  }

  const getVersionsByPackFormat = (packFormat: number) => {
    return minecraftStore.getVersionsByPackFormat(packFormat)
  }

  const getCompatibilityStats = () => {
    const allTextures = packStore.allTextures
    const compatible = getCompatibleTextures()
    const incompatible = getIncompatibleTextures()

    const statsByNamespace = new Map<string, { compatible: number, total: number }>()
    const statsByCategory = new Map<string, { compatible: number, total: number }>()

    for (const texture of allTextures) {
      // 按命名空间统计
      if (!statsByNamespace.has(texture.namespace)) {
        statsByNamespace.set(texture.namespace, { compatible: 0, total: 0 })
      }
      const nsStats = statsByNamespace.get(texture.namespace)!
      nsStats.total++
      if (checkTextureCompatibility(texture.id).isCompatible) {
        nsStats.compatible++
      }

      // 按类别统计
      if (!statsByCategory.has(texture.category)) {
        statsByCategory.set(texture.category, { compatible: 0, total: 0 })
      }
      const catStats = statsByCategory.get(texture.category)!
      catStats.total++
      if (checkTextureCompatibility(texture.id).isCompatible) {
        catStats.compatible++
      }
    }

    return {
      total: allTextures.length,
      compatible: compatible.length,
      incompatible: incompatible.length,
      compatibilityRate: compatibilityRate.value,
      byNamespace: Object.fromEntries(statsByNamespace),
      byCategory: Object.fromEntries(statsByCategory),
      details: {
        compatible: compatible.map(t => t.id),
        incompatible: incompatible.map(i => ({
          textureId: i.texture.id,
          reason: i.compatibility.reason,
          addedIn: i.compatibility.addedIn,
          removedIn: i.compatibility.removedIn,
        })),
      },
    }
  }

  const clearValidationResults = () => {
    validationResults.value = null
    minecraftStore.clearCompatibilityCache()
  }

  const getVersionRecommendation = (textures: string[]) => {
    const compatibilityByVersion = new Map<string, number>()

    for (const version of supportedVersions.value) {
      let compatibleCount = 0
      for (const textureId of textures) {
        if (minecraftStore.checkCompatibility(textureId, version.id).isCompatible) {
          compatibleCount++
        }
      }
      compatibilityByVersion.set(version.id, compatibleCount)
    }

    // 找到兼容性最高的版本
    let bestVersion = ''
    let maxCompatible = 0

    for (const [versionId, compatibleCount] of compatibilityByVersion) {
      if (compatibleCount > maxCompatible) {
        maxCompatible = compatibleCount
        bestVersion = versionId
      }
    }

    return {
      recommendedVersion: bestVersion,
      compatibilityRate: (maxCompatible / textures.length) * 100,
      details: Object.fromEntries(compatibilityByVersion),
    }
  }

  return {
    // 状态
    isValidating: readonly(isValidating),
    validationResults: readonly(validationResults),

    // 计算属性
    selectedVersion,
    supportedVersions,
    currentVersionInfo,
    isRecommendedVersion,
    compatibilityRate,

    // 方法
    setVersion,
    checkTextureCompatibility,
    validateTextures,
    getCompatibleTextures,
    getIncompatibleTextures,
    getVersionsByPackFormat,
    getCompatibilityStats,
    clearValidationResults,
    getVersionRecommendation,
  }
}
