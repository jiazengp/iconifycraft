<script setup lang="ts">
import type { ResourcePack } from '~/types/resource-pack'
import { useSortable } from '@vueuse/integrations/useSortable'
import { nextTick, ref, watch } from 'vue'

interface Props {
  packs: ResourcePack[]
}

interface Emits {
  (e: 'remove', packId: string): void
  (e: 'reorder', packs: ResourcePack[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const sortableEl = ref<HTMLElement>()

let sortableControl: { stop: () => void } | null = null

function initializeSortable() {
  sortableControl?.stop()

  if (props.packs.length > 0 && sortableEl.value) {
    const packList = ref(props.packs)
    sortableControl = useSortable(sortableEl, packList, {
      handle: '.drag-handle',
      animation: 200,
      ghostClass: 'drag-ghost',
      chosenClass: 'drag-chosen',
      dragClass: 'drag-drag',
      onUpdate: () => emit('reorder', packList.value),
    })
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

watch(() => props.packs, () => nextTick(initializeSortable), { deep: true, immediate: true })
</script>

<template>
  <div>
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm text-zinc-700 font-medium dark:text-zinc-300">加载顺序</span>
      <span class="text-xs text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100">拖拽排序</span>
    </div>

    <div ref="sortableEl" class="space-y-1">
      <div
        v-for="pack in packs"
        :key="pack.id"
        class="group relative flex items-center rounded-lg bg-zinc-50/80 p-2.5 text-sm transition-all dark:bg-zinc-800/60 hover:bg-zinc-100 hover:shadow-sm dark:hover:bg-zinc-700/80"
      >
        <div class="drag-handle absolute left-1 h-6 w-4 flex cursor-grab items-center justify-center rounded opacity-0 transition-all active:cursor-grabbing hover:bg-zinc-200/60 group-hover:opacity-100 dark:hover:bg-zinc-600/60">
          <div class="flex flex-col gap-0.5">
            <div class="h-0.5 w-2 rounded-full bg-zinc-400" />
            <div class="h-0.5 w-2 rounded-full bg-zinc-400" />
            <div class="h-0.5 w-2 rounded-full bg-zinc-400" />
          </div>
        </div>

        <div class="ml-4 mr-3 h-8 w-8 flex-shrink-0 overflow-hidden border border-zinc-200/80 rounded-lg dark:border-zinc-600/60">
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

        <div class="min-w-0 flex-1">
          <div class="truncate text-zinc-800 font-medium dark:text-zinc-200">
            {{ pack.name }}
          </div>
          <div class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ pack.textures.length }} 个材质 · {{ formatFileSize(pack.size) }}
          </div>
        </div>

        <button
          class="ml-2 h-6 w-6 flex items-center justify-center rounded text-red-500 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/30"
          title="移除材质包"
          @click="$emit('remove', pack.id)"
        >
          <i class="i-carbon-trash-can text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drag-ghost {
  @apply opacity-40 scale-95 border-2 border-dashed border-blue-500;
  background: rgba(59, 130, 246, 0.1) !important;
}

.drag-chosen {
  @apply cursor-grabbing scale-105 shadow-lg;
}

.drag-drag {
  @apply opacity-90 scale-105 z-50 shadow-xl;
  transform: rotate(3deg) scale(1.05);
}
</style>
