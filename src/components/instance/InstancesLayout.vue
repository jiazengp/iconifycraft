<script setup lang="ts">
import { tryOnMounted } from '@vueuse/core'
import { useInstancesView } from '~/composables/useInstancesView'

const {
  searchQuery,
  selectedVersion,
  viewMode,
  showDeleteDialog,
  showRenameDialog,
  filteredInstances,
  availableVersions,
  recentInstances,
  selectedInstance,
  hasInstances,
  loading,
  statsLoading,
  stats,
  refreshInstances,
  getIconUrl,
  handleOpenInstance,
  handleDeleteInstance,
  handleConfirmDelete,
  handleRenameInstance,
  handleConfirmRename,
  handleClearFilters,
  handleViewModeChange,
  handleSearchChange,
  handleVersionFilter,
} = useInstancesView()

tryOnMounted(refreshInstances)
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950">
    <div class="mx-auto max-w-7xl px-4 py-6 lg:px-8 sm:px-6">
      <InstancesToolbar
        :search-query="searchQuery"
        :selected-version="selectedVersion"
        :available-versions="availableVersions"
        :view-mode="viewMode"
        @update:search-query="handleSearchChange"
        @update:selected-version="handleVersionFilter"
        @update:view-mode="handleViewModeChange"
      />

      <div class="slide-enter-content grid grid-cols-1 gap-6 lg:grid-cols-4 xl:gap-8">
        <InstancesSidebar
          :loading="loading"
          :stats-loading="statsLoading"
          :stats="stats"
          :recent-instances="recentInstances"
          :get-icon-url="getIconUrl"
          @open-instance="handleOpenInstance"
        />

        <InstancesMainContent
          :loading="loading"
          :has-instances="hasInstances"
          :filtered-instances="filteredInstances"
          :view-mode="viewMode"
          @open-instance="handleOpenInstance"
          @delete-instance="handleDeleteInstance"
          @rename-instance="handleRenameInstance"
          @clear-filters="handleClearFilters"
        />
      </div>
    </div>

    <InstancesDialogs
      :show-delete-dialog="showDeleteDialog"
      :show-rename-dialog="showRenameDialog"
      :selected-instance="selectedInstance"
      @update:show-delete-dialog="showDeleteDialog = $event"
      @update:show-rename-dialog="showRenameDialog = $event"
      @confirm-delete="handleConfirmDelete"
      @confirm-rename="handleConfirmRename"
    />
  </div>
</template>
