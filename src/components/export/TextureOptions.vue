<script setup lang="ts">
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
      {{ $t('export.settings.textureOptions') }}
    </h3>

    <div class="space-y-3">
      <label class="flex cursor-pointer items-center space-x-3">
        <input
          type="checkbox"
          :checked="modelValue.includeCustomTextures"
          class="h-4 w-4 border-gray-300 rounded bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          @change="updateField('includeCustomTextures', ($event.target as HTMLInputElement).checked)"
        >
        <div>
          <span class="text-sm text-gray-900 font-medium dark:text-gray-100">
            {{ $t('export.settings.includeCustomTextures') }}
          </span>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('export.settings.includeCustomTexturesHint') }}
          </p>
        </div>
      </label>

      <label class="flex cursor-pointer items-center space-x-3">
        <input
          type="checkbox"
          :checked="modelValue.includeVanillaTextures"
          class="h-4 w-4 border-gray-300 rounded bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          @change="updateField('includeVanillaTextures', ($event.target as HTMLInputElement).checked)"
        >
        <div>
          <span class="text-sm text-gray-900 font-medium dark:text-gray-100">
            {{ $t('export.settings.includeVanillaTextures') }}
          </span>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('export.settings.includeVanillaTexturesHint') }}
          </p>
        </div>
      </label>

      <label class="flex cursor-pointer items-center space-x-3">
        <input
          type="checkbox"
          :checked="modelValue.compression"
          class="h-4 w-4 border-gray-300 rounded bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          @change="updateField('compression', ($event.target as HTMLInputElement).checked)"
        >
        <div>
          <span class="text-sm text-gray-900 font-medium dark:text-gray-100">
            {{ $t('export.settings.enableCompression') }}
          </span>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('export.settings.enableCompressionHint') }}
          </p>
        </div>
      </label>

      <label class="flex cursor-pointer items-center space-x-3">
        <input
          type="checkbox"
          :checked="modelValue.includeReadme"
          class="h-4 w-4 border-gray-300 rounded bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          @change="updateField('includeReadme', ($event.target as HTMLInputElement).checked)"
        >
        <div>
          <span class="text-sm text-gray-900 font-medium dark:text-gray-100">
            {{ $t('export.settings.includeReadme') }}
          </span>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('export.settings.includeReadmeHint') }}
          </p>
        </div>
      </label>
    </div>
  </div>
</template>
