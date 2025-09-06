import type { Component, ComputedRef } from 'vue'

export interface SelectOption<T = unknown> {
  value: T
  label: string
  disabled?: boolean
}

export interface SettingItem<T = unknown> {
  id: string
  type: 'switch' | 'select' | 'component'
  label?: string | ComputedRef<string>
  description?: string | ComputedRef<string>

  // Switch 特定配置
  color?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'

  // Select 特定配置
  options?: SelectOption<T>[] | ComputedRef<SelectOption<T>[]>
  width?: string
  placeholder?: string | ComputedRef<string>

  // 组件渲染配置 - 支持直接传递Vue组件或字符串
  component?: Component | string
  props?: Record<string, unknown>

  // v-model 绑定配置
  modelValue?: T
  modelKey?: string // 绑定到 useAppSettings 中的属性名
  onUpdate?: (value: T) => void

  // 子设置项
  children?: SettingItem[]

  // 条件显示
  showWhen?: {
    settingId: string
    value: unknown
  }

  // 样式和动画
  animationDelay?: number
  className?: string
  style?: Record<string, unknown> | string
}

export interface SettingSection {
  id: string
  title: string | ComputedRef<string>
  description?: string | ComputedRef<string>
  items: SettingItem[]
  animationDelay?: number
  className?: string
}
