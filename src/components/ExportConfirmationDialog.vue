<script setup lang="ts">
import { computed } from 'vue'
import BaseDialog from '~/components/base/BaseDialog.vue'
import ConfirmationFileStructure from '~/components/export/ConfirmationFileStructure.vue'
import ConfirmationPackInfo from '~/components/export/ConfirmationPackInfo.vue'
import CopyrightSection from '~/components/export/CopyrightSection.vue'
import ExportSummary from '~/components/export/ExportSummary.vue'

interface ExportData {
  packName: string
  packDescription: string
  packFormat: number
  supportedFormats: string
  customSupportedFormats: string
  allowedIncompatible: boolean
  includeTranslationKeys: boolean
  packIcon?: Uint8Array
}

interface SourcePack {
  name: string
  author?: string
  description?: string
}

interface Props {
  open?: boolean
  exportData: ExportData
  iconCount: number
  sourcePacks: SourcePack[]
  licenseFileName?: string
  fontName?: string
  isExporting?: boolean
  exportProgress?: {
    progress: number
    message: string
    stage: string
  }
  atlasFileNames?: string[]
  fontFileNames?: string[]
  atlasImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  fontName: 'minecraft:default',
  isExporting: false,
  atlasFileNames: () => [],
  fontFileNames: () => [],
  atlasImage: undefined,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'export': []
  'goBack': []
}>()

// Composables

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const estimatedSize = computed(() => {
  let sizeKB = 5 // 基础文件大小
  sizeKB += Math.ceil(props.iconCount / 64) * 200 // 图集大小估算
  if (props.exportData.includeTranslationKeys) {
    sizeKB += 10 // 翻译文件
  }
  if (props.exportData.packIcon) {
    sizeKB += 5 // 包图标
  }

  if (sizeKB < 1024) {
    return `~${sizeKB}KB`
  }
  else {
    return `~${(sizeKB / 1024).toFixed(1)}MB`
  }
})

function handleGoBack() {
  emit('goBack')
}

function handleConfirmExport() {
  emit('export')
}
</script>

<template>
  <BaseDialog
    v-model:open="isOpen"
    :title="$t('export.confirmation.title')"
    :description="$t('export.confirmation.description')"
    size="4xl"
  >
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- 左侧：材质包信息 -->
      <div class="space-y-6">
        <!-- 材质包元信息 -->
        <ConfirmationPackInfo
          :pack-icon="exportData.packIcon"
          :pack-name="exportData.packName"
          :pack-description="exportData.packDescription"
          :license-file-name="licenseFileName"
          :pack-format="exportData.packFormat"
          :icon-count="iconCount"
          :supported-formats="exportData.supportedFormats"
          :allowed-incompatible="exportData.allowedIncompatible"
          :atlas-image="atlasImage"
        />

        <!-- 版权信息 -->
        <CopyrightSection v-if="sourcePacks.length > 0" :source-packs="sourcePacks" />
      </div>

      <!-- 右侧：文件结构预览 -->
      <div class="space-y-6">
        <ConfirmationFileStructure
          :pack-name="exportData.packName"
          :has-pack-icon="!!exportData.packIcon"
          :license-file-name="licenseFileName"
          :font-file-names="fontFileNames"
          :atlas-file-names="atlasFileNames"
          :include-translation-keys="exportData.includeTranslationKeys"
        />

        <!-- 导出选项总结 -->
        <ExportSummary
          :include-translation-keys="exportData.includeTranslationKeys"
          :estimated-size="estimatedSize"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="flex items-center text-sm text-muted-foreground space-x-2">
          <i class="i-carbon-information" />
          <span>{{ $t('export.confirmation.downloadInfo') }}</span>
        </div>

        <div class="flex space-x-3">
          <button
            type="button"
            class="flex items-center px-4 py-2 text-sm text-muted-foreground transition-colors space-x-1 hover:text-primary"
            @click="handleGoBack"
          >
            <i class="i-carbon-arrow-left" />
            <span>{{ $t('dialog.back') }}</span>
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            @click="isOpen = false"
          >
            {{ $t('dialog.cancel') }}
          </button>
          <button
            type="button"
            class="flex items-center rounded bg-blue-600 px-6 py-2 text-sm text-white transition-colors space-x-2 hover:bg-blue-700"
            @click="handleConfirmExport"
          >
            <i class="i-carbon-download" />
            <span>{{ $t('dialog.confirm') }}</span>
          </button>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>
