<script setup lang="ts">
import { useLocalizedRouter } from '~/composables/useLocalizedRouter'

interface Props {
  searchQuery: string
  selectedVersion: string
  availableVersions: string[]
  viewMode: 'grid' | 'list'
}

defineProps<Props>()
defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedVersion': [value: string]
  'update:viewMode': [value: 'grid' | 'list']
}>()

const { localizeRoute } = useLocalizedRouter()

function viewModeClass(mode: 'grid' | 'list', current: 'grid' | 'list') {
  return {
    'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400': mode === current,
    'text-zinc-600 dark:text-zinc-400': mode !== current,
  }
}
</script>

<template>
  <div class="slide-enter-content mb-8 h-10 flex items-center space-x-3">
    <div class="slide-enter-content flex-1">
      <SearchInput
        :model-value="searchQuery"
        :placeholder="$t('instances.search.placeholder')"
        @update:model-value="$emit('update:searchQuery', $event)"
      />
    </div>

    <div v-if="availableVersions.length" class="slide-enter-content flex-shrink-0">
      <select
        :value="selectedVersion"
        class="h-10 border border-zinc-200 rounded-lg bg-white px-3 py-2 text-sm dark:border-zinc-700 focus:border-blue-500 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500"
        @change="$emit('update:selectedVersion', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">
          {{ $t('instances.filter.allVersions') }}
        </option>
        <option v-for="version in availableVersions" :key="version" :value="version">
          {{ version }}
        </option>
      </select>
    </div>

    <div class="slide-enter-content h-10 flex overflow-hidden border border-zinc-200 rounded-lg dark:border-zinc-700">
      <button
        :class="viewModeClass('grid', viewMode)"
        class="h-full flex items-center justify-center border-r border-zinc-200 bg-white px-3 transition-colors dark:border-zinc-700 dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700"
        @click="$emit('update:viewMode', 'grid')"
      >
        <i class="i-lucide-grid-3x3 h-4 w-4" />
      </button>
      <button
        :class="viewModeClass('list', viewMode)"
        class="h-full flex items-center justify-center bg-white px-3 transition-colors dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700"
        @click="$emit('update:viewMode', 'list')"
      >
        <i class="i-lucide-list h-4 w-4" />
      </button>
    </div>

    <router-link :to="localizeRoute('/')" class="slide-enter-content h-10 btn inline-flex flex-shrink-0 items-center px-4 text-sm font-medium">
      <i class="i-lucide-plus mr-2 text-sm" />
      {{ $t('instances.createNew') }}
    </router-link>
  </div>
</template>
