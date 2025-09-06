<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUploadZone from '~/components/base/FileUploadZone.vue'
import { logger } from '~/utils/logger'

interface Props {
  licenseFile?: File
}

defineProps<Props>()

const emit = defineEmits<{
  'update:licenseFile': [value: File | undefined]
}>()

const { t } = useI18n()

const isDragOver = ref(false)

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file)
    emit('update:licenseFile', file)
}

function handleFileDrop(event: DragEvent) {
  const files = event.dataTransfer?.files
  if (!files || files.length === 0)
    return

  const file = files[0]
  if (!file.name.match(/\.(txt|md|license)$/i)) {
    logger.error(t('upload.messages.onlyText'))
    return
  }
  emit('update:licenseFile', file)
}

function clearLicense() {
  emit('update:licenseFile', undefined)
}
</script>

<template>
  <FileUploadZone
    v-model:is-drag-over="isDragOver"
    :label="$t('export.settings.license')"
    accept=".txt,.md,.license"
    :placeholder="$t('export.settings.licensePlaceholder')"
    :file-types-hint="$t('upload.fileTypes.text')"
    :has-file="!!licenseFile"
    @file-select="handleFileSelect"
    @file-drop="handleFileDrop"
    @file-clear="clearLicense"
  >
    <template #file-preview>
      <div class="h-12 w-12 flex items-center justify-center">
        <i class="i-carbon-document text-2xl text-green-600" />
      </div>
    </template>

    <template #file-info>
      <p class="text-xs text-zinc-600 dark:text-zinc-400">
        {{ licenseFile?.name }}
      </p>
    </template>

    <template #empty-state>
      <i class="i-carbon-document text-lg text-zinc-400" />
      <div class="text-left">
        <p class="text-xs text-zinc-600 dark:text-zinc-400">
          {{ $t('export.settings.licensePlaceholder') }}
        </p>
        <p class="text-xs text-zinc-500 dark:text-zinc-500">
          {{ $t('upload.fileTypes.text') }}
        </p>
      </div>
    </template>
  </FileUploadZone>
</template>
