import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { isValidURL } from '~/utils/validation'

export interface ValidationRule<T = unknown> {
  validator: (value: T) => boolean | string
  message: string
  trigger?: 'blur' | 'change' | 'submit'
}

export interface FieldValidation {
  rules: ValidationRule[]
  error: string
  isValid: boolean
  isDirty: boolean
}

export interface FormValidationOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showErrors?: boolean
}

export function useFormValidation<T extends Record<string, unknown>>(
  formData: Ref<T>,
  validationRules: Partial<Record<keyof T, ValidationRule[]>>,
  options: FormValidationOptions = {},
) {
  const {
    validateOnChange = true,
  } = options

  const errors = ref<Partial<Record<keyof T, string>>>({})
  const touched = ref<Partial<Record<keyof T, boolean>>>({})
  const isSubmitting = ref(false)

  // 验证单个字段
  const validateField = (field: keyof T): boolean => {
    const rules = validationRules[field]
    if (!rules || rules.length === 0) {
      errors.value[field] = ''
      return true
    }

    const value = formData.value[field]

    for (const rule of rules) {
      const result = rule.validator(value)

      if (result !== true) {
        errors.value[field] = typeof result === 'string' ? result : rule.message
        return false
      }
    }

    errors.value[field] = ''
    return true
  }

  // 验证所有字段
  const validateForm = (): boolean => {
    let isValid = true

    for (const field in validationRules) {
      if (!validateField(field)) {
        isValid = false
      }
      touched.value[field] = true
    }

    return isValid
  }

  // 清除验证错误
  const clearErrors = () => {
    errors.value = {}
    touched.value = {}
  }

  // 清除特定字段错误
  const clearFieldError = (field: keyof T) => {
    errors.value[field] = ''
    touched.value[field] = false
  }

  // 标记字段为已触摸
  const touchField = (field: keyof T) => {
    touched.value[field] = true
  }

  // 计算属性
  const isValid = computed(() => {
    return Object.values(errors.value).every(error => !error)
  })

  const hasErrors = computed(() => {
    return Object.values(errors.value).some(error => error)
  })

  const isDirty = computed(() => {
    return Object.values(touched.value).some(touched => touched)
  })

  // 获取字段错误信息
  const getFieldError = (field: keyof T): string => {
    return (touched.value[field] && errors.value[field]) || ''
  }

  // 检查字段是否有错误
  const hasFieldError = (field: keyof T): boolean => {
    return !!(touched.value[field] && errors.value[field])
  }

  // 监听表单数据变化
  if (validateOnChange) {
    watch(
      formData,
      (newData, oldData) => {
        if (!oldData)
          return

        for (const field in newData) {
          if (newData[field] !== oldData[field] && touched.value[field]) {
            validateField(field as keyof T)
          }
        }
      },
      { deep: true },
    )
  }

  // 提交表单
  const submitForm = async (submitFn: (data: T) => Promise<void> | void) => {
    isSubmitting.value = true

    try {
      const isFormValid = validateForm()

      if (!isFormValid) {
        throw new Error('Form validation failed')
      }

      await submitFn(formData.value)
    }
    finally {
      isSubmitting.value = false
    }
  }

  // 重置表单
  const resetForm = (newData?: Partial<T>) => {
    if (newData) {
      Object.assign(formData.value, newData)
    }
    clearErrors()
  }

  return {
    errors: readonly(errors),
    touched: readonly(touched),
    isSubmitting: readonly(isSubmitting),
    isValid,
    hasErrors,
    isDirty,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    touchField,
    getFieldError,
    hasFieldError,
    submitForm,
    resetForm,
  }
}

// 常用验证规则
export const createValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validator: (value: unknown) => {
      if (typeof value === 'string')
        return value.trim().length > 0
      if (Array.isArray(value))
        return value.length > 0
      return value != null && value !== ''
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validator: (value: unknown) => {
      const str = String(value || '')
      return !str || str.length >= min
    },
    message: message || `Minimum length is ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: (value: unknown) => {
      const str = String(value || '')
      return !str || str.length <= max
    },
    message: message || `Maximum length is ${max} characters`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validator: (value: unknown) => {
      const str = String(value || '')
      return !str || regex.test(str)
    },
    message,
  }),

  email: (message = 'Invalid email format'): ValidationRule => ({
    validator: (value: unknown) => {
      const str = String(value || '')
      if (!str)
        return true
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
      return emailRegex.test(str)
    },
    message,
  }),

  url: (message = 'Invalid URL format'): ValidationRule => ({
    validator: (value: unknown) => {
      const str = String(value || '')
      if (!str)
        return true
      return isValidURL(str)
    },
    message,
  }),

  numeric: (message = 'Must be a number'): ValidationRule => ({
    validator: (value: unknown) => {
      if (!value)
        return true
      return !Number.isNaN(Number(value))
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validator: (value: unknown) => value == null || (typeof value === 'number' && value >= min),
    message: message || `Minimum value is ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validator: (value: unknown) => value == null || (typeof value === 'number' && value <= max),
    message: message || `Maximum value is ${max}`,
  }),
}
