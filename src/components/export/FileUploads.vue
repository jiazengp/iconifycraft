<script setup lang="ts">
import LicenseUpload from './LicenseUpload.vue'
import PackIconUpload from './PackIconUpload.vue'

interface Props {
  packIcon?: Uint8Array
  licenseFile?: File
}

defineProps<Props>()

defineEmits<{
  'update:packIcon': [value: Uint8Array | undefined]
  'update:licenseFile': [value: File | undefined]
}>()
</script>

<template>
  <div class="col-span-2 border-t border-gray-200 pt-3 space-y-4 dark:border-gray-700">
    <div class="grid grid-cols-2 gap-4">
      <PackIconUpload
        :pack-icon="packIcon"
        @update:pack-icon="$emit('update:packIcon', $event)"
      />

      <LicenseUpload
        :license-file="licenseFile"
        @update:license-file="$emit('update:licenseFile', $event)"
      />
    </div>
  </div>
</template>
