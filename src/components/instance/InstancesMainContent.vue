<script setup lang="ts">
import type { SavedInstance } from '~/types/instance'
import { useLocalizedRouter } from '~/composables/useLocalizedRouter'

// 创建一个只包含显示所需字段的实例类型
type InstanceDisplayData = Pick<SavedInstance, 'id' | 'name' | 'minecraftVersion' | 'icon' | 'createdAt' | 'updatedAt' | 'metadata' | 'namespace' | 'resourcePacks'>

defineProps<{
  loading: boolean
  hasInstances: boolean
  filteredInstances: InstanceDisplayData[]
  viewMode: 'grid' | 'list'
}>()

defineEmits<{
  openInstance: [instanceId: string]
  deleteInstance: [instanceId: string]
  renameInstance: [instanceId: string]
  clearFilters: []
}>()

const { localizeRoute } = useLocalizedRouter()

function getViewModeClasses(viewMode: 'grid' | 'list') {
  return {
    'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4': viewMode === 'grid',
    'space-y-2': viewMode === 'list',
  }
}
</script>

<template>
  <main class="lg:col-span-3">
    <template v-if="loading">
      <div class="mb-4">
        <div class="h-5 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div :class="getViewModeClasses(viewMode)">
        <InstanceCardSkeleton v-for="n in 6" :key="n" :view-mode="viewMode" />
      </div>
    </template>

    <template v-else>
      <div class="mb-4">
        <h2 class="text-base text-zinc-900 font-semibold tracking-tight dark:text-zinc-100">
          {{ $t('instances.projects.title') }}
        </h2>
      </div>

      <EmptyState
        v-if="!hasInstances"
        icon="i-lucide-folder-open"
        :title="$t('instances.empty.title')"
        :description="$t('instances.empty.description')"
        class="empty-state"
      >
        <template #action>
          <router-link
            :to="localizeRoute('/')"
            class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium transition-colors hover:bg-blue-700"
          >
            <i class="i-lucide-plus mr-2 text-sm" />
            {{ $t('instances.createFirst') }}
          </router-link>
        </template>
      </EmptyState>

      <EmptyState
        v-else-if="!filteredInstances.length"
        icon="i-lucide-search-x"
        :title="$t('instances.noResults.title')"
        :description="$t('instances.noResults.description')"
        class="empty-state"
      >
        <template #action>
          <button
            class="inline-flex items-center border border-zinc-200 rounded-lg bg-white px-4 py-2 text-sm text-zinc-700 font-medium transition-colors dark:border-zinc-700 dark:bg-zinc-800 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
            @click="$emit('clearFilters')"
          >
            {{ $t('instances.clearFilters') }}
          </button>
        </template>
      </EmptyState>

      <div
        v-else
        :class="getViewModeClasses(viewMode)"
        class="slide-enter-content instances-grid"
      >
        <InstanceCard
          v-for="instance in filteredInstances"
          :key="instance.id"
          :instance="instance"
          :view-mode="viewMode"
          @open="$emit('openInstance', $event)"
          @delete="$emit('deleteInstance', $event)"
          @rename="$emit('renameInstance', $event)"
        />
      </div>
    </template>
  </main>
</template>
