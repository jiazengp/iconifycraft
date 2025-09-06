import { useNotification } from './useNotification'

export function useNotificationHandlers() {
  const { showSuccess } = useNotification()
  const { t } = useI18n()

  function handleCopySuccess(type: string, value: string) {
    showSuccess(t('icons.copy.success'), {
      message: t('notification.copy.unicode', { value: `${type}: ${value}` }),
    })
  }

  function handleDetailCopySuccess(message: string) {
    showSuccess(t('icons.copy.success'), {
      message,
    })
  }

  return {
    handleCopySuccess,
    handleDetailCopySuccess,
  }
}
