import type { ResourcePack } from '~/types/resource-pack'
import NProgress from 'nprogress'
import { ref } from 'vue'
import { VanillaPackService } from '~/services/core/VanillaPackService'
import { useNotification } from './useNotification'

interface VanillaPackNames {
  item?: string
  block?: string
}

export function useVanillaPack() {
  const { showSuccess, showError } = useNotification()
  const { t } = useI18n()

  const vanillaPackService = new VanillaPackService()
  const isLoading = ref(false)

  async function loadVanillaPacks(
    version: string,
    packNames?: VanillaPackNames,
  ): Promise<ResourcePack[]> {
    if (isLoading.value)
      return []

    isLoading.value = true
    NProgress.start()

    try {
      const result = await vanillaPackService.loadVanillaPacks(
        version,
        packNames,
        (progress) => {
          NProgress.set(progress)
        },
      )

      const loadedPacks: ResourcePack[] = []
      if (result.itemPack)
        loadedPacks.push(result.itemPack)
      if (result.blockPack)
        loadedPacks.push(result.blockPack)

      if (loadedPacks.length > 0) {
        showSuccess(t('vanilla.loaded', { version }), {
          message: `Loaded ${result.totalTextures} textures`,
        })
      }

      return loadedPacks
    }
    catch (error) {
      showError(t('vanilla.loadFailed'), {
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      return []
    }
    finally {
      isLoading.value = false
      NProgress.done()
    }
  }

  async function checkAvailability(version: string) {
    try {
      return await vanillaPackService.checkVanillaAvailability(version)
    }
    catch {
      return { hasItems: false, hasBlocks: false }
    }
  }

  return {
    isLoading: readonly(isLoading),
    loadVanillaPacks,
    checkAvailability,
  }
}
