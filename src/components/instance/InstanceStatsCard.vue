<script setup lang="ts">
import type { InstanceStats } from '~/types/instance'
import NumberTicker from '~/components/base/NumberTicker.vue'

interface Props {
  stats: InstanceStats | null
}

defineProps<Props>()
const { t } = useI18n()

function formatStorage(bytes: number): { value: number, unit: string } {
  if (bytes === 0)
    return { value: 0, unit: 'B' }

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return {
    value: Number((bytes / k ** i).toFixed(1)),
    unit: sizes[i],
  }
}
</script>

<template>
  <div class="stats-card">
    <h3 class="stats-title">
      <i class="i-lucide-bar-chart-3" />
      {{ t('instances.usage.title') }}
    </h3>

    <div v-if="!stats" class="stats-loading">
      <i class="i-lucide-loader-2 animate-spin text-sm" />
      <span class="text-xs">{{ t('common.loading') }}</span>
    </div>

    <div v-else class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">
          <NumberTicker
            :value="stats.totalInstances"
            :decimal-places="0"
            :duration="1000"
            direction="up"
          />
        </div>
        <div class="stat-label">
          {{ t('instances.stats.total') }}
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-value">
          <NumberTicker
            :value="formatStorage(stats.totalSize).value"
            :decimal-places="1"
            :duration="1200"
            direction="up"
          />
          <span class="stat-unit">{{ formatStorage(stats.totalSize).unit }}</span>
        </div>
        <div class="stat-label">
          {{ t('instances.stats.storageValue') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  @apply bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700;
  @apply p-4 space-y-4;
}

.stats-title {
  @apply flex items-center space-x-2 text-sm font-medium text-zinc-900 dark:text-zinc-100;
}

.stats-title i {
  @apply text-blue-600 dark:text-blue-400;
}

.stats-loading {
  @apply flex items-center space-x-2 text-zinc-500 dark:text-zinc-400;
  @apply py-6 justify-center;
}

.stats-grid {
  @apply space-y-3;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply text-lg font-bold text-zinc-900 dark:text-zinc-100;
  @apply flex items-baseline gap-1 justify-center;
}

.stat-unit {
  @apply text-sm font-medium text-zinc-600 dark:text-zinc-400;
}

.stat-label {
  @apply text-xs text-zinc-500 dark:text-zinc-400 mt-1;
}
</style>
