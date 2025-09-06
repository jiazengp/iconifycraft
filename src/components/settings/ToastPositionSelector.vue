<script setup lang="ts">
import type { ToastPosition } from '~/composables/useAppSettings'
import { computed } from 'vue'
import { useNotification } from '~/composables/useNotification'

interface Props {
  modelValue: ToastPosition
}

interface Emits {
  'update:modelValue': [value: ToastPosition]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { showInfo } = useNotification()
const { t } = useI18n()

const selectedPosition = computed({
  get: () => props.modelValue,
  set: (value: ToastPosition) => emit('update:modelValue', value),
})

const positions: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

function getPositionIcon(position: ToastPosition): string {
  const icons = {
    'top-left': 'i-lucide-arrow-up-left',
    'top-center': 'i-lucide-arrow-up',
    'top-right': 'i-lucide-arrow-up-right',
    'bottom-left': 'i-lucide-arrow-down-left',
    'bottom-center': 'i-lucide-arrow-down',
    'bottom-right': 'i-lucide-arrow-down-right',
  }
  return icons[position]
}

function getPositionLabel(position: ToastPosition): string {
  const labels = {
    'top-left': t('settings.appearance.toastPosition.positions.topLeft'),
    'top-center': t('settings.appearance.toastPosition.positions.topCenter'),
    'top-right': t('settings.appearance.toastPosition.positions.topRight'),
    'bottom-left': t('settings.appearance.toastPosition.positions.bottomLeft'),
    'bottom-center': t('settings.appearance.toastPosition.positions.bottomCenter'),
    'bottom-right': t('settings.appearance.toastPosition.positions.bottomRight'),
  }
  return labels[position] || position
}

function nextPosition() {
  const currentIndex = positions.indexOf(selectedPosition.value)
  const nextIndex = (currentIndex + 1) % positions.length
  selectedPosition.value = positions[nextIndex]

  // 自动触发测试通知
  showInfo(t('settings.appearance.toastPosition.test.title'), {
    description: t('settings.appearance.toastPosition.test.description', { position: getPositionLabel(selectedPosition.value) }),
  })
}
</script>

<template>
  <div class="toast-position-selector">
    <button
      type="button"
      class="position-button"
      :title="t('settings.appearance.toastPosition.switchPosition')"
      @click="nextPosition"
    >
      <i :class="getPositionIcon(selectedPosition)" class="h-5 w-5 transform transition-all duration-300 ease-in-out" />
      <span class="position-label">{{ getPositionLabel(selectedPosition) }}</span>
    </button>

    <!-- 当前位置描述 -->
    <p class="position-description">
      {{ t('settings.appearance.toastPosition.current', { position: getPositionLabel(selectedPosition) }) }}
    </p>
  </div>
</template>

<style scoped>
.toast-position-selector {
  @apply w-full space-y-3;
}

.position-button {
  @apply inline-flex items-center space-x-3 px-4 py-3 text-left border border-zinc-300 dark:border-zinc-600
         rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50
         focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-400
         transition-all duration-300 ease-in-out;
}

.position-button:hover {
  @apply border-zinc-400 dark:border-zinc-500;
}

.position-button:active {
  @apply scale-95;
}

.position-label {
  @apply text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-all duration-300 ease-in-out;
}

.position-description {
  @apply text-sm text-zinc-600 dark:text-zinc-400 transition-all duration-300 ease-in-out;
}

@media (max-width: 640px) {
  .position-button {
    @apply px-3 py-2;
  }

  .position-label {
    @apply text-xs;
  }

  .position-description {
    @apply text-xs;
  }
}
</style>
