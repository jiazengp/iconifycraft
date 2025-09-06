<script setup lang="ts">
// 无需任何逻辑，纯展示组件
</script>

<template>
  <div>
    <!-- Recent Previews 标题 -->
    <div class="mb-4 h-5 w-28 animate-pulse rounded bg-skeleton-bg" />

    <!-- Recent Previews 列表 -->
    <div class="animate-pulse space-y-2">
      <!-- 3个最近实例的骨架 -->
      <div v-for="n in 3" :key="n" class="flex items-center border border-border rounded-lg bg-card p-3 space-x-3">
        <div class="h-6 w-6 flex-shrink-0 border rounded bg-skeleton-bg" />
        <div class="min-w-0 flex-1">
          <div class="mb-1 h-3 w-3/4 rounded bg-skeleton-bg" />
          <div class="h-2 w-1/2 rounded bg-skeleton-bg" />
        </div>
      </div>
    </div>
  </div>
</template>
