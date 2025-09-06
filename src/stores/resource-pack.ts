import type { PackInheritance, ResourcePack, UploadProgress } from '~/types/resource-pack'
import { useAsyncState, useStorage } from '@vueuse/core'
import { debounce } from 'lodash-es'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { ResourcePackService } from '~/services/core/ResourcePackService'

export const useResourcePackStore = defineStore('resourcePack', () => {
  const packs = ref<ResourcePack[]>([])
  const vanillaPack = ref<ResourcePack | null>(null)
  const uploadProgress = ref<UploadProgress>({})
  const isProcessing = ref(false)
  const errors = ref<string[]>([])

  // 持久化设置
  const settings = useStorage('mc-icon-settings', {
    autoValidate: true,
    maxPacks: 10,
    conflictResolution: 'use-highest' as const,
  })

  // 服务实例
  const resourcePackService = new ResourcePackService()

  // 计算属性
  const totalPacks = computed(() =>
    packs.value.length + (vanillaPack.value ? 1 : 0),
  )

  const hasVanillaPack = computed(() =>
    vanillaPack.value !== null,
  )

  const inheritanceOrder = computed(() => {
    const ordered = [...packs.value]
    if (vanillaPack.value) {
      ordered.push(vanillaPack.value)
    }
    return ordered
  })

  const allTextures = computed(() =>
    inheritanceOrder.value.flatMap(pack => pack.textures),
  )

  // 防抖的冲突检测
  const detectConflicts = debounce(() => {
    const textureMap = new Map<string, string[]>()

    for (const pack of inheritanceOrder.value) {
      for (const texture of pack.textures) {
        if (!textureMap.has(texture.id)) {
          textureMap.set(texture.id, [])
        }
        textureMap.get(texture.id)!.push(pack.name)
      }
    }

    return Array.from(textureMap.entries())
      .filter(([, packs]) => packs.length > 1)
      .map(([textureId, packs]) => ({ textureId, packs }))
  }, 300)

  const inheritance = computed((): PackInheritance => {
    const order = inheritanceOrder.value.map(pack => pack.id)
    const conflicts = detectConflicts() || []
    return { order, conflicts }
  })

  const isUploading = computed(() =>
    Object.keys(uploadProgress.value).length > 0,
  )

  // 异步操作
  const { execute: executeUpload } = useAsyncState(
    async (file: File, isVanilla = false) => {
      if (!isVanilla && !hasVanillaPack.value) {
        throw new Error('validation.missingVanilla')
      }

      const packId = `temp_${Date.now()}_${file.name}`

      try {
        uploadProgress.value[packId] = {
          progress: 0,
          stage: 'parsing',
        }

        const pack = await resourcePackService.parseResourcePack(file)

        uploadProgress.value[packId] = {
          progress: 100,
          stage: 'complete',
        }

        if (isVanilla) {
          pack.isVanilla = true
          vanillaPack.value = pack
        }
        else {
          if (packs.value.length >= settings.value.maxPacks) {
            throw new Error('validation.tooManyPacks')
          }
          packs.value.push(pack)
        }

        // 清理进度
        setTimeout(() => {
          delete uploadProgress.value[packId]
        }, 1000)

        return pack
      }
      catch (error) {
        uploadProgress.value[packId] = {
          progress: 0,
          stage: 'parsing',
          error: error instanceof Error ? error.message : 'upload.failed',
        }
        throw error
      }
    },
    null,
    { immediate: false },
  )

  // Actions
  const clearErrors = (): void => {
    errors.value = []
  }

  const uploadResourcePack = async (file: File): Promise<ResourcePack> => {
    isProcessing.value = true
    try {
      const result = await executeUpload(0, file, false)
      clearErrors()
      return result!
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'upload.failed'
      errors.value.push(message)
      throw error
    }
    finally {
      isProcessing.value = false
    }
  }

  const uploadVanillaPack = async (file: File): Promise<ResourcePack> => {
    isProcessing.value = true
    try {
      const result = await executeUpload(0, file, true)
      clearErrors()
      return result!
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'vanilla.upload.failed'
      errors.value.push(message)
      throw error
    }
    finally {
      isProcessing.value = false
    }
  }

  const removePack = (packId: string): boolean => {
    const index = packs.value.findIndex(pack => pack.id === packId)
    if (index >= 0) {
      packs.value.splice(index, 1)
      return true
    }
    return false
  }

  const removeVanillaPack = (): void => {
    vanillaPack.value = null
    // 当移除原版包时，清空所有自定义包
    packs.value = []
  }

  const movePackPriority = (packId: string, direction: 'up' | 'down'): boolean => {
    const index = packs.value.findIndex(pack => pack.id === packId)
    if (index < 0)
      return false

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= packs.value.length)
      return false

    const [pack] = packs.value.splice(index, 1)
    packs.value.splice(newIndex, 0, pack)

    return true
  }

  const reorderPacks = (oldIndex: number, newIndex: number): void => {
    if (oldIndex < 0 || oldIndex >= packs.value.length)
      return
    if (newIndex < 0 || newIndex >= packs.value.length)
      return
    if (oldIndex === newIndex)
      return

    const [pack] = packs.value.splice(oldIndex, 1)
    packs.value.splice(newIndex, 0, pack)
  }

  const clearAllPacks = (): void => {
    packs.value = []
    vanillaPack.value = null
    uploadProgress.value = {}
    errors.value = []
  }

  const getPackById = (packId: string): ResourcePack | undefined => {
    if (vanillaPack.value?.id === packId) {
      return vanillaPack.value
    }
    return packs.value.find(pack => pack.id === packId)
  }

  const getTextureById = (textureId: string) => {
    for (const pack of inheritanceOrder.value) {
      const texture = pack.textures.find(t => t.id === textureId)
      if (texture) {
        return { texture, pack }
      }
    }
    return null
  }

  const validatePacks = (): { isValid: boolean, issues: string[] } => {
    const issues: string[] = []

    if (!hasVanillaPack.value) {
      issues.push('validation.missingVanilla')
    }

    if (totalPacks.value === 0) {
      issues.push('validation.noPacks')
    }

    // 检查重复的包名
    const packNames = inheritanceOrder.value.map(pack => pack.name)
    const duplicates = packNames.filter((name, index) =>
      packNames.indexOf(name) !== index,
    )

    if (duplicates.length > 0) {
      issues.push('validation.duplicateNames')
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  }

  // 返回公共API
  return {
    // 只读状态
    packs: readonly(packs),
    vanillaPack: readonly(vanillaPack),
    uploadProgress: readonly(uploadProgress),
    isProcessing: readonly(isProcessing),
    errors: readonly(errors),
    settings,

    // 计算属性
    totalPacks,
    hasVanillaPack,
    inheritanceOrder,
    allTextures,
    inheritance,
    isUploading,

    // 方法
    uploadResourcePack,
    uploadVanillaPack,
    removePack,
    removeVanillaPack,
    movePackPriority,
    reorderPacks,
    clearErrors,
    clearAllPacks,
    getPackById,
    getTextureById,
    validatePacks,
  }
})
