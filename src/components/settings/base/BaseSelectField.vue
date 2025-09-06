<script setup lang="ts" generic="T = unknown">
import type { SelectOption } from '~/types/settings'

interface Props {
  modelValue?: T
  options: SelectOption<T>[]
  placeholder?: string
  width?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

interface Emits {
  'update:modelValue': [value: T]
}

const props = withDefaults(defineProps<Props>(), {
  width: 'w-48',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<Emits>()

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const selectedValue = target.value

  // 找到对应的选项
  const option = props.options.find(opt => String(opt.value) === selectedValue)
  if (option) {
    emit('update:modelValue', option.value)
  }
  else {
    // 如果找不到选项，直接使用值
    emit('update:modelValue', selectedValue as T)
  }
}
</script>

<template>
  <div class="base-select-field" :class="width">
    <div class="relative">
      <select
        :value="modelValue"
        class="base-select"
        :class="[
          sizeClasses[size],
          {
            'opacity-50 cursor-not-allowed': disabled,
          },
        ]"
        :disabled="disabled"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="String(option.value)"
          :value="String(option.value)"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <i class="base-select-arrow" />
    </div>
  </div>
</template>

<style scoped>
.base-select-field {
  @apply flex-shrink-0;
}

.base-select {
  @apply w-full pr-10 bg-background
         border border-border rounded-lg
         text-foreground focus:ring-2 focus:ring-primary/20
         focus:border-primary transition-all duration-200 appearance-none
         hover:border-primary/60;
}

.base-select:disabled {
  @apply bg-muted text-muted-foreground cursor-not-allowed;
}

.base-select-arrow {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4
         text-muted-foreground pointer-events-none
         i-lucide-chevron-down;
}

.base-select option {
  @apply bg-background text-foreground py-2;
}

.base-select option:disabled {
  @apply text-muted-foreground;
}

/* 移动端响应式优化 */
@media (max-width: 768px) {
  .base-select-field {
    @apply w-full;
  }

  .base-select {
    @apply text-base; /* iOS上防止缩放 */
  }
}

@media (max-width: 480px) {
  .base-select {
    @apply py-3; /* 增加点击区域 */
  }
}
</style>
