import type { AtlasResult } from '~/types/atlas'
import type { SavedInstance } from '~/types/instance'
import type { ResourcePack } from '~/types/resource-pack'
import { useTimeoutFn } from '@vueuse/core'
import { nextTick, watchEffect } from 'vue'
import { useInstanceManager } from './useInstanceManager'
import { useNotification } from './useNotification'
import { useUnsavedChanges } from './useUnsavedChanges'

export function useAtlasHandlers(
  props: { initialInstance?: SavedInstance },
  selectedVersion: Ref<string | null>,
  namespace: Ref<string>,
  resourcePacks: Ref<ResourcePack[]>,
  generateAtlas: () => Promise<AtlasResult | null>,
  debouncedAutoSave: () => void,
) {
  const { updateTrackedState, startTracking } = useUnsavedChanges()
  const { saveInstance } = useInstanceManager()
  const { showSuccess } = useNotification()
  const { t } = useI18n()

  async function handleGenerateAtlas() {
    const result = await generateAtlas()
    if (result) {
      updateTrackedState({
        atlasGenerated: true,
        atlasResult: result,
      })
      debouncedAutoSave()
    }
    return result
  }

  function createSaveHandler(currentAtlasImage: ComputedRef<string | null>, currentExportData: Ref<{ packIcon?: Uint8Array } | null>) {
    return async function handleSaveInstance() {
      if (!resourcePacks.value.length)
        return

      const instanceId = await saveInstance(
        selectedVersion.value || '',
        namespace.value,
        resourcePacks.value,
        {
          generateThumbnail: true,
          atlasImage: currentAtlasImage.value ?? undefined,
          packIcon: currentExportData.value?.packIcon,
        },
      )

      if (instanceId) {
        showSuccess(t('instances.save.success'), {
          message: `📦 ${resourcePacks.value.length} resource pack${resourcePacks.value.length === 1 ? '' : 's'} • ${selectedVersion.value}`,
        })
      }
    }
  }

  function initializeInstanceData() {
    watchEffect(async () => {
      if (props.initialInstance) {
        const instance = props.initialInstance

        selectedVersion.value = instance.minecraftVersion
        namespace.value = instance.namespace
        resourcePacks.value = [...instance.resourcePacks]

        startTracking({
          resourcePacks: instance.resourcePacks,
          minecraftVersion: instance.minecraftVersion,
          namespace: instance.namespace,
          atlasGenerated: false,
          atlasResult: null,
        })

        if (instance.resourcePacks.length > 0) {
          await nextTick()

          const { start } = useTimeoutFn(async () => {
            const result = await handleGenerateAtlas()
            if (result) {
              showSuccess(t('instances.load.atlasGenerated'), {
                message: `${result.metadata.totalTextures} textures loaded`,
              })
            }
          }, 500)

          start()
        }
      }
    })
  }

  return {
    handleGenerateAtlas,
    createSaveHandler,
    initializeInstanceData,
  }
}
