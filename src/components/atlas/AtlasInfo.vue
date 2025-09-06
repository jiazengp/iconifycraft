<script setup lang="ts">
import type { AtlasGroup } from '~/types/atlas'
import { computed } from 'vue'
import InfoRow from '~/components/base/InfoRow.vue'

interface Props {
  textureSize: number
  unicodeStart: string
  unicodeEnd: string
  atlasLayout: string
  atlasInfoText?: string
  currentAtlasIndex?: number
  atlasGroups?: AtlasGroup[]
  packStats?: Record<string, { used: number, overridden: number }> | null
}

const props = defineProps<Props>()

const totalTextures = computed(() => {
  if (!props.packStats)
    return 0
  return Object.values(props.packStats).reduce((sum, stats) => sum + stats.used, 0)
})

const packStatsSorted = computed(() => {
  if (!props.packStats)
    return []

  return Object.entries(props.packStats)
    .filter(([_, stats]) => stats.used > 0)
    .map(([packName, stats]) => ({
      packName,
      used: stats.used,
      overridden: stats.overridden,
      percentage: totalTextures.value > 0 ? Math.round((stats.used / totalTextures.value) * 100) : 0,
    }))
    .sort((a, b) => b.used - a.used)
})

const packColors = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#eab308', // yellow-500
]

function getPackColor(index: number): string {
  return packColors[index % packColors.length]
}
</script>

<template>
  <div class="atlas-info">
    <h4 class="mb-3 text-gray-900 font-medium dark:text-gray-100">
      {{ $t('atlas.info.title') }}
    </h4>
    <div class="text-sm space-y-2">
      <InfoRow v-if="atlasInfoText" :label="$t('atlas.info.size')" :value="atlasInfoText" />
      <InfoRow v-if="atlasGroups && atlasGroups.length > 1" :label="$t('atlas.info.count')" :value="$t('atlas.info.countValue', { current: (currentAtlasIndex ?? 0) + 1, total: atlasGroups.length })" />
      <InfoRow :label="$t('atlas.info.textureSize')" :value="`${textureSize}x${textureSize}`" />
      <InfoRow :label="$t('atlas.info.unicodeRange')" :value="`U+${unicodeStart} - U+${unicodeEnd}`" />
      <InfoRow :label="$t('atlas.info.layout')" :value="atlasLayout" />
    </div>

    <div v-if="packStatsSorted.length > 0" class="mt-6">
      <h4 class="mb-3 text-gray-900 font-medium dark:text-gray-100">
        {{ $t('atlas.packStats.title') }}
      </h4>
      <div class="border border-zinc-200 rounded-lg bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div class="mb-4 h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div class="h-full flex">
            <div
              v-for="(packStat, index) in packStatsSorted"
              :key="packStat.packName"
              class="transition-all duration-500"
              :style="`width: ${packStat.percentage}%; background-color: ${getPackColor(index)}`"
              :title="`${packStat.packName}: ${packStat.percentage}%`"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2 text-xs">
          <div
            v-for="(packStat, index) in packStatsSorted"
            :key="packStat.packName"
            class="flex items-center justify-between"
          >
            <div class="min-w-0 flex items-center space-x-2">
              <div
                class="h-3 w-3 flex-shrink-0 rounded-sm"
                :style="`background-color: ${getPackColor(index)}`"
              />
              <span class="truncate text-zinc-900 font-medium dark:text-zinc-100">
                {{ packStat.packName }}
              </span>
            </div>
            <div class="ml-2 flex flex-shrink-0 items-center space-x-3">
              <span class="text-zinc-700 font-bold dark:text-zinc-300">
                {{ packStat.percentage }}%
              </span>
              <span class="text-zinc-500 dark:text-zinc-400">
                {{ $t('atlas.packStats.textureCount', { count: packStat.used }) }}
              </span>
              <span v-if="packStat.overridden > 0" class="text-xs text-orange-500">
                {{ $t('atlas.packStats.overridden', { count: packStat.overridden }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
