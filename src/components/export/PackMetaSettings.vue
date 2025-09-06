<script setup lang="ts">
import type { ExportSettings } from '~/composables/useIconExport'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: ExportSettings
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: ExportSettings]
}>()

const { t } = useI18n()

const settings = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const packFormatOptions = computed(() => [
  { label: 'Format 85 (1.21.9+)', value: 85 },
  { label: 'Format 81 (1.21.7 - 1.21.8)', value: 81 },
  { label: 'Format 80 (1.21.6)', value: 80 },
  { label: 'Format 71 (1.21.5)', value: 71 },
  { label: 'Format 61 (1.21.4)', value: 61 },
  { label: 'Format 57 (1.21.2 - 1.21.3)', value: 57 },
  { label: 'Format 48 (1.21 - 1.21.1)', value: 48 },
  { label: 'Format 41 (1.20.5 - 1.20.6)', value: 41 },
  { label: 'Format 26 (1.20.3 - 1.20.4)', value: 26 },
  { label: 'Format 18 (1.20.2)', value: 18 },
  { label: 'Format 15 (1.20 - 1.20.1)', value: 15 },
  { label: 'Format 12 (1.19.4)', value: 12 },
  { label: 'Format 10 (1.19 - 1.19.3)', value: 10 },
  { label: 'Format 9 (1.18.2)', value: 9 },
  { label: 'Format 8 (1.18 - 1.18.1)', value: 8 },
  { label: 'Format 7 (1.17 - 1.17.1)', value: 7 },
  { label: 'Format 6 (1.16.2 - 1.16.5)', value: 6 },
  { label: 'Format 5 (1.15 - 1.16.1)', value: 5 },
  { label: 'Format 4 (1.13 - 1.14.4)', value: 4 },
])

const supportedFormatsOptions = computed(() => [
  { label: t('export.settings.supportedFormatsOptions.notSpecified') || 'Not Specified', value: 'none' },
  { label: t('export.settings.supportedFormatsOptions.latest') || 'Latest (1.21+)', value: '[48, 57, 61, 71, 80, 81, 85]' },
  { label: t('export.settings.supportedFormatsOptions.v120Plus') || 'v1.20+', value: '[15, 18, 26, 41, 48, 57, 61, 71, 80, 81, 85]' },
  { label: t('export.settings.supportedFormatsOptions.common') || 'Common (1.18+)', value: '[8, 9, 10, 12, 15, 18, 26, 41, 48, 57, 61, 71, 80, 81, 85]' },
  { label: t('export.settings.supportedFormatsOptions.range48_85') || 'Range 48-85 (1.21+)', value: '{min_inclusive:48,max_inclusive:85}' },
  { label: t('export.settings.supportedFormatsOptions.range26_85') || 'Range 26-85 (1.20.3+)', value: '{min_inclusive:26,max_inclusive:85}' },
  { label: t('export.settings.supportedFormatsOptions.range15_85') || 'Range 15-85 (1.20+)', value: '{min_inclusive:15,max_inclusive:85}' },
  { label: t('export.settings.supportedFormatsOptions.custom') || 'Custom', value: 'custom' },
])
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-sm text-zinc-700 font-medium dark:text-zinc-300">
      {{ $t('export.settings.packMetaInfo') }}
    </h3>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label for="pack-name-input" class="text-xs text-zinc-500 dark:text-zinc-400">{{ $t('export.settings.packName') }}</label>
        <input
          id="pack-name-input"
          v-model="settings.packName"
          type="text"
          required
          aria-required="true"
          class="input-modern"
          :placeholder="$t('export.settings.packNamePlaceholder')"
        >
      </div>

      <div class="space-y-2">
        <label class="text-xs text-zinc-500 dark:text-zinc-400">{{ $t('export.settings.packFormat') }}</label>
        <div class="select-wrapper">
          <select
            v-model="settings.packFormat"
            class="select-modern"
          >
            <option
              v-for="(option, index) in packFormatOptions"
              :key="`format-${option.value}-${index}`"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <div class="select-arrow">
            <i class="i-lucide-chevron-down select-icon" />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <label for="pack-description-textarea" class="text-xs text-zinc-500 dark:text-zinc-400">{{ $t('export.settings.packDescription') }}</label>
      <textarea
        id="pack-description-textarea"
        v-model="settings.packDescription"
        rows="3"
        class="textarea-modern"
        :placeholder="$t('export.settings.descriptionPlaceholder')"
      />
    </div>

    <div class="space-y-2">
      <label class="text-xs text-zinc-500 dark:text-zinc-400">{{ $t('export.confirmation.supportedFormats') }}</label>
      <div class="select-wrapper">
        <select
          v-model="settings.supportedFormats"
          class="select-modern"
        >
          <option
            v-for="(option, index) in supportedFormatsOptions"
            :key="`${option.value}-${index}`"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <div class="select-arrow">
          <i class="i-lucide-chevron-down select-icon" />
        </div>
      </div>
      <input
        v-if="settings.supportedFormats === 'custom'"
        id="custom-supported-formats-input"
        v-model="settings.customSupportedFormats"
        type="text"
        class="mt-2 input-modern"
        :placeholder="$t('export.settings.supportedFormatsCustomPlaceholder')"
        aria-describedby="supported-formats-hint"
      >
      <p id="supported-formats-hint" class="text-xs text-zinc-500 dark:text-zinc-400">
        {{ $t('export.settings.supportedFormatsHint') }}
      </p>
    </div>

    <div class="space-y-2">
      <label class="flex cursor-pointer items-center space-x-2">
        <input
          id="allow-incompatible-checkbox"
          v-model="settings.allowedIncompatible"
          type="checkbox"
          class="h-4 w-4 border-zinc-300 rounded text-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-describedby="allow-incompatible-hint"
        >
        <span class="text-xs text-zinc-700 dark:text-zinc-300">{{ $t('export.confirmation.allowIncompatible') }}</span>
      </label>
      <p id="allow-incompatible-hint" class="ml-6 text-xs text-zinc-500 dark:text-zinc-400">
        {{ $t('export.settings.allowIncompatibleHint') }}
      </p>
    </div>
  </div>
</template>
