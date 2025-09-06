export type IconType = 'item' | 'block'

export interface IconItem {
  id: string
  name: string
  unicode: string
  unicodeChar: string
  translationKey: string
  category: string
  iconType: IconType
  namespace: string
  x: number
  y: number
  sourcePack?: string
  fullPath?: string
  atlasIndex?: number
}

export interface CategoryInfo {
  key: string
  name: string
  count: number
  color?: string
  description?: string
}

export interface IconActionEvent {
  action: 'click' | 'copy-unicode' | 'copy-translation' | 'view-detail'
  icon: IconItem
  value?: string
}

export interface VirtualListOptions {
  itemHeight?: number
  overscan?: number
  minItemWidth?: number
  maxItemsPerRow?: number
}

export interface IconFilterOptions {
  searchQuery?: string
  selectedCategory?: string
  namespace?: string
  includeTags?: string[]
  excludeTags?: string[]
}

export interface IconCopyEvent {
  type: 'unicode' | 'translation' | 'name' | 'id'
  value: string
  success: boolean
}

export type IconSortBy = 'name' | 'category' | 'namespace' | 'unicode' | 'recent'
export type IconSortOrder = 'asc' | 'desc'

export interface IconSortOptions {
  sortBy: IconSortBy
  sortOrder: IconSortOrder
}
