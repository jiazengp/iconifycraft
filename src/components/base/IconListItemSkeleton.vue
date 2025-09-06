<script setup lang="ts">
import Skeleton from './Skeleton.vue'

interface Props {
  rows?: number
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 3,
})
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="row in props.rows"
      :key="`row-${row}`"
      class="grid h-20 gap-1 px-2"
      :class="`grid-cols-${props.columns}`"
      style="height: 80px;"
    >
      <!-- 行内的图标项目 -->
      <div
        v-for="col in props.columns"
        :key="`item-${row}-${col}`"
        class="icon-item flex cursor-pointer items-center border border-border rounded-lg transition-colors"
        style="height: 72px; padding: 10px 12px;"
      >
        <!-- 图标预览 -->
        <div class="mr-2 h-8 w-8 flex flex-shrink-0 items-center justify-center border border-border rounded bg-background">
          <Skeleton width="32px" height="32px" variant="rounded" />
        </div>

        <!-- 图标信息 -->
        <div class="mr-2 min-w-0 flex-1 space-y-1">
          <div class="mb-0.5">
            <Skeleton width="120px" height="14px" />
          </div>
          <div class="mb-0.5 flex items-center gap-1.5">
            <Skeleton width="60px" height="12px" variant="rounded" />
            <Skeleton width="40px" height="12px" variant="rounded" />
          </div>
          <div>
            <Skeleton width="160px" height="10px" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-shrink-0 flex-col space-y-1">
          <Skeleton width="16px" height="16px" />
          <Skeleton width="16px" height="16px" />
          <Skeleton width="16px" height="16px" />
        </div>
      </div>
    </div>
  </div>
</template>
