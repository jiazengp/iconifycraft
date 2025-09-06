import type { CategoryInfo, IconItem, IconType } from '~/types/icon'
import { computed, ref } from 'vue'
import itemsSorts from '~/data/items_sorts.json'
import { generateTranslationKey } from '~/data/texture-translation-mapping'
import { useMinecraftTranslation } from './useMinecraftTranslation'

const categoryNames: Record<string, string> = {
  buildingBlocks: 'icons.categories.building',
  decorationBlocks: 'icons.categories.decoration',
  redstone: 'icons.categories.redstone',
  transportation: 'icons.categories.transportation',
  combat: 'icons.categories.combat',
  foodAndDrink: 'icons.categories.food',
  materials: 'icons.categories.materials',
  tools: 'icons.categories.tools',
  brewing: 'icons.categories.brewing',
  spawnEggs: 'icons.categories.item',
  misc: 'icons.categories.miscellaneous',
}

// 全局缓存分类映射，避免重复计算
// 注意：这里的 category 指的是功能分类（如 buildingBlocks, decorationBlocks），不是 Minecraft 类型（item/block）
const fileNameToCategory: Record<string, string> = {}

Object.entries(itemsSorts).forEach(([categoryKey, files]) => {
  files.forEach((fileName) => {
    const baseName = fileName.replace(/\.png$/, '')
    fileNameToCategory[baseName] = categoryKey
  })
})

export function useIconCategories(icons: Ref<IconItem[]>) {
  const { getTranslatedNameSync, getMinecraftTranslationKey } = useMinecraftTranslation()
  const translationCache = ref<Map<string, string>>(new Map())

  // 获取图标的功能分类（如 buildingBlocks, decorationBlocks 等）
  const getIconCategory = (icon: IconItem): string => {
    const baseName = icon.name.toLowerCase()
    return fileNameToCategory[baseName] || icon.sourcePack || 'unknown'
  }

  const getIconTranslation = (iconName: string, iconType: IconType, iconNamespace: string = 'minecraft'): string => {
    const cacheKey = `${iconName}_${iconType}_${iconNamespace}`
    if (translationCache.value.has(cacheKey)) {
      return translationCache.value.get(cacheKey)!
    }

    const translation = getTranslatedNameSync(iconName, iconType)
    translationCache.value.set(cacheKey, translation)
    return translation
  }

  const enhancedIcons = computed(() => {
    return icons.value.map((icon) => {
      const category = getIconCategory(icon)
      return {
        ...icon,
        category,
        translatedName: getIconTranslation(icon.name, icon.iconType, icon.namespace),
        minecraftTranslationKey: generateTranslationKey(icon.name, icon.iconType, icon.namespace),
        translatedNameKey: getMinecraftTranslationKey(icon.name, icon.iconType),
      }
    })
  })

  const getCategoryName = (categoryKey: string): string => {
    return categoryNames[categoryKey] || categoryKey
  }

  const availableCategories = computed((): CategoryInfo[] => {
    const categoryCount: Record<string, number> = {}

    enhancedIcons.value.forEach((icon) => {
      categoryCount[icon.category] = (categoryCount[icon.category] || 0) + 1
    })

    return Object.entries(categoryCount)
      .map(([key, count]) => ({
        key,
        name: getCategoryName(key),
        count,
      }))
      .sort((a, b) => {
        if (a.count !== b.count) {
          return b.count - a.count
        }

        const aIsPredefined = a.key in categoryNames
        const bIsPredefined = b.key in categoryNames

        if (aIsPredefined && !bIsPredefined)
          return -1
        if (!aIsPredefined && bIsPredefined)
          return 1

        return a.name.localeCompare(b.name)
      })
  })

  // 优化后的过滤图标函数
  const filterIcons = computed(() => {
    return (searchQuery: string, selectedCategory: string) => {
      let filtered = enhancedIcons.value

      // 先按分类过滤（更快）
      if (selectedCategory) {
        filtered = filtered.filter(icon => icon.category === selectedCategory)
      }

      // 然后按搜索词过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim()
        if (query) {
          filtered = filtered.filter((icon) => {
            const basicMatch = icon.name.toLowerCase().includes(query)
              || icon.translationKey.toLowerCase().includes(query)
              || icon.unicode.toLowerCase().includes(query)
              || icon.translatedName.toLowerCase().includes(query)
              || icon.minecraftTranslationKey.toLowerCase().includes(query)
              || (icon.translatedNameKey && icon.translatedNameKey.toLowerCase().includes(query))

            if (basicMatch)
              return true

            // 扩展字段搜索（可选字段需要检查存在性）
            const extendedMatch = (icon.sourcePack?.toLowerCase().includes(query))
              || (icon.category?.toLowerCase().includes(query))

            return extendedMatch
          })
        }
      }

      return filtered
    }
  })

  return {
    enhancedIcons: readonly(enhancedIcons),
    availableCategories: readonly(availableCategories),
    getCategoryName,
    filterIcons: filterIcons.value,
  }
}
