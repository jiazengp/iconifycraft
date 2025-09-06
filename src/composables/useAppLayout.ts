import type { AtlasResult, FontGroup } from '~/types/atlas'
import type { ExportConfirmationData } from '~/types/export'
import type { IconItem } from '~/types/icon'
import type { ResourcePack } from '~/types/resource-pack'
import { computed, ref } from 'vue'
import { useMinecraftStore } from '~/stores/minecraft'

export function useAppLayout() {
  // I18n
  const { t } = useI18n()

  // 使用 Minecraft Store 获取选中的版本
  const minecraftStore = useMinecraftStore()
  const selectedVersion = computed({
    get: () => minecraftStore.selectedVersion,
    set: value => minecraftStore.setSelectedVersion(value),
  })

  // 核心状态
  const resourcePacks = ref<ResourcePack[]>([])
  const namespace = ref('iconifycraft')
  const showIconDetail = ref(false)
  const selectedIcon = ref<IconItem | null>(null)

  // 计算属性
  const versionSelected = computed(() => !!selectedVersion.value)
  const hasResourcePacks = computed(() => resourcePacks.value.length > 0)
  const defaultFontName = computed(() => `${namespace.value}:default`)

  // 工具函数
  function getAllTextures() {
    const allTextures = []
    for (const pack of resourcePacks.value) {
      for (const texture of pack.textures) {
        if ((texture.category === 'item' && texture.fullPath.includes('/textures/item/'))
          || (texture.category === 'block' && texture.fullPath.includes('/textures/block/'))) {
          allTextures.push({
            ...texture,
            sourcePack: pack.name,
          })
        }
      }
    }
    return allTextures
  }

  function openIconDetail(icon: IconItem) {
    selectedIcon.value = icon
    showIconDetail.value = true
  }

  function closeIconDetail() {
    showIconDetail.value = false
    selectedIcon.value = null
  }

  // 计算属性构建器
  function createComputedHelpers(
    currentExportData: Ref<ExportConfirmationData | null>,
    atlasResult: Ref<AtlasResult | null>,
    atlasImage: Ref<string | null>,
  ) {
    const safeExportData = computed(() => ({
      packName: currentExportData.value?.packName || '',
      packDescription: currentExportData.value?.packDescription || '',
      packFormat: currentExportData.value?.packFormat || 48,
      supportedFormats: currentExportData.value?.supportedFormats || 'auto',
      customSupportedFormats: currentExportData.value?.customSupportedFormats || '',
      allowedIncompatible: currentExportData.value?.allowedIncompatible || false,
      includeTranslationKeys: currentExportData.value?.includeTranslationKeys || false,
    }))

    const atlasFileNames = computed(() => {
      if (atlasResult.value?.fontGroups) {
        const fileNames: string[] = []
        for (const fontGroup of atlasResult.value.fontGroups as FontGroup[]) {
          for (const atlasGroup of fontGroup.atlasGroups) {
            const baseName = atlasGroup.fontName
            const bitmapIndex = atlasGroup.bitmapIndex ?? 0
            const fileName = bitmapIndex === 0 ? baseName : `${baseName}_${bitmapIndex + 1}`
            fileNames.push(fileName)
          }
        }
        return fileNames
      }
      return []
    })

    const fontFileNames = computed(() => {
      if (atlasResult.value?.fontGroups) {
        return atlasResult.value.fontGroups.map(fontGroup => fontGroup.fontName)
      }
      return []
    })

    const currentAtlasImage = computed(() => {
      if (atlasResult.value?.fontGroups?.[0]?.atlasGroups?.[0]) {
        return atlasResult.value.fontGroups[0].atlasGroups[0].atlasImage
      }
      return atlasImage.value ?? undefined
    })

    const emptyStateConfig = computed(() => {
      return {
        icon: 'i-carbon-image',
        title: t('atlas.empty.title'),
        description: t('atlas.empty.description'),
        steps: [
          t('atlas.empty.steps.0'),
          t('atlas.empty.steps.1'),
          t('atlas.empty.steps.2'),
        ],
      }
    })

    return {
      safeExportData,
      atlasFileNames,
      fontFileNames,
      currentAtlasImage,
      emptyStateConfig,
    }
  }

  return {
    // 状态
    selectedVersion,
    resourcePacks,
    namespace,
    showIconDetail,
    selectedIcon,

    // 计算属性
    versionSelected,
    hasResourcePacks,
    defaultFontName,

    // 方法
    getAllTextures,
    openIconDetail,
    closeIconDetail,
    createComputedHelpers,
  }
}
