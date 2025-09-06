<script setup lang="ts">
import type { ResourcePack } from '~/types/resource-pack'
import { computed, ref } from 'vue'
import { useResourcePackStore } from '~/stores/resource-pack'

interface Props {
  pack: Readonly<ResourcePack>
  priority: number
  total: number
  isDragging?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDragging: false,
})

defineEmits<{ remove: [] }>()

const packStore = useResourcePackStore()
const showDetails = ref(false)
const showConflicts = ref(false)

const blockCount = computed(() =>
  props.pack.textures.filter(t => t.category === 'block').length,
)

const itemCount = computed(() =>
  props.pack.textures.filter(t => t.category === 'item').length,
)

const namespaceCount = computed(() =>
  new Set(props.pack.textures.map(t => t.namespace)).size,
)

const packConflicts = computed(() =>
  packStore.inheritance.conflicts.filter(conflict =>
    conflict.packs.includes(props.pack.name),
  ),
)

function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<template>
  <div
    class="pack-item group select-none border border-gray-200 rounded-lg bg-white p-4 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800"
    :class="{
      'ring-2 ring-blue-500 shadow-lg transform scale-105': isDragging,
      'cursor-grab': !isDragging,
      'cursor-grabbing': isDragging,
      'hover:shadow-md': !isDragging,
    }"
  >
    <div class="flex items-center justify-between">
      <!-- 拖拽手柄 -->
      <div class="drag-handle mr-3 h-10 w-10 flex cursor-grab items-center justify-center rounded-lg transition-colors active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700">
        <div class="flex flex-col space-y-1">
          <div class="flex space-x-1">
            <div class="h-1 w-1 rounded-full bg-gray-400" />
            <div class="h-1 w-1 rounded-full bg-gray-400" />
          </div>
          <div class="flex space-x-1">
            <div class="h-1 w-1 rounded-full bg-gray-400" />
            <div class="h-1 w-1 rounded-full bg-gray-400" />
          </div>
          <div class="flex space-x-1">
            <div class="h-1 w-1 rounded-full bg-gray-400" />
            <div class="h-1 w-1 rounded-full bg-gray-400" />
          </div>
        </div>
      </div>

      <div class="min-w-0 flex flex-1 items-center">
        <div class="mr-3 h-10 w-10 flex-shrink-0 overflow-hidden border border-zinc-200 rounded-lg dark:border-zinc-600">
          <img
            v-if="pack.icon"
            :src="pack.icon"
            :alt="pack.name"
            class="h-full w-full object-cover"
            style="image-rendering: pixelated;"
          >
          <div
            v-else
            class="h-full w-full flex items-center justify-center from-zinc-100 to-zinc-200 bg-gradient-to-br dark:from-zinc-700 dark:to-zinc-800"
          >
            <i class="i-lucide-package text-sm text-zinc-400" />
          </div>
        </div>

        <div class="mr-3 h-8 w-8 flex items-center justify-center border border-blue-200 rounded-lg from-blue-100 to-blue-200 bg-gradient-to-br shadow-sm dark:border-blue-700 dark:from-blue-800 dark:to-blue-900">
          <span class="text-xs text-blue-600 font-bold dark:text-blue-300">
            {{ priority }}
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center">
            <h4 class="truncate text-gray-900 font-medium dark:text-gray-100">
              {{ pack.name }}
            </h4>
            <RBadge v-if="pack.isVanilla" variant="secondary" class="ml-2">
              {{ $t('pack.vanilla') }}
            </RBadge>
          </div>

          <div class="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{{ formatFileSize(pack.size) }}</span>
            <span class="mx-2">•</span>
            <span>{{ pack.textures.length }} {{ $t('pack.textures') }}</span>
            <span class="mx-2">•</span>
            <span>{{ $t('pack.version') }} {{ pack.version }}</span>
          </div>
        </div>
      </div>

      <div class="ml-4 flex items-center space-x-2">
        <RButton
          v-if="!pack.isVanilla"
          variant="ghost"
          size="sm"
          class="text-red-600 opacity-0 transition-colors hover:bg-red-50 hover:text-red-700 group-hover:opacity-100 dark:hover:bg-red-900/20"
          @click="$emit('remove')"
        >
          <i class="i-carbon-trash-can" />
        </RButton>

        <RDropdownMenu>
          <RDropdownMenuTrigger as-child>
            <RButton variant="ghost" size="sm" class="opacity-70 hover:opacity-100">
              <i class="i-carbon-overflow-menu-vertical" />
            </RButton>
          </RDropdownMenuTrigger>
          <RDropdownMenuContent align="end">
            <RDropdownMenuItem @click="showDetails = true">
              <i class="i-carbon-information mr-2" />
              {{ $t('pack.details') }}
            </RDropdownMenuItem>
            <RDropdownMenuItem @click="showConflicts = true">
              <i class="i-carbon-warning mr-2" />
              {{ $t('pack.conflicts') }}
            </RDropdownMenuItem>
          </RDropdownMenuContent>
        </RDropdownMenu>
      </div>
    </div>

    <Transition name="expand">
      <div v-if="showDetails" class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 class="mb-2 text-gray-900 font-medium dark:text-gray-100">
              {{ $t('pack.statistics') }}
            </h5>
            <div class="text-gray-600 space-y-1 dark:text-gray-400">
              <div class="flex justify-between">
                <span>{{ $t('pack.blocks') }}:</span>
                <span>{{ blockCount }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('pack.items') }}:</span>
                <span>{{ itemCount }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('pack.namespaces') }}:</span>
                <span>{{ namespaceCount }}</span>
              </div>
            </div>
          </div>

          <div>
            <h5 class="mb-2 text-gray-900 font-medium dark:text-gray-100">
              {{ $t('pack.metadata') }}
            </h5>
            <div class="text-gray-600 space-y-1 dark:text-gray-400">
              <div v-if="pack.metadata.pack?.description">
                <span class="font-medium">{{ $t('pack.description') }}:</span>
                <p class="mt-1 text-xs">
                  {{ pack.metadata.pack.description }}
                </p>
              </div>
              <div>
                <span class="font-medium">{{ $t('pack.uploaded') }}:</span>
                <span class="text-xs">{{ formatDate(pack.uploadedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <RButton variant="ghost" size="sm" @click="showDetails = false">
            {{ $t('common.close') }}
          </RButton>
        </div>
      </div>
    </Transition>

    <RDialog v-model:open="showConflicts">
      <RDialogContent class="max-w-2xl">
        <RDialogHeader>
          <RDialogTitle>{{ $t('pack.conflicts') }} - {{ pack.name }}</RDialogTitle>
          <RDialogDescription>{{ $t('pack.conflictsDescription') }}</RDialogDescription>
        </RDialogHeader>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="packConflicts.length === 0" class="py-8 text-center">
            <i class="i-carbon-checkmark-filled mb-2 text-4xl text-green-600" />
            <p class="text-gray-600 dark:text-gray-400">
              {{ $t('pack.noConflicts') }}
            </p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="conflict in packConflicts"
              :key="conflict.textureId"
              class="border border-yellow-200 rounded-lg bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-yellow-800 font-medium dark:text-yellow-200">
                    {{ conflict.textureId }}
                  </p>
                  <p class="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                    {{ $t('pack.conflictWith') }}: {{ conflict.packs.join(', ') }}
                  </p>
                </div>
                <i class="i-carbon-warning text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <RDialogFooter>
          <RButton variant="outline" @click="showConflicts = false">
            {{ $t('common.close') }}
          </RButton>
        </RDialogFooter>
      </RDialogContent>
    </RDialog>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}

.pack-item {
  transform: translate3d(0, 0, 0);
}

.drag-handle {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Sortable.js classes */
.sortable-ghost {
  opacity: 0.4;
  transform: scale(0.95);
}

.sortable-chosen {
  cursor: grabbing;
}

.sortable-drag {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: rotate(5deg) scale(1.05);
  z-index: 1000;
}

/* 删除区域视觉反馈 */
.delete-zone-active {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}
</style>
