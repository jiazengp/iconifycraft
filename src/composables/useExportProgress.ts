import { computed, ref } from 'vue'

export function useExportProgress() {
  const isExporting = ref(false)
  const exportProgress = ref(0)
  const exportStatus = ref('')
  const errors = ref<string[]>([])

  const progressPercentage = computed(() => `${exportProgress.value}%`)
  const hasErrors = computed(() => errors.value.length > 0)

  const startExport = () => {
    isExporting.value = true
    exportProgress.value = 0
    exportStatus.value = 'export.preparing'
    errors.value = []
  }

  const updateProgress = (progress: number, status: string) => {
    exportProgress.value = progress
    exportStatus.value = status
  }

  const finishExport = () => {
    exportProgress.value = 100
    exportStatus.value = 'export.complete'
    isExporting.value = false
  }

  const failExport = (error: string) => {
    errors.value = [error]
    isExporting.value = false
  }

  const clearErrors = () => {
    errors.value = []
  }

  const resetProgress = () => {
    exportProgress.value = 0
    exportStatus.value = ''
    errors.value = []
  }

  return {
    // 状态
    isExporting,
    exportProgress,
    exportStatus,
    errors,

    // 计算属性
    progressPercentage,
    hasErrors,

    // 方法
    startExport,
    updateProgress,
    finishExport,
    failExport,
    clearErrors,
    resetProgress,
  }
}
