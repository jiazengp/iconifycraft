import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { toast } from 'vue-sonner'
import { useInstanceManager } from '~/composables/useInstanceManager'
import { useViewTransition } from '~/composables/useViewTransition'
import { logger } from '~/utils/logger'

export function useInstancesView() {
  const {
    instances,
    hasInstances,
    loading,
    statsLoading,
    stats,
    deleteInstance,
    renameInstance,
    navigateToInstance,
    refreshInstances,
    cleanupOldInstances,
    getRecentInstances,
  } = useInstanceManager()

  const { t } = useI18n()
  const { startTransition } = useViewTransition()

  const searchQuery = ref('')
  const selectedVersion = ref('')
  const viewMode = ref<'grid' | 'list'>('grid')
  const showDeleteDialog = ref(false)
  const showRenameDialog = ref(false)
  const instanceToDelete = ref<string | null>(null)
  const instanceToRename = ref<string | null>(null)
  const iconUrls = ref<Record<string, string>>({})

  const filteredInstances = computed(() => {
    let filtered = [...instances.value]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(instance =>
        instance.name.toLowerCase().includes(query)
        || instance.minecraftVersion.toLowerCase().includes(query),
      )
    }

    if (selectedVersion.value) {
      filtered = filtered.filter(instance =>
        instance.minecraftVersion === selectedVersion.value,
      )
    }

    return filtered
  })

  const availableVersions = computed(() =>
    Array.from(new Set(instances.value.map(i => i.minecraftVersion))).sort(),
  )

  const recentInstances = computed(() => getRecentInstances(5))

  const selectedInstance = computed(() => {
    const targetId = instanceToDelete.value || instanceToRename.value
    return targetId ? instances.value.find(i => i.id === targetId) || null : null
  })

  watchEffect(() => {
    const currentInstanceIds = new Set(instances.value.map(i => i.id))

    Object.keys(iconUrls.value).forEach((id) => {
      if (!currentInstanceIds.has(id)) {
        URL.revokeObjectURL(iconUrls.value[id])
        delete iconUrls.value[id]
      }
    })

    instances.value.forEach((instance) => {
      if (instance.icon && !iconUrls.value[instance.id]) {
        try {
          const blob = new Blob([new Uint8Array(instance.icon)], { type: 'image/png' })
          iconUrls.value[instance.id] = URL.createObjectURL(blob)
        }
        catch (error) {
          logger.error('Error creating icon URL for instance', instance.id, error)
        }
      }
    })
  })

  const getIconUrl = (instance: { id: string, icon?: Uint8Array | null }): string | null =>
    instance.icon ? iconUrls.value[instance.id] || null : null

  const createTransition = (name: string, action: () => void) =>
    startTransition(action, { name, fallback: action })

  const handleOpenInstance = (instanceId: string) => navigateToInstance(instanceId)

  const handleDeleteInstance = (instanceId: string) => {
    instanceToDelete.value = instanceId
    showDeleteDialog.value = true
  }

  const handleConfirmDelete = async () => {
    if (!instanceToDelete.value)
      return

    try {
      const instanceName = instances.value.find(i => i.id === instanceToDelete.value)?.name || ''
      await deleteInstance(instanceToDelete.value)
      showDeleteDialog.value = false
      instanceToDelete.value = null

      toast.success(t('instances.delete.success'), {
        description: instanceName ? t('instances.delete.successMessage', { name: instanceName }) : undefined,
      })
    }
    catch (error) {
      toast.error(t('instances.delete.failed'), {
        description: error instanceof Error ? error.message : t('instances.delete.unknownError'),
      })
    }
  }

  const handleRenameInstance = (instanceId: string) => {
    instanceToRename.value = instanceId
    showRenameDialog.value = true
  }

  const handleConfirmRename = async (newName: string) => {
    if (!instanceToRename.value || !newName.trim())
      return

    try {
      await renameInstance(instanceToRename.value, newName.trim())
      showRenameDialog.value = false
      instanceToRename.value = null

      toast.success(t('instances.rename.success', { name: newName.trim() }))
    }
    catch (error) {
      toast.error(t('instances.rename.failed'), {
        description: error instanceof Error ? error.message : t('instances.rename.unknownError'),
      })
    }
  }

  const handleCleanup = () => cleanupOldInstances(50)

  const handleClearFilters = () => createTransition('filter', () => {
    searchQuery.value = ''
    selectedVersion.value = ''
  })

  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    if (newMode !== viewMode.value) {
      createTransition('view-mode', () => {
        viewMode.value = newMode
      })
    }
  }

  let searchTimeout: ReturnType<typeof setTimeout>
  const handleSearchChange = (query: string) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() =>
      createTransition('search', () => { searchQuery.value = query }), 300)
  }

  const handleVersionFilter = (version: string) =>
    createTransition('filter', () => { selectedVersion.value = version })

  onUnmounted(() => {
    Object.values(iconUrls.value).forEach(url => URL.revokeObjectURL(url))
  })

  return {
    searchQuery,
    selectedVersion,
    viewMode,
    showDeleteDialog,
    showRenameDialog,
    filteredInstances,
    availableVersions,
    recentInstances,
    selectedInstance,
    instances,
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
    handleCleanup,
    handleClearFilters,
    handleViewModeChange,
    handleSearchChange,
    handleVersionFilter,
  }
}
