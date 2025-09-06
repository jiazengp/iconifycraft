<script setup lang="ts">
import { computed } from 'vue'
import Skeleton from '~/components/base/Skeleton.vue'

interface Props {
  iconCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconCount: 15, // 默认显示15个图标骨架，5行每行3个
})

const iconCount = computed(() => props.iconCount)
</script>

<template>
  <div class="border border-border rounded-lg bg-card p-6">
    <!-- 头部控制区 -->
    <div class="mb-4">
      <Skeleton width="100%" height="40px" variant="rounded" />
    </div>

    <!-- 分类过滤器 -->
    <div class="mb-4 flex flex-wrap gap-2">
      <Skeleton width="60px" height="28px" variant="rounded" />
      <Skeleton width="80px" height="28px" variant="rounded" />
      <Skeleton width="70px" height="28px" variant="rounded" />
      <Skeleton width="90px" height="28px" variant="rounded" />
      <Skeleton width="75px" height="28px" variant="rounded" />
      <Skeleton width="65px" height="28px" variant="rounded" />
      <Skeleton width="85px" height="28px" variant="rounded" />
    </div>

    <!-- 虚拟列表容器 -->
    <div class="virtual-list-container">
      <div
        class="virtual-list-content relative"
        style="height: 400px;"
      >
        <!-- 每行显示3个图标项目 -->
        <div class="space-y-1">
          <div
            v-for="row in Math.ceil(iconCount / 3)"
            :key="`row-${row}`"
            class="grid grid-cols-3 h-20 gap-1 px-2"

            style="height: 80px;"
          >
            <!-- 行内的图标项目 -->
            <div
              v-for="col in 3"
              :key="`item-${row}-${col}`"
              class="icon-item flex cursor-pointer items-center border border-border rounded-lg transition-colors hover:bg-accent"
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
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mt-4 border-t border-border pt-4">
      <div class="flex items-center justify-between text-sm">
        <Skeleton width="120px" height="14px" />
        <Skeleton width="100px" height="14px" />
      </div>
    </div>
  </div>
</template>
