<script setup lang="ts">
import type { SavedInstance } from '~/types/instance'
import BaseBadge from '~/components/base/BaseBadge.vue'

interface Props {
  instance: SavedInstance
  showAtlasBadge?: boolean
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="instance-subnavbar">
    <div class="instance-subnavbar-content">
      <!-- 左侧：实例名称 -->
      <a href="#">
        <div class="instance-name-section">
          <i class="i-lucide-save mr-2 text-lg" />
          <h1 class="instance-name">{{ instance.name }}</h1>
        </div>
      </a>

      <!-- 右侧：标签 -->
      <div class="instance-badges">
        <BaseBadge variant="info" size="sm">
          {{ instance.minecraftVersion }}
        </BaseBadge>
        <BaseBadge v-if="showAtlasBadge" variant="success" size="sm">
          {{ t('instances.hasAtlas') }}
        </BaseBadge>
        <BaseBadge variant="outline" size="sm">
          {{ instance.metadata.packCount }} {{ instance.metadata.packCount === 1 ? 'pack' : 'packs' }}
        </BaseBadge>
      </div>
    </div>
  </div>
</template>

<style scoped>
.instance-subnavbar {
  @apply sticky top-0 z-10;
  @apply border-b;

  background-color: rgb(255, 255, 255);

  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.dark .instance-subnavbar {
  background-color: rgb(24, 24, 27);
  background: rgba(24, 24, 27, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 1px 0 0 rgba(255, 255, 255, 0.02) inset,
    0 1px 3px 0 rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
}

@supports not (backdrop-filter: blur(20px)) {
  .instance-subnavbar {
    background-color: rgba(255, 255, 255, 0.95);
  }

  .dark .instance-subnavbar {
    background-color: rgba(24, 24, 27, 0.95);
  }
}

.instance-subnavbar-content {
  @apply mx-auto max-w-7xl px-4 lg:px-8 sm:px-6;
  @apply flex items-center justify-between;
  @apply py-3;
}

.instance-name-section {
  @apply flex items-center;
  @apply text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100;
  @apply transition-colors duration-200;
}

.instance-name {
  @apply text-lg font-semibold;
  @apply truncate max-w-md;
}

.instance-badges {
  @apply flex items-center space-x-2 flex-shrink-0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .instance-subnavbar-content {
    @apply flex-col items-start space-y-2;
  }

  .instance-badges {
    @apply flex-wrap;
  }

  .instance-name {
    @apply max-w-full;
  }
}
</style>
