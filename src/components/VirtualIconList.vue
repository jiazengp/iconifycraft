<script setup lang="ts">
import type { AtlasGroup } from '~/types/atlas'
import type { IconItem } from '~/types/icon'
import { useDebounceFn } from '@vueuse/core'
import { computed, ref, toRef, watch } from 'vue'
import { useCopyAction } from '~/composables/useCopyAction'
import { useIconCategories } from '~/composables/useIconCategories'
import { useVirtualIconList } from '~/composables/useVirtualIconList'
import IconListItemSkeleton from './base/IconListItemSkeleton.vue'
import CategoryFilter from './icon-list/CategoryFilter.vue'
import IconListHeader from './icon-list/IconListHeader.vue'
import IconListItem from './icon-list/IconListItem.vue'

interface Props {
  icons: readonly IconItem[]
  atlasGroups?: AtlasGroup[]
  iconSize?: number
}

interface Emits {
  (e: 'iconClick', icon: IconItem): void
  (e: 'copySuccess', type: string, value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  atlasGroups: () => [],
  iconSize: 32,
})

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedCategory = ref('')
const isSearching = ref(false)
const loadingStartTime = ref(0)

const MIN_LOADING_TIME = 150
const DEBOUNCE_DELAY = 300

function finishSearch(query: string) {
  const now = Date.now()
  const elapsed = now - loadingStartTime.value

  if (loadingStartTime.value && elapsed < MIN_LOADING_TIME) {
    setTimeout(() => {
      debouncedSearchQuery.value = query
      isSearching.value = false
    }, MIN_LOADING_TIME - elapsed)
  }
  else {
    debouncedSearchQuery.value = query
    isSearching.value = false
  }
}

const debouncedSearch = useDebounceFn(finishSearch, DEBOUNCE_DELAY)

const { copyUnicode: copyUnicodeAction, copyTranslationKey: copyTranslationKeyAction } = useCopyAction({
  showNotification: false,
})

const iconsRef = toRef(props, 'icons') as Ref<IconItem[]>
const { availableCategories, filterIcons } = useIconCategories(iconsRef)

const filteredIcons = computed(() => {
  return filterIcons(debouncedSearchQuery.value, selectedCategory.value)
})

const showLoading = computed(() => {
  const hasSearchContent = searchQuery.value.trim() || selectedCategory.value
  return isSearching.value && hasSearchContent && searchQuery.value !== debouncedSearchQuery.value
})

const totalIcons = computed(() => props.icons.length)

const ITEM_HEIGHT = 80

const {
  containerProps,
  wrapperProps,
  visibleRows,
  itemsPerRow,
  scrollToTop,
} = useVirtualIconList(filteredIcons as Ref<IconItem[]>, {
  itemHeight: ITEM_HEIGHT,
  overscan: 2,
})

async function copyUnicode(unicode: string) {
  const success = await copyUnicodeAction(unicode)
  if (success) {
    emit('copySuccess', 'Unicode', unicode)
  }
}

async function copyTranslationKey(translationKey: string) {
  const success = await copyTranslationKeyAction(translationKey)
  if (success) {
    emit('copySuccess', 'translationKey', translationKey)
  }
}

const handleIconClick = (icon: IconItem) => emit('iconClick', icon)

const generateRowKey = (row: IconItem[], index: number) => `row-${index}`

watch(searchQuery, (newQuery: string) => {
  if (newQuery !== debouncedSearchQuery.value) {
    if (!isSearching.value) {
      loadingStartTime.value = Date.now()
    }
    isSearching.value = true
  }
  debouncedSearch(newQuery)
}, { immediate: true })

watch([debouncedSearchQuery, selectedCategory], () => {
  scrollToTop()
})
</script>

<template>
  <div class="virtual-icon-list slide-enter-scale">
    <!-- 头部控制区 -->
    <IconListHeader v-model="searchQuery" />

    <!-- 分类过滤器 -->
    <CategoryFilter
      :categories="[...availableCategories]"
      :selected-category="selectedCategory"
      :total-icons="totalIcons"
      @update:selected-category="selectedCategory = $event"
    />

    <!-- 虚拟列表容器 -->
    <div class="virtual-list-container">
      <div
        v-bind="containerProps"
        class="virtual-list-content"
        style="height: 400px;"
      >
        <!-- 搜索中的骨架屏 -->
        <div v-if="showLoading" class="loading-skeleton">
          <IconListItemSkeleton :rows="5" :columns="3" />
        </div>

        <!-- 正常内容 -->
        <div v-else v-bind="wrapperProps">
          <!-- 虚拟列表行 -->
          <div
            v-for="{ data: row, index } in visibleRows"
            :key="generateRowKey([...row], index)"
            class="virtual-list-row"
            :style="{ height: `${ITEM_HEIGHT}px` }"
          >
            <div
              class="slide-enter-grid grid h-full gap-1 px-2"
              :class="{
                'grid-cols-1': itemsPerRow === 1,
                'grid-cols-2': itemsPerRow === 2,
                'grid-cols-3': itemsPerRow === 3,
                'grid-cols-4': itemsPerRow === 4,
                'grid-cols-5': itemsPerRow === 5,
              }"
            >
              <!-- 行内的图标项目 -->
              <IconListItem
                v-for="item in row"
                :key="item.id"
                :icon="item"
                :atlas-groups="atlasGroups"
                :icon-size="iconSize"
                @click="handleIconClick"
                @copy-unicode="copyUnicode"
                @copy-translation="copyTranslationKey"
                @view-detail="handleIconClick"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
      <div class="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span>{{ $t('iconList.stats.showing', { current: filteredIcons.length, total: totalIcons }) }}</span>
        <span>{{ $t('iconList.instructions.clickToCopy') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-icon-list {
  @apply bg-card rounded-lg border border-border p-6;
}

.virtual-list-container {
  @apply relative;
}

.virtual-list-content {
  @apply relative;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.virtual-list-content::-webkit-scrollbar {
  width: 6px;
}

.virtual-list-content::-webkit-scrollbar-track {
  background: transparent;
}

.virtual-list-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.virtual-list-row {
  @apply w-full;
  position: relative;
}

.loading-skeleton {
  @apply w-full;
  padding: 0 0.5rem;
}
</style>
