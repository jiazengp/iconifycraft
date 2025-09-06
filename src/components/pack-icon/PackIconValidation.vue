<script setup lang="ts">
import type { IconValidationResult } from '~/services/core/PackIconService'

defineProps<{
  validationResult?: IconValidationResult | null
}>()
</script>

<template>
  <div v-if="validationResult" class="validation-results">
    <!-- 错误信息 -->
    <div
      v-if="validationResult.errors.length > 0"
      class="mb-3 border border-red-200 rounded-lg bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
    >
      <div class="mb-2 flex items-center">
        <i class="i-carbon-warning-filled mr-2 text-red-600" />
        <h5 class="text-red-800 font-medium dark:text-red-200">
          {{ $t('packIcon.validation.errors') }}
        </h5>
      </div>
      <ul class="text-sm text-red-700 space-y-1 dark:text-red-300">
        <li v-for="error in validationResult.errors" :key="error">
          • {{ error }}
        </li>
      </ul>
    </div>

    <!-- 警告信息 -->
    <div
      v-if="validationResult.warnings.length > 0"
      class="mb-3 border border-yellow-200 rounded-lg bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
    >
      <div class="mb-2 flex items-center">
        <i class="i-carbon-warning-alt mr-2 text-yellow-600" />
        <h5 class="text-yellow-800 font-medium dark:text-yellow-200">
          {{ $t('packIcon.validation.warnings') }}
        </h5>
      </div>
      <ul class="text-sm text-yellow-700 space-y-1 dark:text-yellow-300">
        <li v-for="warning in validationResult.warnings" :key="warning">
          • {{ warning }}
        </li>
      </ul>
    </div>

    <!-- 成功信息 -->
    <div
      v-if="validationResult.isValid && validationResult.warnings.length === 0"
      class="border border-green-200 rounded-lg bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
    >
      <div class="flex items-center">
        <i class="i-carbon-checkmark-filled mr-2 text-green-600" />
        <span class="text-green-800 dark:text-green-200">
          {{ $t('packIcon.validation.success') }}
        </span>
      </div>
    </div>
  </div>
</template>
