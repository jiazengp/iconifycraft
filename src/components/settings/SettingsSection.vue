<script setup lang="ts">
interface Props {
  id?: string
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div :id="id" class="settings-section">
    <div class="section-header">
      <h3 class="section-title">
        {{ title }}
      </h3>
      <p v-if="description" class="section-description">
        {{ description }}
      </p>
    </div>

    <div class="section-separator" />

    <div class="section-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.settings-section {
  @apply space-y-6;
}

.section-header {
  @apply space-y-2;
}

.section-title {
  @apply text-lg font-medium text-zinc-900 dark:text-zinc-100;
}

.section-description {
  @apply text-sm text-zinc-600 dark:text-zinc-400;
}

.section-separator {
  @apply h-px bg-zinc-200 dark:bg-zinc-700;
}

.section-content {
  @apply space-y-8;
}

/* 在中等屏幕上与导航栏对齐 */
@media (max-width: 1024px) {
  .section-content {
    @apply ml-0;
  }

  .section-header {
    @apply ml-0;
  }
}
</style>
