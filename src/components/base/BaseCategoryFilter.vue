<script setup lang="ts">
interface Category {
  key: string
  name: string
  count: number
  color: string
  description?: string
}

defineProps<{
  selectedCategory: string
  categories: Category[]
  totalCount: number
}>()

defineEmits<{
  'update:selectedCategory': [category: string]
}>()
</script>

<template>
  <div class="mb-4">
    <div class="flex flex-wrap gap-1">
      <!-- 全部分类选项 -->
      <button
        class="inline-flex items-center border rounded-full px-2 py-1 text-xs font-medium transition-all hover:scale-105 hover:opacity-80"
        :class="[
          selectedCategory === ''
            ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border-gray-400 dark:border-gray-400 shadow-sm'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-transparent hover:border-gray-300 dark:hover:border-gray-500',
        ]"
        :title="$t('icons.categories.all')"
        @click="$emit('update:selectedCategory', '')"
      >
        {{ $t('common.all') }}
        <span class="ml-1 text-xs opacity-75">{{ totalCount }}</span>
      </button>

      <!-- 分类选项 -->
      <button
        v-for="category in categories"
        :key="category.key"
        class="inline-flex items-center border rounded-full px-2 py-1 text-xs font-medium transition-all hover:scale-105 hover:opacity-80"
        :class="[
          selectedCategory === category.key
            ? 'text-white border-transparent shadow-sm'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-transparent hover:border-gray-300 dark:hover:border-gray-500',
          category.color,
        ]"
        :title="category.description"
        @click="$emit('update:selectedCategory', category.key)"
      >
        {{ category.name }}
        <span class="ml-1 text-xs opacity-75">{{ category.count }}</span>
      </button>
    </div>
  </div>
</template>
