<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="settings-layout">
    <div class="settings-container mx-auto max-w-7xl px-4 lg:px-8 sm:px-6">
      <div class="settings-header">
        <div class="space-y-2">
          <h1 class="text-3xl text-zinc-900 font-bold dark:text-zinc-100">
            {{ title }}
          </h1>
          <p v-if="description" class="text-zinc-600 dark:text-zinc-400">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="settings-separator" />

      <div class="settings-body">
        <SettingsSidebar class="settings-sidebar-wrapper" />
        <div class="settings-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-layout {
  @apply bg-white dark:bg-zinc-950;
}

.settings-container {
  @apply py-10 space-y-6;
}

.settings-header {
  @apply pb-2;
}

.settings-separator {
  @apply h-px bg-zinc-200 dark:bg-zinc-700;
}

.settings-body {
  @apply flex gap-10;
}

.settings-content {
  @apply flex-1 space-y-8 min-w-0;
}

/* 在中等屏幕上调整侧边栏布局 */
@media (max-width: 1280px) {
  .settings-body {
    @apply gap-8;
  }
}

/* 在较小屏幕上将侧边栏移至顶部 */
@media (max-width: 1024px) {
  .settings-body {
    @apply flex-col gap-6;
  }

  .settings-content {
    @apply max-w-none w-full;
  }
}

/* 在小屏幕上隐藏侧边栏 */
@media (max-width: 768px) {
  .settings-container {
    @apply py-6 space-y-4 px-8;
  }

  .settings-content {
    @apply space-y-6;
  }

  /* 隐藏侧边栏以避免遮挡内容 */
  .settings-sidebar-wrapper {
    @apply hidden;
  }

  .settings-body {
    @apply gap-0;
  }
}

/* 在极小屏幕上进一步优化 */
@media (max-width: 480px) {
  .settings-container {
    @apply py-4 space-y-3 px-6;
  }

  .settings-header h1 {
    @apply text-2xl;
  }
}
</style>
