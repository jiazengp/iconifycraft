<script setup lang="ts">
import Card from '~/components/base/Card.vue'

interface Props {
  canGenerate: boolean
  isGenerating: boolean
  canExport: boolean
  canSave?: boolean
  isSaving?: boolean
  unified?: boolean
}

interface Emits {
  (e: 'generateAtlas'): void
  (e: 'openExport'): void
  (e: 'saveInstance'): void
}

withDefaults(defineProps<Props>(), {
  unified: false,
  canSave: false,
  isSaving: false,
})
defineEmits<Emits>()
</script>

<template>
  <Card
    v-if="!unified"
    :title="$t('actions.title')"
    icon="i-lucide-play"
  >
    <div class="space-y-3">
      <button
        class="w-full btn"
        :disabled="!canGenerate || isGenerating"
        @click="$emit('generateAtlas')"
      >
        <div class="flex items-center justify-center space-x-2">
          <i
            v-if="isGenerating"
            class="i-lucide-loader-2 animate-spin text-sm"
          />
          <i
            v-else
            class="i-lucide-zap text-sm"
          />
          <span>{{ isGenerating ? $t('actions.generating') : $t('actions.generateAtlas') }}</span>
        </div>
      </button>

      <button
        class="w-full btn-secondary"
        :disabled="!canExport"
        @click="$emit('openExport')"
      >
        <div class="flex items-center justify-center space-x-2">
          <i class="i-lucide-download text-sm" />
          <span>{{ $t('actions.exportPack') }}</span>
        </div>
      </button>

      <button
        v-if="canSave"
        class="w-full btn"
        :disabled="!canSave || isSaving"
        @click="$emit('saveInstance')"
      >
        <div class="flex items-center justify-center space-x-2">
          <i
            v-if="isSaving"
            class="i-lucide-loader-2 animate-spin text-sm"
          />
          <i
            v-else
            class="i-lucide-save text-sm"
          />
          <span>{{ isSaving ? $t('actions.saving') : $t('actions.saveInstance') }}</span>
        </div>
      </button>
    </div>
  </Card>

  <!-- Unified layout -->
  <div v-else class="space-y-4">
    <!-- Section header -->
    <div class="mb-4 flex items-center space-x-3">
      <i class="i-lucide-play text-lg text-muted-foreground" />
      <h3 class="text-base text-foreground font-semibold tracking-tight">
        {{ $t('actions.title') }}
      </h3>
    </div>

    <div class="space-y-3">
      <button
        class="w-full btn"
        :disabled="!canGenerate || isGenerating"
        @click="$emit('generateAtlas')"
      >
        <div class="flex items-center justify-center space-x-2">
          <i
            v-if="isGenerating"
            class="i-lucide-loader-2 animate-spin text-sm"
          />
          <i
            v-else
            class="i-lucide-zap text-sm"
          />
          <span>{{ isGenerating ? $t('actions.generating') : $t('actions.generateAtlas') }}</span>
        </div>
      </button>

      <button
        class="w-full btn-secondary"
        :disabled="!canExport"
        @click="$emit('openExport')"
      >
        <div class="flex items-center justify-center space-x-2">
          <i class="i-lucide-download text-sm" />
          <span>{{ $t('actions.exportPack') }}</span>
        </div>
      </button>

      <button
        v-if="canSave"
        class="w-full btn-secondary"
        :disabled="!canSave || isSaving"
        @click="$emit('saveInstance')"
      >
        <div class="flex items-center justify-center space-x-2">
          <i
            v-if="isSaving"
            class="i-lucide-loader-2 animate-spin text-sm"
          />
          <i
            v-else
            class="i-lucide-save text-sm"
          />
          <span>{{ isSaving ? $t('actions.saving') : $t('actions.saveInstance') }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
