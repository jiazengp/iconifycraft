<script setup lang="ts">
interface Props {
  viewMode?: 'grid' | 'list'
}

withDefaults(defineProps<Props>(), {
  viewMode: 'grid',
})
</script>

<template>
  <!-- 网格视图骨架 -->
  <div
    v-if="viewMode === 'grid'"
    class="animate-pulse border border-border rounded-lg bg-card p-4 space-y-3"
  >
    <!-- 标题行：图标 + 名称 + 操作 -->
    <div class="flex items-center space-x-3">
      <div class="h-12 w-12 flex-shrink-0 rounded bg-skeleton-bg" />
      <div class="min-w-0 flex-1">
        <div class="mb-1 h-4 w-3/4 rounded bg-skeleton-bg" />
        <div class="h-3 w-1/2 rounded bg-skeleton-bg" />
      </div>
      <div class="h-6 w-6 flex-shrink-0 rounded bg-skeleton-bg" />
    </div>

    <!-- 版本和时间 -->
    <div class="flex items-center justify-between">
      <div class="h-5 w-16 rounded-full bg-skeleton-bg" />
      <div class="h-3 w-20 rounded bg-skeleton-bg" />
    </div>
  </div>

  <!-- 列表视图骨架 -->
  <div
    v-else
    class="animate-pulse border border-border rounded-lg bg-card p-3"
  >
    <div class="flex items-center space-x-4">
      <div class="h-10 w-10 flex-shrink-0 rounded bg-skeleton-bg" />

      <div class="min-w-0 flex-1">
        <div class="mb-1 h-4 w-2/3 rounded bg-skeleton-bg" />
        <div class="mt-1 flex items-center space-x-3">
          <div class="h-5 w-16 rounded-full bg-skeleton-bg" />
          <div class="h-3 w-20 rounded bg-skeleton-bg" />
        </div>
      </div>

      <div class="h-6 w-6 flex-shrink-0 rounded bg-skeleton-bg" />
    </div>
  </div>
</template>
