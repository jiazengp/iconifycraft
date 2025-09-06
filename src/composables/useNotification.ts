import type { ToastDuration } from './useAppSettings'
import { toast } from 'vue-sonner'
import { useAppSettings } from './useAppSettings'

interface NotificationOptions {
  message?: string
  duration?: number
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * 根据设置的持续时间模式获取实际的毫秒数
 */
function getDurationMs(type: 'success' | 'error' | 'warning' | 'info', toastDuration: ToastDuration): number {
  const baseValues = {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000,
  }

  const base = baseValues[type]

  switch (toastDuration) {
    case 'fast':
      return Math.round(base * 0.7) // 70% of default time
    case 'slow':
      return Math.round(base * 1.5) // 150% of default time
    case 'default':
    default:
      return base
  }
}

export function useNotification() {
  const { toastDuration } = useAppSettings()

  function showSuccess(
    title: string,
    options: NotificationOptions = {},
  ) {
    return toast.success(title, {
      description: options.message || options.description,
      duration: options.duration ?? getDurationMs('success', toastDuration.value),
      action: options.action,
    })
  }

  function showError(
    title: string,
    options: NotificationOptions & { error?: string } = {},
  ) {
    return toast.error(title, {
      description: options.error || options.message || options.description,
      duration: options.duration ?? getDurationMs('error', toastDuration.value),
    })
  }

  function showWarning(
    title: string,
    options: NotificationOptions = {},
  ) {
    return toast.warning(title, {
      description: options.message || options.description,
      duration: options.duration ?? getDurationMs('warning', toastDuration.value),
    })
  }

  function showInfo(
    title: string,
    options: NotificationOptions = {},
  ) {
    return toast.info(title, {
      description: options.message || options.description,
      duration: options.duration ?? getDurationMs('info', toastDuration.value),
    })
  }

  function showLoading(
    title: string,
    options: NotificationOptions = {},
  ) {
    return toast.loading(title, {
      description: options.message || options.description,
    })
  }

  function showPromise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    },
    options: {
      loadingDescription?: string
      successDescription?: string | ((data: T) => string)
      errorDescription?: string | ((error: Error) => string)
      duration?: number
    } = {},
  ): Promise<T> {
    toast.promise(promise, {
      loading: messages.loading,
      success: (data: T) => ({
        title: typeof messages.success === 'function' ? messages.success(data) : messages.success,
        description: typeof options.successDescription === 'function' ? options.successDescription(data) : options.successDescription,
        duration: options.duration ?? getDurationMs('success', toastDuration.value),
      }),
      error: (error: Error) => ({
        title: typeof messages.error === 'function' ? messages.error(error) : messages.error,
        description: typeof options.errorDescription === 'function' ? options.errorDescription(error) : options.errorDescription,
        duration: options.duration ?? getDurationMs('error', toastDuration.value),
      }),
      description: options.loadingDescription,
    })

    return promise
  }

  // Legacy API compatibility
  const addNotification = showInfo
  const removeNotification = (id: string) => toast.dismiss(id)
  const clearAllNotifications = () => toast.dismiss()
  const updateNotification = (id: string, options: NotificationOptions & { title?: string }) => {
    // vue-sonner doesn't support updating, so we dismiss and create new
    toast.dismiss(id)
    return showInfo(options.title || '', options)
  }

  return {
    // New simplified API
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showPromise,

    // Legacy compatibility
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateNotification,
  }
}
