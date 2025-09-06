<script setup lang="ts">
import type { SettingItem } from '~/types/settings'
import LanguageSelectField from './LanguageSelectField.vue'
import SettingsSwitch from './SettingsSwitch.vue'
import ThemeVisualSelector from './ThemeVisualSelector.vue'

interface Props {
  item: SettingItem
  modelValue?: unknown
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

// 创建响应式的 label 和 description
const label = computed(() => {
  const itemLabel = props.item.label
  return (itemLabel && typeof itemLabel === 'object' && 'value' in itemLabel)
    ? itemLabel.value
    : itemLabel
})

const description = computed(() => {
  const itemDescription = props.item.description
  return (itemDescription && typeof itemDescription === 'object' && 'value' in itemDescription)
    ? itemDescription.value
    : itemDescription
})

// 创建响应式的 options
const options = computed(() => {
  const itemOptions = props.item.options
  if (!itemOptions)
    return []
  return (itemOptions && typeof itemOptions === 'object' && 'value' in itemOptions)
    ? itemOptions.value
    : itemOptions
})

// 子设置项的值管理
const childValues = ref<Record<string, unknown>>({})

// 更新子设置项值
function updateChildValue(childId: string, value: unknown) {
  childValues.value[childId] = value
}
</script>

<template>
  <!-- Switch 类型 -->
  <SettingsSwitch
    v-if="item.type === 'switch'"
    :model-value="modelValue as boolean"
    :label="label"
    :description="description"
    :color="item.color"
    :size="item.size"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <!-- 渲染子设置项 -->
    <div v-if="item.children && item.children.length > 0" class="space-y-4">
      <SettingsItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :model-value="childValues[child.id]"
        @update:model-value="(value) => updateChildValue(child.id, value)"
      />
    </div>
  </SettingsSwitch>

  <!-- Select 类型 -->
  <div
    v-else-if="item.type === 'select'"
    class="space-y-2"
  >
    <label class="block text-sm text-zinc-900 font-medium dark:text-zinc-100">
      {{ label }}
    </label>
    <p class="text-sm text-zinc-600 dark:text-zinc-400">
      {{ description }}
    </p>
    <div class="relative max-w-xs">
      <select
        :value="modelValue"
        class="w-full cursor-pointer appearance-none border border-zinc-300 rounded-lg bg-white py-2 pl-3 pr-10 text-sm text-zinc-900 transition-colors duration-200 dark:border-zinc-600 focus:border-transparent hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:hover:border-zinc-500"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="(option, index) in options"
          :key="String(option.value ?? index)"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <i class="i-lucide-chevron-down pointer-events-none absolute right-3 top-1/2 h-4 w-4 transform text-zinc-400 -translate-y-1/2" />
    </div>
  </div>

  <!-- 自定义组件类型 -->
  <div v-else-if="item.type === 'component'" class="setting-field">
    <label class="setting-label">
      {{ label }}
    </label>

    <!-- 根据组件名称渲染对应组件 -->
    <LanguageSelectField v-if="item.component === 'LanguageSelectField'" />
    <ThemeVisualSelector v-else-if="item.component === 'ThemeVisualSelector'" />

    <p class="setting-description">
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
.setting-field {
  @apply space-y-3;
}

.setting-label {
  @apply block text-sm font-semibold text-zinc-900 dark:text-zinc-100;
}

.setting-description {
  @apply text-sm text-zinc-600 dark:text-zinc-400;
}
</style>
