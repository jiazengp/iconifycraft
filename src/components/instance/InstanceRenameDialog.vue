<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseDialog from '~/components/base/BaseDialog.vue'

interface Props {
  open: boolean
  currentName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': [newName: string]
}>()

const newName = ref('')
const isSubmitting = ref(false)

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const isValid = computed(() => {
  return newName.value.trim().length > 0 && newName.value.trim() !== props.currentName
})

watch(() => props.open, (open) => {
  if (open) {
    newName.value = props.currentName
    nextTick(() => {
      const input = document.querySelector('.rename-input') as HTMLInputElement
      input?.select()
    })
  }
})

async function handleSubmit() {
  if (!isValid.value || isSubmitting.value)
    return

  isSubmitting.value = true
  try {
    emit('confirm', newName.value.trim())
  }
  finally {
    isSubmitting.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <BaseDialog
    v-model:open="isOpen"
    :title="$t('instances.rename.title')"
    size="md"
  >
    <div class="rename-dialog">
      <div class="rename-content">
        <label for="instance-name" class="rename-label">
          {{ $t('instances.rename.newName') }}
        </label>

        <input
          id="instance-name"
          v-model="newName"
          type="text"
          class="rename-input"
          :placeholder="$t('instances.rename.placeholder')"
          :disabled="isSubmitting"
          @keydown="handleKeydown"
        >

        <p class="rename-hint">
          {{ $t('instances.rename.hint') }}
        </p>
      </div>

      <div class="rename-actions">
        <button
          type="button"
          class="btn-secondary"
          :disabled="isSubmitting"
          @click="isOpen = false"
        >
          {{ $t('button.cancel') }}
        </button>

        <button
          type="button"
          class="btn"
          :disabled="!isValid || isSubmitting"
          @click="handleSubmit"
        >
          <div class="flex items-center space-x-2">
            <i
              v-if="isSubmitting"
              class="i-lucide-loader-2 animate-spin text-sm"
            />
            <span>{{ $t('button.save') }}</span>
          </div>
        </button>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.rename-dialog {
  @apply space-y-6;
}

.rename-content {
  @apply space-y-4;
}

.rename-label {
  @apply block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2;
}

.rename-input {
  @apply w-full px-3 py-2.5 text-sm;
  @apply bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700;
  @apply rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.rename-hint {
  @apply text-xs text-zinc-500 dark:text-zinc-400;
}

.rename-actions {
  @apply flex items-center justify-end space-x-3;
  @apply pt-4 border-t border-zinc-100 dark:border-zinc-800;
}
</style>
