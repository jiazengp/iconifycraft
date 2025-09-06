<script setup lang="ts">
import type { AtlasGroup, FontGroup } from '~/types/atlas'
import { computed } from 'vue'
import Card from '~/components/base/Card.vue'

interface Props {
  namespace: string
  atlasGroups?: AtlasGroup[]
  fontGroups?: FontGroup[]
  unified?: boolean
}

interface Emits {
  (e: 'update:namespace', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  unified: false,
})
const emit = defineEmits<Emits>()

const localNamespace = computed({
  get: () => props.namespace,
  set: value => emit('update:namespace', value),
})

const generatedFonts = computed(() => {
  if (props.fontGroups && props.fontGroups.length > 0) {
    return props.fontGroups.map(fontGroup => ({
      name: fontGroup.fontName,
      bitmapCount: fontGroup.atlasGroups.length,
    }))
  }

  if (props.atlasGroups && props.atlasGroups.length > 0) {
    return props.atlasGroups.map(group => ({
      name: group.fontName,
      bitmapCount: 1,
    }))
  }

  return []
})
</script>

<template>
  <Card
    v-if="!unified"
    :title="$t('font.namespace.title')"
    icon="i-lucide-type"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <input
          v-model="localNamespace"
          type="text"
          class="w-full border border-zinc-300 rounded-lg bg-white px-3 py-2 text-sm text-zinc-900 transition-colors dark:border-zinc-600 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500"
          placeholder="minecraft"
        >
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          {{ $t('font.namespace.description') }}
        </p>
      </div>

      <div v-if="generatedFonts.length > 0" class="space-y-3">
        <label class="block text-sm text-zinc-700 font-medium dark:text-zinc-300">
          <i class="i-lucide-file-text mr-1.5 text-zinc-400" />
          {{ $t('font.generatedFiles.title') }}
        </label>
        <div class="space-y-2">
          <div
            v-for="(font, index) in generatedFonts"
            :key="index"
            class="flex items-center justify-between border border-zinc-200 rounded-lg bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div class="flex items-center space-x-2">
              <i class="i-lucide-file text-sm text-zinc-500" />
              <span class="text-sm text-zinc-700 font-mono dark:text-zinc-300">
                {{ font.name }}
              </span>
            </div>
            <div class="flex items-center space-x-1">
              <i class="i-lucide-layers text-xs text-zinc-400" />
              <span class="text-xs text-zinc-500 dark:text-zinc-400">
                {{ $t('font.generatedFiles.bitmapCount', { count: font.bitmapCount }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>

  <!-- Unified layout -->
  <div v-else class="space-y-4">
    <!-- Section header -->
    <div class="mb-4 flex items-center space-x-3">
      <i class="i-lucide-type text-lg text-zinc-700 dark:text-zinc-300" />
      <h3 class="text-base text-zinc-900 font-semibold tracking-tight dark:text-zinc-100">
        {{ $t('font.namespace.title') }}
      </h3>
    </div>

    <div class="space-y-2">
      <input
        v-model="localNamespace"
        type="text"
        class="w-full border border-zinc-300 rounded-lg bg-white px-3 py-2 text-sm text-zinc-900 transition-colors dark:border-zinc-600 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500"
        placeholder="minecraft"
      >
      <p class="text-xs text-zinc-500 dark:text-zinc-400">
        {{ $t('font.namespace.description') }}
      </p>
    </div>

    <div v-if="generatedFonts.length > 0" class="space-y-3">
      <label class="block text-sm text-zinc-700 font-medium dark:text-zinc-300">
        <i class="i-lucide-file-text mr-1.5 text-zinc-400" />
        {{ $t('font.generatedFiles.title') }}
      </label>
      <div class="space-y-2">
        <div
          v-for="(font, index) in generatedFonts"
          :key="index"
          class="flex items-center justify-between border border-zinc-200 rounded-lg bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div class="flex items-center space-x-2">
            <i class="i-lucide-file text-sm text-zinc-500" />
            <span class="text-sm text-zinc-700 font-mono dark:text-zinc-300">
              {{ font.name }}
            </span>
          </div>
          <div class="flex items-center space-x-1">
            <i class="i-lucide-layers text-xs text-zinc-400" />
            <span class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ $t('font.generatedFiles.bitmapCount', { count: font.bitmapCount }) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
