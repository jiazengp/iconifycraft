<script setup lang="ts">
import Skeleton from '~/components/base/Skeleton.vue'
</script>

<template>
  <div class="border border-border rounded-lg bg-card p-6">
    <!-- 卡片头部 -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Skeleton width="20px" height="20px" />
        <Skeleton width="120px" height="24px" />
      </div>
      <div class="flex items-center space-x-2">
        <div class="flex space-x-1">
          <Skeleton width="24px" height="8px" variant="rounded" />
          <Skeleton width="8px" height="8px" variant="rounded" />
          <Skeleton width="8px" height="8px" variant="rounded" />
        </div>
        <Skeleton width="30px" height="14px" />
      </div>
    </div>

    <!-- 主要内容区域：flex 布局，左右等宽 -->
    <div class="flex flex-col gap-6 lg:flex-row">
      <!-- 左侧图集预览 -->
      <div class="flex-1">
        <Skeleton
          width="100%"
          height="400px"
          variant="rounded"
          class="mb-3"
        />
      </div>

      <!-- 右侧信息面板 -->
      <div class="flex-1 space-y-6">
        <!-- 图集信息 -->
        <div class="atlas-info space-y-4">
          <Skeleton width="80px" height="18px" />
          <div class="text-sm space-y-2">
            <div class="flex items-center justify-between">
              <Skeleton width="60px" height="14px" />
              <Skeleton width="160px" height="14px" />
            </div>
            <div class="flex items-center justify-between">
              <Skeleton width="70px" height="14px" />
              <Skeleton width="120px" height="14px" />
            </div>
            <div class="flex items-center justify-between">
              <Skeleton width="80px" height="14px" />
              <Skeleton width="80px" height="14px" />
            </div>
            <div class="flex items-center justify-between">
              <Skeleton width="90px" height="14px" />
              <Skeleton width="140px" height="14px" />
            </div>
            <div class="flex items-center justify-between">
              <Skeleton width="60px" height="14px" />
              <Skeleton width="70px" height="14px" />
            </div>
          </div>
        </div>

        <!-- 资源包合并统计 -->
        <div class="space-y-4">
          <Skeleton width="120px" height="18px" />

          <!-- 统计框 -->
          <div class="border border-border rounded-lg bg-muted/50 p-4 space-y-4">
            <!-- 合并进度条 -->
            <Skeleton width="100%" height="12px" variant="rounded" />

            <!-- 图例项目 -->
            <div class="grid grid-cols-1 gap-2 text-xs">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex items-center space-x-2">
                  <Skeleton width="12px" height="12px" variant="rounded" />
                  <Skeleton width="80px" height="12px" />
                </div>
                <div class="flex items-center space-x-3">
                  <Skeleton width="30px" height="12px" />
                  <Skeleton width="50px" height="12px" />
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex items-center space-x-2">
                  <Skeleton width="12px" height="12px" variant="rounded" />
                  <Skeleton width="90px" height="12px" />
                </div>
                <div class="flex items-center space-x-3">
                  <Skeleton width="30px" height="12px" />
                  <Skeleton width="50px" height="12px" />
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex items-center space-x-2">
                  <Skeleton width="12px" height="12px" variant="rounded" />
                  <Skeleton width="70px" height="12px" />
                </div>
                <div class="flex items-center space-x-3">
                  <Skeleton width="30px" height="12px" />
                  <Skeleton width="50px" height="12px" />
                  <Skeleton width="60px" height="10px" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
