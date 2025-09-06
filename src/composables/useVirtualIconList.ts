import type { IconItem, VirtualListOptions } from '~/types/icon'
import { useResizeObserver, useVirtualList } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'

type UseVirtualIconListOptions = VirtualListOptions

export function useVirtualIconList(
  filteredIcons: Ref<IconItem[]>,
  options: UseVirtualIconListOptions = {},
  externalContainerRef?: Ref<HTMLElement | null | undefined>,
) {
  const {
    itemHeight = 80,
    overscan = 2,
    minItemWidth = 260,
    maxItemsPerRow = 5,
  } = options

  const containerRef = externalContainerRef ?? ref<HTMLElement>()
  const itemsPerRow = ref(3)

  // 响应式计算每行图标数量
  const updateItemsPerRow = () => {
    if (containerRef.value) {
      const containerWidth = containerRef.value.clientWidth

      // 根据容器宽度动态设置最小项目宽度
      let adjustedMinWidth = minItemWidth
      if (containerWidth < 768) {
        adjustedMinWidth = 240 // 移动设备
      }
      else if (containerWidth < 1024) {
        adjustedMinWidth = 260 // 平板
      }
      else {
        adjustedMinWidth = 300 // 桌面
      }

      const calculatedItems = Math.floor((containerWidth - 32) / adjustedMinWidth)
      const newItemsPerRow = Math.max(1, Math.min(calculatedItems, maxItemsPerRow))

      if (newItemsPerRow !== itemsPerRow.value) {
        itemsPerRow.value = newItemsPerRow
      }
    }
  }

  // 将图标分组为行
  const iconRows = computed(() => {
    const rows = []
    const icons = filteredIcons.value
    const perRow = itemsPerRow.value

    for (let i = 0; i < icons.length; i += perRow) {
      rows.push(icons.slice(i, i + perRow))
    }

    return rows
  })

  // 使用 VueUse 的虚拟列表（以行为单位）
  const { list: visibleRows, containerProps, wrapperProps } = useVirtualList(
    iconRows,
    {
      itemHeight,
      overscan,
    },
  )

  // 使用ResizeObserver监听容器宽度变化
  useResizeObserver(containerRef, () => {
    updateItemsPerRow()
  })

  // 获取当前可见的图标
  const visibleIcons = computed(() => {
    const icons: IconItem[] = []
    visibleRows.value.forEach(({ data: row }) => {
      icons.push(...row)
    })
    return icons
  })

  // 滚动到指定图标
  const scrollToIcon = (iconId: string) => {
    const iconIndex = filteredIcons.value.findIndex(icon => icon.id === iconId)
    if (iconIndex === -1)
      return

    const rowIndex = Math.floor(iconIndex / itemsPerRow.value)
    const scrollTop = rowIndex * itemHeight

    if (containerRef.value) {
      containerRef.value.scrollTop = scrollTop
    }
  }

  // 滚动到顶部
  const scrollToTop = () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  }

  // 确保初始化时计算每行数量
  watch(containerRef, () => {
    if (containerRef.value) {
      nextTick(() => {
        updateItemsPerRow()
      })
    }
  }, { immediate: true })

  // 监听 filteredIcons 变化，确保虚拟列表正确响应数据变化
  watch(filteredIcons, () => {
    // 在数据变化时，如果需要可以在这里添加额外的处理逻辑
  }, { deep: true })

  return {
    containerRef,
    containerProps,
    wrapperProps,
    visibleRows: readonly(visibleRows),
    visibleIcons: readonly(visibleIcons),
    itemsPerRow: readonly(itemsPerRow),
    scrollToIcon,
    scrollToTop,
    updateItemsPerRow,
  }
}
