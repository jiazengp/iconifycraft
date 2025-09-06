import type { MaybeRefOrGetter } from '@vueuse/core'
import type { IconItem } from '~/types/icon'
import { computed, toValue } from 'vue'
import { useMinecraftTranslation } from './useMinecraftTranslation'

export type IconDisplayData = Pick<IconItem, 'name' | 'category' | 'namespace' | 'fullPath' | 'iconType'>

/**
 * 图标显示逻辑组合函数
 * @param icon - 图标数据，可以是ref、reactive、computed或getter函数
 * @returns 分类和翻译后的名称
 *
 * @example
 * ```typescript
 * // 支持多种用法
 * const { translatedName } = useIconDisplay(props.icon)          // 直接传值
 * const { translatedName } = useIconDisplay(ref(iconData))       // ref
 * const { translatedName } = useIconDisplay(computed(() => icon)) // computed
 * const { translatedName } = useIconDisplay(() => props.icon)    // getter函数
 * ```
 */
export function useIconDisplay(icon: MaybeRefOrGetter<IconDisplayData | null | undefined>) {
  const { getTranslatedNameSync } = useMinecraftTranslation()

  const translatedName = computed(() => {
    const iconData = toValue(icon)
    if (!iconData)
      return ''

    return getTranslatedNameSync(iconData.name, iconData.iconType)
  })

  return {
    translatedName,
  }
}
