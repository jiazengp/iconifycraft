<script setup lang="ts">
import type { IconValidationResult } from '~/services/core/PackIconService'
import { onUnmounted, ref, watch } from 'vue'
import { usePackIconUploader } from '~/composables/usePackIconUploader'
import PackIconOptimizer from './PackIconOptimizer.vue'
import PackIconPreview from './PackIconPreview.vue'
import PackIconUploadZone from './PackIconUploadZone.vue'
import PackIconValidation from './PackIconValidation.vue'

const props = defineProps<{
  modelValue?: File | null
}>()

const emit = defineEmits<{
  iconChange: [file: File | null]
  validationChange: [result: IconValidationResult | null]
}>()

// 使用组合式API管理状态和逻辑
const {
  currentIcon,
  iconPreviewUrl,
  iconInfo,
  validationResult,
  isOptimizing,
  requirementsText,
  hasErrors,
  isValid,
  handleFile,
  removeIcon,
  optimizeIcon,
  cleanup,
} = usePackIconUploader(props.modelValue)

// UI状态
const showRequirements = ref(false)
const fileInput = ref<HTMLInputElement>()

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== currentIcon.value) {
    currentIcon.value = newValue || null
  }
})

// 监听图标变化并通知父组件
watch(currentIcon, (newIcon) => {
  emit('iconChange', newIcon)
})

// 监听验证结果变化并通知父组件
watch(validationResult, (result) => {
  emit('validationChange', result)
})

// 文件上传相关方法
function triggerFileUpload() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    handleFile(file)
  }
}

function handleRemoveIcon() {
  removeIcon()

  // 清除文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleOptimize(targetSize?: number) {
  optimizeIcon(targetSize)
}

// 清理资源
onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="pack-icon-uploader">
    <!-- 标题和操作栏 -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h4 class="text-gray-900 font-medium dark:text-gray-100">
          {{ $t('packIcon.title') }}
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('packIcon.description') }}
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <button
          v-if="currentIcon"
          class="border border-gray-300 rounded px-3 py-1 text-xs dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="handleRemoveIcon"
        >
          {{ $t('packIcon.actions.remove') }}
        </button>

        <button
          class="border border-gray-300 rounded px-3 py-1 text-xs dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="showRequirements = !showRequirements"
        >
          <i class="i-carbon-information mr-1" />
          {{ $t('packIcon.actions.showRequirements') }}
        </button>
      </div>
    </div>

    <!-- 要求说明 -->
    <div
      v-if="showRequirements"
      class="mb-4 border border-blue-200 rounded-lg bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
    >
      <h5 class="mb-2 text-blue-900 font-medium dark:text-blue-100">
        <i class="i-carbon-information-filled mr-1" />
        {{ $t('packIcon.requirements.title') }}
      </h5>
      <div class="whitespace-pre-line text-sm text-blue-800 dark:text-blue-200">
        {{ requirementsText }}
      </div>
    </div>

    <!-- 上传区域或当前图标显示 -->
    <div class="icon-area">
      <PackIconUploadZone
        v-if="!currentIcon"
        :has-errors="hasErrors"
        @upload-trigger="triggerFileUpload"
        @file-drop="handleFile"
      />

      <PackIconPreview
        v-else
        :icon="currentIcon"
        :preview-url="iconPreviewUrl"
        :icon-info="iconInfo"
        @remove="handleRemoveIcon"
        @reupload="triggerFileUpload"
      />
    </div>

    <!-- 验证结果 -->
    <PackIconValidation
      v-if="validationResult"
      :validation-result="validationResult"
      class="mt-4"
    />

    <!-- 优化选项 -->
    <PackIconOptimizer
      v-if="currentIcon && isValid"
      :is-optimizing="isOptimizing"
      class="mt-4"
      @optimize="handleOptimize"
    />

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/png"
      class="hidden"
      @change="handleFileChange"
    >
  </div>
</template>
