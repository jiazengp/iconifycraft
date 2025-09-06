<script setup lang="ts">
interface Props {
  category: string
  count?: number
  showCount?: boolean
}

withDefaults(defineProps<Props>(), {
  showCount: false,
})

// 分类名称映射
const categoryNames: Record<string, string> = {
  buildingBlocks: '建筑方块',
  decorationBlocks: '装饰方块',
  redstone: '红石',
  transportation: '交通',
  combat: '战斗',
  foodAndDrink: '食物饮品',
  materials: '材料',
  tools: '工具',
  brewing: '酿造',
  spawnEggs: '生成蛋',
  misc: '杂项',
}

// 分类颜色配置
const categoryColors = {
  // 预定义分类的颜色
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
  // 默认颜色
  default: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
}

// 获取分类名称
function getCategoryName(categoryKey: string): string {
  return categoryNames[categoryKey] || categoryKey
}

// 获取分类颜色
function getCategoryColor(categoryKey: string): string {
  // 先检查是否是预定义分类
  if (categoryKey in categoryNames) {
    return categoryColors[categoryKey as keyof typeof categoryColors] || categoryColors.default
  }

  // 对于来源材质包名称，使用哈希算法分配颜色
  const colors = [
    'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
    'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
    'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200',
    'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200',
    'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200',
    'bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200',
  ]

  // 简单哈希函数
  let hash = 0
  for (let i = 0; i < categoryKey.length; i++) {
    const char = categoryKey.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }

  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
    :class="getCategoryColor(category)"
  >
    {{ getCategoryName(category) }}
    <span v-if="showCount && count !== undefined" class="ml-1 text-xs opacity-75">{{ count }}</span>
  </span>
</template>
