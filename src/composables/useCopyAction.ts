import { useClipboard } from '@vueuse/core'
import { useNotification } from './useNotification'

export interface CopyActionOptions {
  showNotification?: boolean
  successTitle?: string
  errorTitle?: string
}

export function useCopyAction(options: CopyActionOptions = {}) {
  const {
    showNotification = true,
    successTitle = 'Copy Success',
    errorTitle = 'Copy Failed',
  } = options

  const { copy } = useClipboard()
  const { showSuccess, showError } = useNotification()

  const copyToClipboard = async (
    value: string,
    type: string = 'value',
    customSuccessMessage?: string,
    customErrorMessage?: string,
  ): Promise<boolean> => {
    try {
      await copy(value)

      if (showNotification) {
        showSuccess(
          successTitle,
          {
            message: customSuccessMessage || `${type} copied to clipboard`,
          },
        )
      }

      return true
    }
    catch {
      if (showNotification) {
        showError(
          errorTitle,
          {
            message: customErrorMessage || `Failed to copy ${type.toLowerCase()} to clipboard`,
          },
        )
      }

      return false
    }
  }

  const copyUnicode = (unicode: string): Promise<boolean> => {
    return copyToClipboard(
      unicode,
      'Unicode',
      `Unicode ${unicode} copied to clipboard`,
      'Failed to copy Unicode to clipboard',
    )
  }

  const copyTranslationKey = (translationKey: string): Promise<boolean> => {
    return copyToClipboard(
      translationKey,
      'Translation key',
      `Translation key ${translationKey} copied to clipboard`,
      'Failed to copy translation key to clipboard',
    )
  }

  const copyName = (name: string): Promise<boolean> => {
    return copyToClipboard(
      name,
      'Name',
      `Name ${name} copied to clipboard`,
      'Failed to copy name to clipboard',
    )
  }

  const copyId = (id: string): Promise<boolean> => {
    return copyToClipboard(
      id,
      'ID',
      `ID ${id} copied to clipboard`,
      'Failed to copy ID to clipboard',
    )
  }

  return {
    copyToClipboard,
    copyUnicode,
    copyTranslationKey,
    copyName,
    copyId,
  }
}
