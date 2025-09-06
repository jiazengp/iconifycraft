<script setup lang="ts">
import type { SavedInstance } from '~/types/instance'
import Time from '~/components/base/Time.vue'
import { logger } from '~/utils/logger'

interface Props {
  instances: SavedInstance[]
}

const props = defineProps<Props>()
defineEmits<{
  open: [id: string]
}>()

const { t } = useI18n()

async function renderIcon(canvas: HTMLCanvasElement, instance: SavedInstance) {
  if (!instance.icon)
    return

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  ctx.clearRect(0, 0, 24, 24)
  ctx.imageSmoothingEnabled = false

  try {
    const blob = new Blob([new Uint8Array(instance.icon)], { type: 'image/png' })
    const img = new Image()
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 24, 24)
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
    }
    img.src = url
  }
  catch (error) {
    logger.error('Error rendering instance icon:', error)
  }
}

onMounted(() => {
  props.instances.forEach((instance: SavedInstance) => {
    const canvas = document.querySelector(`#icon-${instance.id}`) as HTMLCanvasElement
    if (canvas) {
      renderIcon(canvas, instance)
    }
  })
})
</script>

<template>
  <div class="recent-instances-card">
    <h3 class="recent-title">
      <i class="i-lucide-clock" />
      {{ t('instances.recent.title') }}
    </h3>

    <div v-if="instances.length === 0" class="empty-recent">
      <i class="i-lucide-folder-open text-lg text-zinc-400" />
      <span class="text-xs text-zinc-500 dark:text-zinc-400">
        {{ t('instances.recent.empty') }}
      </span>
    </div>

    <div v-else class="recent-list">
      <button
        v-for="instance in instances"
        :key="instance.id"
        class="recent-item"
        @click="$emit('open', instance.id)"
      >
        <div class="recent-icon">
          <canvas
            v-if="instance.icon"
            :id="`icon-${instance.id}`"
            width="24"
            height="24"
            class="icon-canvas"
          />
          <i v-else class="i-lucide-package text-sm text-zinc-400" />
        </div>

        <div class="recent-content">
          <div class="recent-name">
            {{ instance.name }}
          </div>
          <div class="recent-meta">
            <span class="recent-version">{{ instance.minecraftVersion }}</span>
            <Time v-if="instance.lastOpenedAt" :datetime="instance.lastOpenedAt" relative class="recent-time" />
          </div>
        </div>

        <i class="i-lucide-chevron-right text-xs text-zinc-400" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.recent-instances-card {
  @apply bg-card rounded-lg border border-border;
  @apply p-4 space-y-4;
}

.recent-title {
  @apply flex items-center space-x-2 text-sm font-medium text-zinc-900 dark:text-zinc-100;
}

.recent-title i {
  @apply text-green-600 dark:text-green-400;
}

.empty-recent {
  @apply flex flex-col items-center space-y-2 py-6 text-center;
}

.recent-list {
  @apply space-y-1;
}

.recent-item {
  @apply w-full flex items-center space-x-3 p-2 rounded-md;
  @apply text-left transition-colors duration-150;
  @apply hover:bg-zinc-50 dark:hover:bg-zinc-800;
}

.recent-icon {
  @apply w-6 h-6 flex-shrink-0 flex items-center justify-center;
  @apply bg-zinc-100 dark:bg-zinc-700 rounded border;
}

.icon-canvas {
  @apply w-full h-full;
  image-rendering: pixelated;
}

.recent-content {
  @apply flex-1 min-w-0;
}

.recent-name {
  @apply text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate;
}

.recent-meta {
  @apply flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5;
}

.recent-version {
  @apply px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300;
  @apply rounded-full text-xs font-medium;
}

.recent-time::before {
  content: '•';
  @apply mx-1;
}
</style>
