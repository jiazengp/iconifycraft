<script setup lang="ts">
import BaseSelectField from './base/BaseSelectField.vue'

interface Props {
  modelValue: number
  disabled?: boolean
}

interface Emits {
  'update:modelValue': [value: number]
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

const intervalOptions = [
  { value: 1000, label: '1s' },
  { value: 3000, label: '3s' },
  { value: 5000, label: '5s' },
  { value: 10000, label: '10s' },
  { value: 30000, label: '30s' },
]

function handleIntervalChange(value: string | number) {
  const numericValue = Number(value)
  emit('update:modelValue', numericValue)
}
</script>

<template>
  <div class="auto-save-interval-selector">
    <BaseSelectField
      :model-value="modelValue"
      :options="intervalOptions"
      :disabled="disabled"
      size="md"
      width="max-w-xs"
      @update:model-value="handleIntervalChange"
    />

    <p class="interval-hint">
      {{ t('settings.autoSave.intervalDescription', '自动保存工作的频率') }}
    </p>
  </div>
</template>

<style scoped>
.auto-save-interval-selector {
  @apply space-y-2;
}

.interval-hint {
  @apply text-sm text-muted-foreground;
}

@media (max-width: 640px) {
  .interval-hint {
    @apply text-xs;
  }
}
</style>
