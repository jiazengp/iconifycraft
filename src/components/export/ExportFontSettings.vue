<script setup lang="ts">
// Removed combobox imports - using regular select instead

interface ExportSettings {
  packName: string
  description: string
  packFormat: number
  namespace: string
  fontName: string
  includeCustomTextures: boolean
  includeVanillaTextures: boolean
  atlasSize: number
  compression: boolean
  includeReadme: boolean
}

interface Props {
  modelValue: ExportSettings
}

interface Emits {
  (e: 'update:modelValue', value: ExportSettings): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Atlas size 选项
const atlasSizeOptions = [
  { label: '128x128', value: 128 },
  { label: '256x256', value: 256 },
  { label: '512x512', value: 512 },
]

function updateField(field: keyof ExportSettings, value: ExportSettings[keyof ExportSettings]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-sm text-gray-700 font-medium dark:text-gray-300">
      {{ $t('export.settings.fontSettings') }}
    </h3>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="text-xs text-gray-500 dark:text-gray-400">{{ $t('export.settings.namespace') }}</label>
        <input
          :value="modelValue.namespace"
          type="text"
          class="input-modern"
          :placeholder="$t('export.settings.namespacePlaceholder')"
          @input="updateField('namespace', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <div class="space-y-2">
        <label class="text-xs text-gray-500 dark:text-gray-400">{{ $t('export.settings.fontName') }}</label>
        <input
          :value="modelValue.fontName"
          type="text"
          class="input-modern"
          :placeholder="$t('export.settings.fontNamePlaceholder')"
          @input="updateField('fontName', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-xs text-gray-500 dark:text-gray-400">{{ $t('export.settings.atlasSize') }}</label>
      <div class="select-wrapper">
        <select
          :value="modelValue.atlasSize"
          class="select-modern"
          @change="updateField('atlasSize', Number(($event.target as HTMLSelectElement).value))"
        >
          <option
            v-for="option in atlasSizeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <div class="select-arrow">
          <i class="i-lucide-chevron-down select-icon" />
        </div>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ $t('export.settings.atlasSizeHint') }}
      </p>
    </div>
  </div>
</template>
