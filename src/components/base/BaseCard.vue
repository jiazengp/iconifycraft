<script setup lang="ts">
interface Props {
  /** 卡片标题 */
  title?: string
  /** 卡片描述 */
  description?: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否可悬停 */
  hoverable?: boolean
  /** 是否可点击 */
  clickable?: boolean
  /** 卡片大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否加载中 */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  hoverable: false,
  clickable: false,
  size: 'md',
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.clickable && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    class="base-card"
    :class="[
      `base-card--${size}`,
      {
        'base-card--bordered': bordered,
        'base-card--hoverable': hoverable,
        'base-card--clickable': clickable,
        'base-card--loading': loading,
      },
    ]"
    @click="handleClick"
  >
    <!-- Loading overlay -->
    <div v-if="loading" class="base-card__loading">
      <i class="i-lucide-loader-2 animate-spin text-xl text-zinc-400" />
    </div>

    <!-- Header -->
    <header v-if="title || description || $slots.header" class="base-card__header">
      <slot name="header">
        <div class="base-card__header-content">
          <h3 v-if="title" class="base-card__title">
            {{ title }}
          </h3>
          <p v-if="description" class="base-card__description">
            {{ description }}
          </p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="base-card__actions">
        <slot name="actions" />
      </div>
    </header>

    <!-- Content -->
    <main class="base-card__content">
      <slot />
    </main>

    <!-- Footer -->
    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.base-card {
  @apply bg-white dark:bg-zinc-900 rounded-lg transition-all duration-200;
  @apply relative overflow-hidden;
}

.base-card--bordered {
  @apply border border-zinc-200 dark:border-zinc-700;
}

.base-card--hoverable {
  @apply hover:-translate-y-0.5;
}

.base-card--clickable {
  @apply cursor-pointer;
}

.base-card--clickable:hover {
  @apply bg-zinc-50 dark:bg-zinc-800;
}

.base-card--loading {
  @apply opacity-60 pointer-events-none;
}

.base-card--sm {
  @apply text-sm;
}

.base-card--lg {
  @apply text-lg;
}

.base-card__loading {
  @apply absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm;
  @apply flex items-center justify-center z-10;
}

.base-card__header {
  @apply p-4 pb-0 flex items-start justify-between;
}

.base-card--sm .base-card__header {
  @apply p-3 pb-0;
}

.base-card--lg .base-card__header {
  @apply p-6 pb-0;
}

.base-card__header-content {
  @apply flex-1 min-w-0;
}

.base-card__title {
  @apply text-base font-semibold text-zinc-900 dark:text-zinc-100;
  @apply leading-tight mb-1;
}

.base-card--sm .base-card__title {
  @apply text-sm;
}

.base-card--lg .base-card__title {
  @apply text-lg;
}

.base-card__description {
  @apply text-sm text-zinc-600 dark:text-zinc-400;
  @apply leading-relaxed;
}

.base-card--sm .base-card__description {
  @apply text-xs;
}

.base-card__actions {
  @apply ml-4 flex-shrink-0;
}

.base-card__content {
  @apply p-4;
}

.base-card--sm .base-card__content {
  @apply p-3;
}

.base-card--lg .base-card__content {
  @apply p-6;
}

.base-card__footer {
  @apply px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800;
  @apply bg-zinc-50/50 dark:bg-zinc-800/50;
}

.base-card--sm .base-card__footer {
  @apply px-3 pb-3;
}

.base-card--lg .base-card__footer {
  @apply px-6 pb-6;
}
</style>
