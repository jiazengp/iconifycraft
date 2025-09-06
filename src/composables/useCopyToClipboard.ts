import { useClipboard } from '@vueuse/core'
import { ref } from 'vue'

export interface CopyState {
  [key: string]: boolean
}

export function useCopyToClipboard() {
  const { copy, isSupported } = useClipboard()
  const copiedStates = ref<CopyState>({})
  const { t } = useI18n()

  const copyToClipboard = async (
    text: string,
    label: string,
    key: string,
    onSuccess?: (message: string) => void,
    onError?: (message: string) => void,
  ) => {
    if (!isSupported.value) {
      onError?.(t('clipboard.errors.notSupported'))
      return false
    }

    try {
      await copy(text)
      copiedStates.value[key] = true
      onSuccess?.(t('clipboard.success.copied'))

      // 2秒后重置状态
      setTimeout(() => {
        copiedStates.value[key] = false
      }, 2000)

      return true
    }
    catch {
      onError?.(t('clipboard.errors.failed'))
      return false
    }
  }

  const isCopied = (key: string) => {
    return copiedStates.value[key] || false
  }

  const resetCopyState = (key: string) => {
    copiedStates.value[key] = false
  }

  const resetAllCopyStates = () => {
    copiedStates.value = {}
  }

  return {
    copyToClipboard,
    isCopied,
    resetCopyState,
    resetAllCopyStates,
    isSupported,
  }
}
