<script setup lang="ts">
import type { SavedInstance } from '~/types/instance'
import { computed, onUnmounted } from 'vue'
import BaseBadge from '~/components/base/BaseBadge.vue'
import BaseDropdownMenu from '~/components/base/BaseDropdownMenu.vue'
import Time from '~/components/base/Time.vue'

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid',
})

const emit = defineEmits<{
  open: [id: string]
  delete: [id: string]
  rename: [id: string]
}>()

const { t } = useI18n()

interface Props {
  instance: SavedInstance
  viewMode?: 'grid' | 'list'
}

const iconUrl = computed(() => {
  if (!props.instance.icon)
    return undefined
  const uint8Array = new Uint8Array(props.instance.icon.buffer)
  const arrayBuffer = uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength) as ArrayBuffer
  const blob = new Blob([arrayBuffer], { type: 'image/png' })
  return URL.createObjectURL(blob)
})

onUnmounted(() => {
  if (iconUrl.value) {
    URL.revokeObjectURL(iconUrl.value)
  }
})

// 下拉菜单项配置
const menuItems = computed(() => [
  {
    key: 'rename',
    label: t('instances.actions.rename'),
    icon: 'i-lucide-edit-3',
    variant: 'default' as const,
  },
  {
    key: 'delete',
    label: t('instances.actions.delete'),
    icon: 'i-lucide-trash-2',
    variant: 'danger' as const,
    separator: true, // 在删除操作前添加分隔线
  },
])

function handleMenuSelect(key: string) {
  if (key === 'rename') {
    emit('rename', props.instance.id)
  }
  else if (key === 'delete') {
    emit('delete', props.instance.id)
  }
}
</script>

<template>
  <div
    class="instance-card" :class="[
      `instance-card--${viewMode}`,
    ]"
    @click="$emit('open', instance.id)"
  >
    <!-- 网格视图布局 -->
    <template v-if="viewMode === 'grid'">
      <!-- 标题行：图标 + 名称 + 操作 -->
      <div class="grid-header">
        <div class="instance-icon">
          <img
            v-if="instance.icon"
            :src="iconUrl"
            class="icon-image"
            alt="Instance icon"
          >
          <i v-else class="i-lucide-package default-icon" />
        </div>
        <div class="title-section">
          <h3 class="instance-name">
            {{ instance.name }}
          </h3>
          <p class="instance-description">
            {{ instance.metadata.packCount }} {{ instance.metadata.packCount === 1 ? $t('instances.meta.pack') : $t('instances.meta.packs') }}
          </p>
        </div>
        <div class="instance-actions" @click.stop>
          <BaseDropdownMenu
            :items="menuItems"
            align="end"
            side="bottom"
            @select="handleMenuSelect"
          >
            <template #trigger>
              <button class="action-button">
                <i class="i-lucide-more-vertical h-4 w-4" />
              </button>
            </template>
          </BaseDropdownMenu>
        </div>
      </div>

      <!-- 版本和时间 -->
      <div class="instance-meta">
        <BaseBadge variant="info" size="sm">
          {{ instance.minecraftVersion }}
        </BaseBadge>

        <div class="meta-time">
          <i class="i-lucide-clock" />
          <Time :datetime="instance.updatedAt" relative />
        </div>
      </div>
    </template>

    <!-- 列表视图布局 -->
    <template v-else>
      <div class="instance-icon">
        <img
          v-if="instance.icon"
          :src="iconUrl"
          class="icon-image"
          alt="Instance icon"
        >
        <i v-else class="i-lucide-package default-icon" />
      </div>

      <div class="list-content">
        <div class="title-section">
          <h3 class="instance-name">
            {{ instance.name }}
          </h3>
          <p class="instance-description">
            {{ instance.metadata.packCount }} {{ instance.metadata.packCount === 1 ? $t('instances.meta.pack') : $t('instances.meta.packs') }}
          </p>
        </div>
        <div class="instance-meta">
          <BaseBadge variant="info" size="sm">
            {{ instance.minecraftVersion }}
          </BaseBadge>
          <div class="meta-time">
            <i class="i-lucide-clock" />
            <Time :datetime="instance.updatedAt" relative />
          </div>
        </div>
      </div>

      <div class="instance-actions" @click.stop>
        <BaseDropdownMenu
          :items="menuItems"
          align="end"
          side="bottom"
          @select="handleMenuSelect"
        >
          <template #trigger>
            <button class="action-button">
              <i class="i-lucide-more-vertical h-4 w-4" />
            </button>
          </template>
        </BaseDropdownMenu>
      </div>
    </template>
  </div>
</template>

<style scoped>
.instance-card {
  @apply bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700;
  @apply rounded-lg cursor-pointer transition-all duration-200;
  @apply hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600;
  contain: layout style;
}

/* 网格视图模式 */
.instance-card--grid {
  @apply flex flex-col p-4 space-y-3 w-full;
  min-width: 280px;
}

.grid-header {
  @apply flex items-center space-x-3;
}

.instance-card--grid .instance-meta {
  @apply flex items-center justify-between;
}

/* 列表视图模式 */
.instance-card--list {
  @apply flex items-center p-3 space-x-4;
}

.list-content {
  @apply flex-1 min-w-0;
}

.instance-card--list .instance-meta {
  @apply flex items-center space-x-3 mt-1;
}

.instance-card--list .instance-name {
  @apply min-w-0 truncate;
}

/* 实例图标 */
.instance-icon {
  @apply flex-shrink-0 flex items-center justify-center;
}

.instance-card--grid .instance-icon {
  @apply w-12 h-12;
}

.instance-card--list .instance-icon {
  @apply w-10 h-10;
}

.icon-image {
  @apply w-full h-full;
  image-rendering: pixelated;
}

.default-icon {
  @apply text-lg text-zinc-400;
}

/* 标题区域 */
.title-section {
  @apply flex-1 min-w-0;
}

.instance-name {
  @apply font-semibold text-zinc-900 dark:text-zinc-100;
  @apply truncate leading-tight;
}

.instance-description {
  @apply text-sm text-zinc-600 dark:text-zinc-400;
  @apply truncate mt-0.5;
}

.instance-meta {
  @apply text-sm;
}

.meta-badges {
  @apply items-center;
}

.pack-count {
  @apply text-xs text-zinc-500 dark:text-zinc-400;
}

.meta-time {
  @apply flex items-center space-x-1 text-xs text-zinc-500 dark:text-zinc-400;
}

.meta-time i {
  @apply text-xs;
}

.action-button {
  @apply w-8 h-8 flex items-center justify-center;
  @apply rounded-lg transition-colors duration-150;
  @apply text-zinc-400 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300;
  @apply hover:bg-zinc-100 dark:hover:bg-zinc-800;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1;
  @apply cursor-pointer;
}

/* 操作位置调整 */
.instance-actions {
  @apply flex-shrink-0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .instance-card--list .content-main {
    @apply flex-col items-start space-x-0 space-y-2;
  }

  .instance-card--list .instance-meta {
    @apply flex-col items-start space-x-0 space-y-1;
  }

  .instance-card--list .instance-name {
    @apply w-full;
  }
}
</style>
