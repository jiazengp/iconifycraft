<script setup lang="ts">
import BaseDialog from './BaseDialog.vue'

type ConfirmType = 'info' | 'warning' | 'error' | 'success'

interface Props {
  /** 对话框是否打开 */
  open: boolean
  /** 确认类型，影响图标和颜色 */
  type?: ConfirmType
  /** 标题 */
  title: string
  /** 描述内容 */
  description?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 确认按钮是否为危险操作 */
  dangerous?: boolean
  /** 是否正在处理中 */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  showCancel: true,
  dangerous: false,
  loading: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    emit('update:open', value)
    if (!value) {
      emit('cancel')
    }
  },
})

const iconMap = {
  info: 'i-lucide-info',
  warning: 'i-lucide-triangle-alert',
  error: 'i-lucide-circle-x',
  success: 'i-lucide-check-circle',
}

const colorMap = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  success: 'text-green-500',
}

function handleConfirm() {
  if (!props.loading) {
    emit('confirm')
  }
}

function handleCancel() {
  if (!props.loading) {
    isOpen.value = false
  }
}
</script>

<template>
  <BaseDialog
    v-model:open="isOpen"
    :title="title"
    size="md"
  >
    <div class="confirm-dialog">
      <!-- Icon and Content -->
      <div class="confirm-dialog__content">
        <div class="confirm-dialog__icon">
          <i
            :class="[iconMap[type], colorMap[type]]"
            class="text-2xl"
          />
        </div>

        <div class="confirm-dialog__text">
          <h3 class="confirm-dialog__title">
            {{ title }}
          </h3>
          <p v-if="description" class="confirm-dialog__description">
            {{ description }}
          </p>
          <slot />
        </div>
      </div>

      <!-- Actions -->
      <div class="confirm-dialog__actions">
        <button
          v-if="showCancel"
          type="button"
          class="btn-secondary"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText || $t('button.cancel') }}
        </button>

        <button
          type="button"
          :class="dangerous ? 'btn-danger' : 'btn'"
          :disabled="loading"
          @click="handleConfirm"
        >
          <div class="flex items-center space-x-2">
            <i
              v-if="loading"
              class="i-lucide-loader-2 animate-spin text-sm"
            />
            <span>{{ confirmText || $t('button.confirm') }}</span>
          </div>
        </button>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.confirm-dialog {
  @apply space-y-6;
}

.confirm-dialog__content {
  @apply flex items-start space-x-4;
}

.confirm-dialog__icon {
  @apply flex-shrink-0 flex items-center justify-center;
  @apply w-12 h-12;
}

.confirm-dialog__text {
  @apply flex-1 min-w-0;
}

.confirm-dialog__title {
  @apply text-lg font-semibold text-zinc-900 dark:text-zinc-100;
  @apply mb-2 leading-tight;
}

.confirm-dialog__description {
  @apply text-sm text-zinc-600 dark:text-zinc-400;
  @apply leading-relaxed;
}

.confirm-dialog__actions {
  @apply flex items-center justify-end space-x-3;
  @apply pt-4 border-t border-zinc-100 dark:border-zinc-800;
}

/* Button variants */
.btn-danger {
  @apply px-4 py-2 text-sm font-medium rounded-lg;
  @apply bg-red-600 text-white border border-red-600;
  @apply hover:bg-red-700 hover:border-red-700;
  @apply focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors duration-150;
}

.btn-danger:disabled {
  @apply hover:bg-red-600 hover:border-red-600;
}
</style>
