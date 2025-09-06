import type { IconValidationResult } from '~/services/core/PackIconService'
import { computed, ref, watch } from 'vue'
import { PackIconService } from '~/services/core/PackIconService'
import { logger } from '~/utils/logger'

export function usePackIconUploader(initialFile?: File | null) {
  const packIconService = new PackIconService()

  // 状态管理
  const currentIcon = ref<File | null>(initialFile || null)
  const iconPreviewUrl = ref('')
  const iconInfo = ref<{
    width: number
    height: number
    hasTransparency: boolean
  } | null>(null)
  const validationResult = ref<IconValidationResult | null>(null)
  const isOptimizing = ref(false)

  // 核心方法 - 必须在 watch 之前定义
  const setIcon = (file: File | null) => {
    // 清理旧的预览URL
    if (iconPreviewUrl.value) {
      URL.revokeObjectURL(iconPreviewUrl.value)
      iconPreviewUrl.value = ''
    }

    currentIcon.value = file

    if (file) {
      iconPreviewUrl.value = packIconService.getPreviewUrl(file)
    }
  }

  const loadIconInfo = async (file: File) => {
    const result = await packIconService.validatePackIcon(file)

    if (result.imageData) {
      iconInfo.value = {
        width: result.imageData.width,
        height: result.imageData.height,
        hasTransparency: result.imageData.hasTransparency,
      }
    }
  }

  const clearIconInfo = () => {
    iconInfo.value = null
    validationResult.value = null
  }

  const handleFile = async (file: File) => {
    const result = await packIconService.validatePackIcon(file)
    validationResult.value = result

    if (result.isValid) {
      setIcon(file)
    }
    else {
      setIcon(null)
    }

    return result
  }

  // 计算属性
  const requirementsText = computed(() => packIconService.getRequirementsText())
  const hasErrors = computed(() => validationResult.value ? !validationResult.value.isValid : false)
  const isValid = computed(() => validationResult.value?.isValid || false)

  // 监听图标变化 - 现在可以安全使用上面定义的函数
  watch(currentIcon, async (newIcon) => {
    if (newIcon) {
      await loadIconInfo(newIcon)
    }
    else {
      clearIconInfo()
    }
  })

  const removeIcon = () => {
    setIcon(null)
    validationResult.value = null
  }

  const optimizeIcon = async (targetSize?: number) => {
    if (!currentIcon.value)
      return

    isOptimizing.value = true

    try {
      const optimizedBlob = await packIconService.optimizeIcon(currentIcon.value, {
        targetSize,
      })

      const optimizedFile = new File([optimizedBlob], currentIcon.value.name, {
        type: 'image/png',
      })

      await handleFile(optimizedFile)
    }
    catch (error) {
      logger.error('Icon optimization failed:', error)
    }
    finally {
      isOptimizing.value = false
    }
  }

  // 清理方法
  const cleanup = () => {
    if (iconPreviewUrl.value) {
      URL.revokeObjectURL(iconPreviewUrl.value)
      iconPreviewUrl.value = ''
    }
  }

  return {
    // 状态
    currentIcon,
    iconPreviewUrl,
    iconInfo,
    validationResult,
    isOptimizing,

    // 计算属性
    requirementsText,
    hasErrors,
    isValid,

    // 方法
    handleFile,
    setIcon,
    removeIcon,
    optimizeIcon,
    cleanup,
  }
}
