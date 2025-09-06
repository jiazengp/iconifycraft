<script setup lang="ts">
import type { ExportSettings } from '~/composables/useIconExport'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCheckbox from '~/components/base/BaseCheckbox.vue'
import BaseDialog from '~/components/base/BaseDialog.vue'
import FileUploads from '~/components/export/FileUploads.vue'
import PackMetaSettings from '~/components/export/PackMetaSettings.vue'

interface Props {
  open?: boolean
  iconCount?: number
  sourcePacks?: Array<{ name: string, author?: string, description?: string }>
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  iconCount: 0,
  sourcePacks: () => [],
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'export': [settings: ExportSettings]
}>()

// Composables
const { t } = useI18n()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const packIcon = ref<Uint8Array | undefined>()
const licenseFile = ref<File | undefined>()

const exportSettings = ref<ExportSettings>({
  includeTranslationKeys: true,
  includeReadme: true,
  agreeContentRules: false,
  packName: 'IconifyCraft',
  packDescription: t('export.settings.descriptionPlaceholder'),
  packFormat: 48,
  supportedFormats: 'none',
  customSupportedFormats: '',
  allowedIncompatible: false,
})

const canExport = computed(() => {
  return props.iconCount > 0 && exportSettings.value.packName.trim() !== '' && exportSettings.value.agreeContentRules
})

function handleExport() {
  if (!canExport.value)
    return

  const exportData = {
    ...exportSettings.value,
    packIcon: packIcon.value,
    licenseFile: licenseFile.value,
  }

  emit('export', exportData)

  // 关闭对话框
  isOpen.value = false
}
</script>

<template>
  <BaseDialog
    v-model:open="isOpen"
    :title="$t('export.settings.title')"
    :description="$t('export.settings.description')"
    size="2xl"
  >
    <template #trigger>
      <slot />
    </template>

    <div class="space-y-6">
      <!-- pack.mcmeta 设置 -->
      <PackMetaSettings v-model="exportSettings" />

      <!-- 材质包文件 -->
      <FileUploads
        v-model:pack-icon="packIcon"
        v-model:license-file="licenseFile"
      />

      <!-- 导出选项 -->
      <div class="border-t border-border pt-4 space-y-4">
        <h3 class="text-sm text-muted-foreground font-medium">
          {{ $t('export.confirmation.exportOptions') }}
        </h3>

        <BaseCheckbox
          v-model="exportSettings.includeTranslationKeys"
          :label="$t('export.settings.includeTranslationKeys')"
          :hint="$t('export.settings.includeTranslationKeysHint')"
        />

        <BaseCheckbox
          v-model="exportSettings.includeReadme"
          :label="$t('export.settings.includeReadme')"
          :hint="$t('export.settings.includeReadmeHint')"
        />

        <BaseCheckbox
          v-model="exportSettings.agreeContentRules"
          :hint="$t('export.settings.agreeContentRulesHint')"
        >
          <template #label>
            <i18n-t keypath="export.settings.agreeContentRules" tag="span">
              <template #link>
                <router-link
                  to="/legal/rules"
                  class="text-blue-600 font-medium transition-colors duration-200 dark:text-blue-400 hover:text-blue-700 hover:underline dark:hover:text-blue-300"
                  target="_blank"
                >
                  {{ $t('export.settings.contentRulesLinkText') }}
                </router-link>
              </template>
            </i18n-t>
          </template>
        </BaseCheckbox>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          class="btn-ghost"
          @click="isOpen = false"
          @keydown.enter="isOpen = false"
          @keydown.space.prevent="isOpen = false"
        >
          {{ $t('dialog.cancel') }}
        </button>
        <button
          type="button"
          class="btn"
          :disabled="!canExport"
          :aria-describedby="!canExport ? 'export-disabled-reason' : undefined"
          @click="handleExport"
          @keydown.enter="!$event.defaultPrevented && handleExport()"
          @keydown.space.prevent="handleExport"
        >
          {{ $t('export.settings.export') }}
        </button>
        <div
          v-if="!canExport"
          id="export-disabled-reason"
          class="sr-only"
        >
          {{
            props.iconCount === 0 || exportSettings.packName.trim() === ''
              ? $t('export.validation.requiresIconsAndName')
              : !exportSettings.agreeContentRules
                ? $t('export.validation.requiresContentRulesAgreement')
                : $t('export.validation.requiresIconsAndName')
          }}
        </div>
      </div>
    </template>
  </BaseDialog>
</template>
