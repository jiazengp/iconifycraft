<script setup lang="ts">
interface Props {
  includeTranslationKeys?: boolean
  estimatedSize: string
}

const props = withDefaults(defineProps<Props>(), {
  includeTranslationKeys: false,
})
</script>

<template>
  <div class="space-y-4">
    <h3 class="flex items-center text-base text-zinc-900 font-medium space-x-2 dark:text-zinc-100">
      <i class="i-carbon-settings text-blue-600" />
      <span>{{ $t('export.confirmation.exportOptions') }}</span>
    </h3>

    <div class="rounded-lg bg-zinc-50 p-4 space-y-2 dark:bg-zinc-700">
      <div class="flex items-center justify-between text-sm">
        <span class="text-zinc-600 dark:text-zinc-300">{{ $t('export.settings.includeTranslationKeys') }}</span>
        <span class="text-zinc-900 dark:text-zinc-100">
          {{ props.includeTranslationKeys ? $t('common.enabled') : $t('common.disabled') }}
        </span>
      </div>

      <div class="flex items-center justify-between text-sm">
        <span class="text-zinc-600 dark:text-zinc-300">{{ $t('export.confirmation.estimatedSize') }}</span>
        <span class="text-zinc-900 dark:text-zinc-100">
          {{ estimatedSize }}
        </span>
      </div>
    </div>
  </div>
</template>
