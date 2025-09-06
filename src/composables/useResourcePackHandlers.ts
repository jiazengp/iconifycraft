import type { ResourcePack } from '~/types/resource-pack'
import { useDebounceFn } from '@vueuse/core'
import { logger } from '~/utils/logger'
import { useAppSettings } from './useAppSettings'
import { useInstanceManager } from './useInstanceManager'
import { useUnsavedChanges } from './useUnsavedChanges'

export function useResourcePackHandlers(
  resourcePacks: Ref<ResourcePack[]>,
  selectedVersion: Ref<string | null>,
  namespace: Ref<string>,
  currentAtlasImage: ComputedRef<string | null>,
) {
  const { updateTrackedState } = useUnsavedChanges()
  const { autoSaveInstance } = useInstanceManager()
  const { autoSaveEnabled, autoSaveInterval } = useAppSettings()

  async function performAutoSave() {
    if (!autoSaveEnabled.value || !resourcePacks.value.length || !selectedVersion.value) {
      return
    }

    try {
      await autoSaveInstance(
        selectedVersion.value,
        namespace.value,
        resourcePacks.value,
        {
          generateThumbnail: false,
          atlasImage: currentAtlasImage.value ?? undefined,
        },
      )
    }
    catch (error) {
      logger.warn('Auto save failed:', error)
    }
  }

  const debouncedAutoSave = useDebounceFn(performAutoSave, autoSaveInterval)

  function handleVanillaPacksLoaded(packs: ResourcePack[]) {
    resourcePacks.value = resourcePacks.value.filter(pack => !pack.isVanilla)
    resourcePacks.value.push(...packs)
    updateTrackedState({ resourcePacks: resourcePacks.value })
    debouncedAutoSave()
  }

  function handlePacksUploaded(packs: ResourcePack[]) {
    const firstVanillaIndex = resourcePacks.value.findIndex(pack => pack.isVanilla)
    const insertIndex = firstVanillaIndex >= 0 ? firstVanillaIndex : resourcePacks.value.length

    resourcePacks.value.splice(insertIndex, 0, ...packs)
    updateTrackedState({ resourcePacks: resourcePacks.value })
    debouncedAutoSave()
  }

  function handlePackRemoved(packId: string) {
    const index = resourcePacks.value.findIndex(pack => pack.id === packId)
    if (index >= 0) {
      resourcePacks.value.splice(index, 1)
      updateTrackedState({ resourcePacks: resourcePacks.value })
      debouncedAutoSave()
    }
  }

  function handlePacksReordered(packs: ResourcePack[]) {
    resourcePacks.value = packs
    updateTrackedState({ resourcePacks: resourcePacks.value })
    debouncedAutoSave()
  }

  return {
    handleVanillaPacksLoaded,
    handlePacksUploaded,
    handlePackRemoved,
    handlePacksReordered,
    debouncedAutoSave,
  }
}
