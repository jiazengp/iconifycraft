<script setup lang="ts">
import { formatStorage } from '~/utils/format'

interface Instance {
  id: string
  name: string
  minecraftVersion: string
  icon?: Uint8Array
}

interface Stats {
  totalInstances: number
  totalSize: number
}

defineProps<{
  loading: boolean
  statsLoading: boolean
  stats: Stats | null
  recentInstances: Instance[]
  getIconUrl: (instance: Instance) => string | null
}>()

defineEmits<{
  openInstance: [instanceId: string]
}>()
</script>

<template>
  <aside class="lg:col-span-1 space-y-6">
    <UsageStatsSkeleton v-if="statsLoading" />
    <div v-else>
      <h3 class="mb-4 text-base text-zinc-900 font-semibold tracking-tight dark:text-zinc-100">
        {{ $t('instances.usage.title') }}
      </h3>
      <Card padding="md">
        <div v-if="!stats" class="flex items-center py-8">
          <i class="i-lucide-loader-2 mr-2 animate-spin text-sm" />
          <span class="text-sm text-zinc-500">{{ $t('common.loading') }}</span>
        </div>
        <div v-else class="space-y-4">
          <div>
            <div class="text-2xl text-zinc-900 font-bold dark:text-zinc-100">
              {{ stats.totalInstances }}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">
              {{ $t('instances.stats.total') }}
            </div>
          </div>
          <div>
            <div class="text-2xl text-zinc-900 font-bold dark:text-zinc-100">
              {{ formatStorage(stats.totalSize) }}
            </div>
            <div class="text-sm text-zinc-600 dark:text-zinc-400">
              {{ $t('instances.stats.storage') }}
            </div>
          </div>
        </div>
      </Card>
    </div>

    <RecentPreviewsSkeleton v-if="loading" />

    <div v-else-if="recentInstances.length">
      <h3 class="mb-4 text-base text-zinc-900 font-semibold tracking-tight dark:text-zinc-100">
        {{ $t('instances.recentPreviews.title') }}
      </h3>
      <div class="space-y-2">
        <button
          v-for="instance in recentInstances"
          :key="instance.id"
          class="w-full flex items-center border border-zinc-200 rounded-lg bg-white p-3 text-left transition-colors space-x-3 dark:border-zinc-700 hover:border-zinc-300 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          @click="$emit('openInstance', instance.id)"
        >
          <div class="h-8 w-8 flex flex-shrink-0 items-center justify-center">
            <img
              v-if="instance.icon && getIconUrl(instance)"
              :src="getIconUrl(instance)!"
              class="h-8 w-8"
              style="image-rendering: pixelated;"
              alt="Instance icon"
            >
            <i v-else class="i-lucide-package text-lg text-zinc-400" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm text-zinc-900 font-medium dark:text-zinc-100">
              {{ instance.name }}
            </div>
            <div class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ instance.minecraftVersion }}
            </div>
          </div>
        </button>
      </div>
    </div>
  </aside>
</template>
