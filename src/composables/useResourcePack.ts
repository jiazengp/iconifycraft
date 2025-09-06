/**
 * 材质包管理组合式函数
 * 整合材质包相关功能，提供统一的API
 */

import { useDropZone, useFileDialog } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useMinecraftStore } from '~/stores/minecraft'
import { useResourcePackStore } from '~/stores/resource-pack'
import { useNotification } from './useNotification'

export function useResourcePack() {
  const packStore = useResourcePackStore()
  const minecraftStore = useMinecraftStore()
  const { showSuccess, showError, showWarning, showPromise } = useNotification()

  // 本地状态
  const dragOverlay = ref<HTMLElement>()
  const validationErrors = ref<string[]>([])
  const isValidating = ref(false)

  // 文件拖拽
  const { isOverDropZone } = useDropZone(dragOverlay, {
    onDrop: handleFileDrop,
    dataTypes: ['application/zip', 'application/x-zip-compressed'],
  })

  // 文件选择对话框
  const { open: openVanillaDialog, onChange: onVanillaChange } = useFileDialog({
    accept: '.zip',
    multiple: false,
  })

  const { open: openCustomDialog, onChange: onCustomChange } = useFileDialog({
    accept: '.zip',
    multiple: true,
  })

  // 计算属性
  const hasVanillaPack = computed(() => packStore.hasVanillaPack)
  const totalPacks = computed(() => packStore.totalPacks)
  const inheritanceOrder = computed(() => packStore.inheritanceOrder)
  const conflicts = computed(() => packStore.inheritance.conflicts)
  const isUploading = computed(() => packStore.isUploading)

  const compatibleTextures = computed(() => {
    const textures = packStore.allTextures
    return textures.filter(texture =>
      minecraftStore.checkCompatibility(texture.id).isCompatible,
    )
  })

  const compatibilityStats = computed(() => {
    const total = packStore.allTextures.length
    const compatible = compatibleTextures.value.length
    const incompatible = total - compatible

    return {
      total,
      compatible,
      incompatible,
      compatibilityRate: total > 0 ? (compatible / total) * 100 : 0,
    }
  })

  // 事件处理
  onVanillaChange((files) => {
    if (files && files.length > 0) {
      uploadVanillaPack(files[0])
    }
  })

  onCustomChange((files) => {
    if (files && files.length > 0) {
      uploadCustomPacks(Array.from(files))
    }
  })

  // 方法
  async function handleFileDrop(files: File[] | null) {
    if (!files || files.length === 0)
      return

    const zipFiles = files.filter(file =>
      file.name.toLowerCase().endsWith('.zip'),
    )

    if (zipFiles.length === 0) {
      showError('validation.noZipFiles')
      return
    }

    if (!hasVanillaPack.value) {
      if (zipFiles.length === 1) {
        await uploadVanillaPack(zipFiles[0])
      }
      else {
        showWarning('upload.vanillaFirst')
      }
    }
    else {
      await uploadCustomPacks(zipFiles)
    }
  }

  async function uploadVanillaPack(file: File) {
    validationErrors.value = []

    return showPromise(
      packStore.uploadVanillaPack(file),
      {
        loading: `Loading ${file.name}...`,
        success: pack => `Successfully loaded vanilla pack: ${pack.name}`,
        error: error => `Failed to load ${file.name} (${error.message})`,
      },
      {
        loadingDescription: 'Parsing textures and validating pack structure...',
        successDescription: pack => `Loaded ${pack.textures.length} textures`,
        errorDescription: error => error instanceof Error ? error.message : 'Unknown error occurred',
      },
    ).catch((error) => {
      const message = error instanceof Error ? error.message : 'upload.failed'
      validationErrors.value = [message]
      throw error
    })
  }

  async function uploadCustomPacks(files: File[]) {
    if (!hasVanillaPack.value) {
      showError('validation.missingVanilla')
      return
    }

    const results = await Promise.allSettled(
      files.map(file =>
        showPromise(
          packStore.uploadResourcePack(file),
          {
            loading: `Loading ${file.name}...`,
            success: pack => `Successfully loaded: ${pack.name}`,
            error: () => `Failed to load ${file.name}`,
          },
          {
            loadingDescription: 'Parsing textures and analyzing pack content...',
            successDescription: pack => `Added ${pack.textures.length} textures`,
            errorDescription: error => error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ),
      ),
    )

    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected')

    if (failed.length > 0) {
      const errors = failed.map((result, index) => {
        const error = result.status === 'rejected' ? result.reason : null
        const message = error instanceof Error ? error.message : 'upload.failed'
        return `${files[index].name}: ${message}`
      })
      validationErrors.value = errors
    }

    if (successful > 0 && failed.length > 0) {
      showWarning('upload.partialSuccess', {
        message: `${successful} packs loaded successfully, ${failed.length} failed`,
      })
    }
  }

  function removePack(packId: string) {
    if (packStore.removePack(packId)) {
      showSuccess('success.packRemoved')
    }
  }

  function removeVanillaPack() {
    packStore.removeVanillaPack()
    showSuccess('success.vanillaRemoved')
  }

  function changePriority(packId: string, direction: 'up' | 'down') {
    if (packStore.movePackPriority(packId, direction)) {
      showSuccess('success.priorityChanged')
    }
  }

  function clearAllPacks() {
    packStore.clearAllPacks()
    validationErrors.value = []
    showSuccess('success.allCleared')
  }

  async function validateAllTextures() {
    if (packStore.allTextures.length === 0)
      return

    isValidating.value = true
    try {
      const textureIds = packStore.allTextures.map(t => t.id)
      const result = await minecraftStore.validateTextures(textureIds)

      if (result.incompatible.length > 0) {
        showWarning('validation.incompatibleTextures', {
          description: `Found ${result.incompatible.length} incompatible textures`,
        })
      }
      else {
        showSuccess('validation.allCompatible')
      }

      return result
    }
    finally {
      isValidating.value = false
    }
  }

  function getTexturesByNamespace() {
    const texturesByNamespace = new Map<string, number>()

    for (const texture of compatibleTextures.value) {
      const count = texturesByNamespace.get(texture.namespace) || 0
      texturesByNamespace.set(texture.namespace, count + 1)
    }

    return Array.from(texturesByNamespace.entries()).map(([namespace, count]) => ({
      namespace,
      count,
      percentage: (count / compatibleTextures.value.length) * 100,
    }))
  }

  function getTexturesByCategory() {
    const texturesByCategory = new Map<string, number>()

    for (const texture of compatibleTextures.value) {
      const count = texturesByCategory.get(texture.category) || 0
      texturesByCategory.set(texture.category, count + 1)
    }

    return Array.from(texturesByCategory.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: (count / compatibleTextures.value.length) * 100,
    }))
  }

  function clearErrors() {
    validationErrors.value = []
    packStore.clearErrors()
  }

  // 监听版本变化，重新验证材质
  watch(
    () => minecraftStore.selectedVersion,
    () => {
      validationErrors.value = []
      minecraftStore.clearCompatibilityCache()
    },
  )

  // 监听包变化，清除错误
  watch(
    () => packStore.totalPacks,
    () => {
      if (validationErrors.value.length > 0) {
        validationErrors.value = []
      }
    },
  )

  return {
    // 状态
    dragOverlay,
    isOverDropZone,
    validationErrors: readonly(validationErrors),
    isValidating: readonly(isValidating),

    // 计算属性
    hasVanillaPack,
    totalPacks,
    inheritanceOrder,
    conflicts,
    isUploading,
    compatibleTextures,
    compatibilityStats,

    // 方法
    openVanillaDialog,
    openCustomDialog,
    uploadVanillaPack,
    uploadCustomPacks,
    removePack,
    removeVanillaPack,
    changePriority,
    clearAllPacks,
    validateAllTextures,
    getTexturesByNamespace,
    getTexturesByCategory,
    clearErrors,
  }
}
