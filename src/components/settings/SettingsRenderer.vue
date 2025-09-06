<script setup lang="ts" generic="T">
import type { SettingItem, SettingSection } from '~/types/settings'
import BaseSelectField from './base/BaseSelectField.vue'
import BaseSettingField from './base/BaseSettingField.vue'
import LogDownloadButton from './LogDownloadButton.vue'
import SettingsSwitch from './SettingsSwitch.vue'
import ThemeVisualSelector from './ThemeVisualSelector.vue'
import ToastPositionSelector from './ToastPositionSelector.vue'

interface Props {
  sections: SettingSection[]
}

defineProps<Props>()

// 辅助函数：获取computed值或普通值
function getValue<T>(value: T | ComputedRef<T>): T {
  return unref(value)
}

// 组件映射 - 将字符串名称映射到实际组件
const componentMap = {
  ThemeVisualSelector,
  ToastPositionSelector,
  LogDownloadButton,
}

// 获取组件实例
function getComponent(item: SettingItem) {
  if (typeof item.component === 'string') {
    return componentMap[item.component as keyof typeof componentMap]
  }
  return item.component
}

// 获取组件的props
function getProps(item: SettingItem) {
  const baseProps = {
    ...item.props,
  }

  // 为组件类型自动添加标签和描述
  if (item.type === 'component' && !item.props?.label && !item.props?.description) {
    baseProps.label = item.label
    baseProps.description = item.description
  }

  return baseProps
}

// 获取模型值和更新函数
function getModelProps(item: SettingItem) {
  const props: Record<string, unknown> = {}

  if (item.modelValue !== undefined) {
    props.modelValue = unref(item.modelValue)
  }

  if (item.onUpdate) {
    props['onUpdate:modelValue'] = item.onUpdate
  }

  return props
}

// 计算字段样式
function getFieldStyle(item: SettingItem) {
  const style: Record<string, string | number> = {}

  if (item.animationDelay) {
    style.animationDelay = `${item.animationDelay}s`
    style.animationFillMode = 'both'
  }

  if (typeof item.style === 'string') {
    // 如果是字符串，暂不处理，让组件自己处理
  }
  else if (typeof item.style === 'object') {
    Object.assign(style, item.style)
  }

  return style
}

// 判断是否显示子项
function shouldShowChildren(item: SettingItem) {
  if (!item.children || item.children.length === 0)
    return false
  if (item.type === 'switch') {
    // Switch类型的子项只有在开关打开时才显示
    return !!unref(item.modelValue)
  }
  return true
}
</script>

<template>
  <div class="settings-renderer">
    <!-- 直接使用v-for渲染，更简洁和类型安全 -->
    <div
      v-for="section in sections"
      :key="section.id"
      class="setting-section"
      :class="section.className"
      :style="section.animationDelay ? {
        animationDelay: `${section.animationDelay}s`,
        animationFillMode: 'both',
      } : {}"
    >
      <div
        v-for="item in section.items"
        :key="item.id"
        class="setting-item"
        :class="[item.className, { 'content-enter': item.animationDelay }]"
        :style="getFieldStyle(item)"
      >
        <!-- Switch 类型 -->
        <SettingsSwitch
          v-if="item.type === 'switch'"
          v-bind="getModelProps(item)"
          :label="getValue(item.label)"
          :description="getValue(item.description)"
          :color="item.color"
          :size="item.size"
        >
          <!-- 子设置项 -->
          <div v-if="shouldShowChildren(item)" class="setting-children">
            <SettingsRenderer :sections="[{ id: 'children', title: '', description: '', items: item.children || [] }]" />
          </div>
        </SettingsSwitch>

        <!-- Select 类型 -->
        <BaseSettingField
          v-else-if="item.type === 'select'"
          :label="getValue(item.label)"
          :description="getValue(item.description)"
          :animation-delay="item.animationDelay"
          :vertical="true"
        >
          <BaseSelectField
            v-bind="getModelProps(item)"
            :options="getValue(item.options) || []"
            :width="item.width"
            :placeholder="getValue(item.placeholder)"
          />
        </BaseSettingField>

        <!-- Component 类型 -->
        <BaseSettingField
          v-else-if="item.type === 'component'"
          :label="getValue(item.label)"
          :description="getValue(item.description)"
          :animation-delay="item.animationDelay"
          :vertical="true"
        >
          <component
            :is="getComponent(item)"
            v-bind="{ ...getProps(item), ...getModelProps(item) }"
          />
        </BaseSettingField>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-renderer {
  @apply space-y-8;
}

.setting-section {
  @apply space-y-6;
}

.setting-item {
  @apply relative;
}

.setting-children {
  @apply mt-4 ml-4 space-y-4;
}

/* 动画效果 */
.content-enter {
  @apply opacity-0 translate-y-4;
  animation: slideInUp 0.5s ease-out forwards;
}

@keyframes slideInUp {
  to {
    @apply opacity-100 translate-y-0;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .setting-children {
    @apply ml-0 pl-3;
  }
}
</style>
