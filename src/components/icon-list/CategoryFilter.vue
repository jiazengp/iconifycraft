<script setup lang="ts">
import type { CategoryInfo } from '~/types/icon'
import { useI18n } from 'vue-i18n'

interface Props {
  categories: CategoryInfo[]
  selectedCategory: string
  totalIcons: number
}

interface Emits {
  (e: 'update:selectedCategory', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()

// 分类颜色配置
const categoryColors = {
  buildingBlocks: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
  decorationBlocks: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
  redstone: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  transportation: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
  combat: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  foodAndDrink: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  materials: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200',
  tools: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
  brewing: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  spawnEggs: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  misc: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
  default: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
}

// 获取分类显示名称，支持翻译回退
function getCategoryDisplayName(categoryName: string): string {
  // 如果是翻译键格式（包含点号），尝试翻译
  if (categoryName.includes('.')) {
    const translated = t(categoryName)
    // 如果翻译成功（返回值不等于键本身），返回翻译结果
    if (translated !== categoryName) {
      return translated
    }
  }

  // 否则返回原始名称（可能是自定义分类）
  return categoryName
}

function getCategoryColor(categoryKey: string): string {
  if (categoryKey in categoryColors) {
    return categoryColors[categoryKey as keyof typeof categoryColors] || categoryColors.default
  }

  const colors = [
    'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
    'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
    'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200',
    'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200',
    'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200',
    'bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200',
  ]

  let hash = 0
  for (let i = 0; i < categoryKey.length; i++) {
    const char = categoryKey.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="mb-4">
    <div class="flex flex-wrap gap-1">
      <!-- 全部分类选项 -->
      <button
        class="inline-flex items-center border rounded-full px-2 py-1 text-xs font-medium transition-all hover:scale-105 hover:opacity-80"
        :class="[
          selectedCategory === ''
            ? 'bg-zinc-200 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-100 border-zinc-400 dark:border-zinc-400 shadow-sm'
            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-transparent hover:border-zinc-300 dark:hover:border-zinc-500',
        ]"
        :title="$t('common.all')"
        @click="$emit('update:selectedCategory', '')"
      >
        {{ $t('common.all') }}
        <span class="ml-1 text-xs opacity-75">{{ totalIcons }}</span>
      </button>

      <!-- 分类选项 -->
      <button
        v-for="category in categories"
        :key="category.key"
        class="inline-flex items-center border rounded-full px-2 py-1 text-xs font-medium transition-all hover:scale-105 hover:opacity-80"
        :class="[
          getCategoryColor(category.key),
          selectedCategory === category.key
            ? 'border-zinc-500 dark:border-zinc-300 shadow-md transform scale-105'
            : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-400',
        ]"
        :title="`${getCategoryDisplayName(category.name)} (${category.count})`"
        @click="$emit('update:selectedCategory', category.key)"
      >
        {{ getCategoryDisplayName(category.name) }}
        <span class="ml-1 text-xs opacity-75">{{ category.count }}</span>
      </button>
    </div>
  </div>
</template>
