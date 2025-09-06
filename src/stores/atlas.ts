/**
 * 图集生成状态管理
 */

import type { AtlasOptions, AtlasResult, TextureInfo } from '~/types/atlas'
import { useAsyncState, useStorage } from '@vueuse/core'
import { debounce } from 'lodash-es'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { AtlasService } from '~/services/core/AtlasService'
import { useMinecraftStore } from './minecraft'
import { useResourcePackStore } from './resource-pack'

export const useAtlasStore = defineStore('atlas', () => {
  // 服务实例
  const atlasService = new AtlasService()

  // 响应式状态
  const atlasResult = ref<AtlasResult | null>(null)
  const isGenerating = ref(false)
  const generationProgress = ref(0)
  const generationStage = ref<string>('')
  const errors = ref<string[]>([])

  // 持久化配置
  const atlasOptions = useStorage('mc-atlas-options', {
    size: 1024 as const,
    tileSize: 16 as const,
    padding: 0,
    backgroundColor: 'transparent',
    compression: 'lossless' as const,
    quality: 1.0,
  } satisfies AtlasOptions)

  // 依赖的Store
  const packStore = useResourcePackStore()
  const minecraftStore = useMinecraftStore()

  // 计算属性
  const hasAtlas = computed(() => atlasResult.value !== null)

  const atlasMetadata = computed(() => atlasResult.value?.metadata)

  const totalTextures = computed(() => {
    const compatibleTextures = packStore.allTextures.filter(texture =>
      minecraftStore.checkCompatibility(texture.id).isCompatible,
    )
    return compatibleTextures.length
  })

  const canGenerate = computed(() =>
    packStore.hasVanillaPack
    && totalTextures.value > 0
    && !isGenerating.value,
  )

  const atlasDict = computed(() => atlasResult.value?.atlasDict || {})

  const texturesByNamespace = computed(() => {
    const dict = atlasDict.value
    const byNamespace = new Map<string, TextureInfo[]>()

    for (const info of Object.values(dict)) {
      if (!byNamespace.has(info.namespace)) {
        byNamespace.set(info.namespace, [])
      }
      byNamespace.get(info.namespace)!.push(info)
    }

    return byNamespace
  })

  const texturesByCategory = computed(() => {
    const dict = atlasDict.value
    const byCategory = new Map<string, TextureInfo[]>()

    for (const info of Object.values(dict)) {
      if (!byCategory.has(info.category)) {
        byCategory.set(info.category, [])
      }
      byCategory.get(info.category)!.push(info)
    }

    return byCategory
  })

  const estimatedAtlasSize = computed(() => {
    const { size, tileSize } = atlasOptions.value
    const tilesPerRow = Math.floor(size / tileSize)
    const maxTextures = tilesPerRow * tilesPerRow

    return {
      maxTextures,
      currentTextures: totalTextures.value,
      utilizationRate: totalTextures.value / maxTextures,
      recommendedSize: getRecommendedSize(totalTextures.value, tileSize),
    }
  })

  // 异步生成图集
  const { execute: executeGeneration } = useAsyncState(
    async () => {
      if (!canGenerate.value) {
        throw new Error('atlas.cannotGenerate')
      }

      const compatibleTextures = packStore.allTextures.filter(texture =>
        minecraftStore.checkCompatibility(texture.id).isCompatible,
      )

      if (compatibleTextures.length === 0) {
        throw new Error('atlas.noCompatibleTextures')
      }

      // 验证图集配置
      validateAtlasOptions(atlasOptions.value, compatibleTextures.length)

      updateProgress(10, 'atlas.stage.preparing')

      // 排序材质（按命名空间和类别）
      const sortedTextures = sortTextures(compatibleTextures)

      updateProgress(20, 'atlas.stage.processing')

      // 生成图集
      const result = await atlasService.generateAtlas(sortedTextures, atlasOptions.value)

      updateProgress(100, 'atlas.stage.complete')

      return result
    },
    null,
    { immediate: false },
  )

  // Actions
  const generateAtlas = async (): Promise<AtlasResult> => {
    isGenerating.value = true
    errors.value = []
    generationProgress.value = 0

    try {
      const result = await executeGeneration()
      atlasResult.value = result!
      return result!
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'atlas.generation.failed'
      errors.value = [message]
      throw error
    }
    finally {
      isGenerating.value = false
      generationProgress.value = 0
      generationStage.value = ''
    }
  }

  const updateAtlasOptions = (newOptions: Partial<AtlasOptions>): void => {
    Object.assign(atlasOptions.value, newOptions)

    // 如果有现有图集，标记为需要重新生成
    if (atlasResult.value) {
      // 可以添加一个标记来表示配置已更改
    }
  }

  const clearAtlas = (): void => {
    atlasResult.value = null
    errors.value = []
    generationProgress.value = 0
    generationStage.value = ''
  }

  const getTextureInfo = (textureId: string): TextureInfo | undefined => {
    return atlasDict.value[textureId]
  }

  const searchTextures = (query: string): TextureInfo[] => {
    const dict = atlasDict.value
    const lowerQuery = query.toLowerCase()

    return Object.values(dict).filter(info =>
      info.name.toLowerCase().includes(lowerQuery)
      || info.namespace.toLowerCase().includes(lowerQuery)
      || info.translationKey.toLowerCase().includes(lowerQuery),
    )
  }

  const getUnicodeCharacter = (textureId: string): string => {
    const info = getTextureInfo(textureId)
    return info ? String.fromCharCode(Number.parseInt(info.unicode, 16)) : ''
  }

  const copyUnicodeToClipboard = async (textureId: string): Promise<void> => {
    const character = getUnicodeCharacter(textureId)
    if (character) {
      await navigator.clipboard.writeText(character)
    }
  }

  const copyEscapeSequence = async (textureId: string): Promise<void> => {
    const info = getTextureInfo(textureId)
    if (info) {
      const escapeSequence = `\\u${info.unicode}`
      await navigator.clipboard.writeText(escapeSequence)
    }
  }

  const exportAtlasAsImage = async (): Promise<void> => {
    if (!atlasResult.value)
      return

    const url = URL.createObjectURL(atlasResult.value.atlasBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `minecraft-atlas-${Date.now()}.png`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAtlasDictAsJson = async (): Promise<void> => {
    if (!atlasResult.value)
      return

    const jsonData = JSON.stringify(atlasResult.value.atlasDict, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `minecraft-atlas-dict-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 防抖的自动重新生成
  const debouncedRegenerate = debounce(() => {
    if (atlasResult.value && canGenerate.value) {
      generateAtlas()
    }
  }, 1000)

  // 工具函数
  function updateProgress(progress: number, stage: string): void {
    generationProgress.value = progress
    generationStage.value = stage
  }

  function validateAtlasOptions(options: AtlasOptions, textureCount: number): void {
    const { size, tileSize } = options
    const tilesPerRow = Math.floor(size / tileSize)
    const maxTextures = tilesPerRow * tilesPerRow

    if (textureCount > maxTextures) {
      throw new Error('atlas.tooManyTextures')
    }

    if (size < 64 || size > 4096) {
      throw new Error('atlas.invalidSize')
    }

    if (tileSize < 8 || tileSize > 128) {
      throw new Error('atlas.invalidTileSize')
    }

    if (size % tileSize !== 0) {
      throw new Error('atlas.incompatibleSizes')
    }
  }

  function sortTextures(textures: typeof packStore.allTextures) {
    return [...textures].sort((a, b) => {
      // 先按命名空间排序
      if (a.namespace !== b.namespace) {
        return a.namespace.localeCompare(b.namespace)
      }

      // 再按类别排序（block在前，item在后）
      if (a.category !== b.category) {
        return a.category === 'block' ? -1 : 1
      }

      // 最后按名称排序
      return a.path.localeCompare(b.path)
    })
  }

  function getRecommendedSize(textureCount: number, tileSize: number): number {
    const sizes = [256, 512, 1024, 2048, 4096]

    for (const size of sizes) {
      const tilesPerRow = Math.floor(size / tileSize)
      const capacity = tilesPerRow * tilesPerRow

      if (capacity >= textureCount * 1.2) { // 留20%余量
        return size
      }
    }

    return 4096 // 最大尺寸
  }

  return {
    // 状态
    atlasResult: readonly(atlasResult),
    isGenerating: readonly(isGenerating),
    generationProgress: readonly(generationProgress),
    generationStage: readonly(generationStage),
    errors: readonly(errors),
    atlasOptions,

    // 计算属性
    hasAtlas,
    atlasMetadata,
    totalTextures,
    canGenerate,
    atlasDict,
    texturesByNamespace,
    texturesByCategory,
    estimatedAtlasSize,

    // 方法
    generateAtlas,
    updateAtlasOptions,
    clearAtlas,
    getTextureInfo,
    searchTextures,
    getUnicodeCharacter,
    copyUnicodeToClipboard,
    copyEscapeSequence,
    exportAtlasAsImage,
    exportAtlasDictAsJson,
    debouncedRegenerate,
  }
})
