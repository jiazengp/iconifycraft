<script setup lang="ts">
import type { AtlasGroup } from '~/types/atlas'
import { computed, ref } from 'vue'
import Card from '~/components/base/Card.vue'
import AtlasInfo from './AtlasInfo.vue'

const props = defineProps<Props>()

const { t } = useI18n()

interface Props {
  atlasImage: string
  atlasSize: number
  totalTextures: number
  textureSize: number
  unicodeStart: string
  unicodeEnd: string
  atlasLayout: string
  atlasGroups?: AtlasGroup[]
  packStats?: Record<string, { used: number, overridden: number }> | null
}

const currentAtlasIndex = ref(0)

const cardTitle = computed(() => {
  if (props.atlasGroups && props.atlasGroups.length > 1) {
    return `${t('atlas.preview.title')} (${currentAtlasIndex.value + 1}/${props.atlasGroups.length})`
  }
  return t('atlas.preview.title')
})

const currentAtlasImage = computed(() => {
  if (props.atlasGroups && props.atlasGroups.length > 0) {
    return props.atlasGroups[currentAtlasIndex.value]?.atlasImage || props.atlasImage
  }
  return props.atlasImage
})

const currentAtlasLayout = computed(() => {
  if (props.atlasGroups && props.atlasGroups.length > 0) {
    return props.atlasGroups[currentAtlasIndex.value]?.layout || props.atlasLayout
  }
  return props.atlasLayout
})

const atlasInfoText = computed(() => {
  if (props.atlasGroups && props.atlasGroups.length > 0) {
    const currentGroup = props.atlasGroups[currentAtlasIndex.value]
    if (currentGroup) {
      return t('atlas.preview.info', {
        size: currentGroup.size,
        count: currentGroup.iconData.length,
      })
    }
  }
  return t('atlas.preview.info', {
    size: props.atlasSize,
    count: props.totalTextures,
  })
})

function setCurrentAtlas(index: number) {
  if (props.atlasGroups && index >= 0 && index < props.atlasGroups.length) {
    currentAtlasIndex.value = index
  }
}

function prevAtlas() {
  if (props.atlasGroups) {
    currentAtlasIndex.value = currentAtlasIndex.value > 0
      ? currentAtlasIndex.value - 1
      : props.atlasGroups.length - 1
  }
}

function nextAtlas() {
  if (props.atlasGroups) {
    currentAtlasIndex.value = currentAtlasIndex.value < props.atlasGroups.length - 1
      ? currentAtlasIndex.value + 1
      : 0
  }
}
</script>

<template>
  <Card
    :title="cardTitle"
    icon="i-lucide-grid-3x3"
  >
    <template #header>
      <div v-if="atlasGroups && atlasGroups.length > 1" class="flex items-center space-x-2">
        <div class="flex space-x-1">
          <button
            v-for="(_, index) in atlasGroups"
            :key="index"
            class="h-2 w-2 rounded-full transition-all duration-200"
            :class="{
              'bg-blue-500 w-6': currentAtlasIndex === index,
              'bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500': currentAtlasIndex !== index,
            }"
            @click="setCurrentAtlas(index)"
          />
        </div>
        <span class="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
          {{ currentAtlasIndex + 1 }}/{{ atlasGroups.length }}
        </span>
      </div>
    </template>

    <div class="slide-enter-content flex flex-col gap-6 lg:flex-row">
      <div class="group relative flex-1">
        <div v-if="atlasGroups && atlasGroups.length > 1" class="pointer-events-none absolute inset-0 z-20 flex items-center justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            class="pointer-events-auto ml-3 icon-btn bg-white/95 shadow-lg dark:bg-zinc-900/95"
            @click="prevAtlas"
          >
            <i class="i-lucide-chevron-left text-base" />
          </button>
          <button
            class="pointer-events-auto mr-3 icon-btn bg-white/95 shadow-lg dark:bg-zinc-900/95"
            @click="nextAtlas"
          >
            <i class="i-lucide-chevron-right text-base" />
          </button>
        </div>

        <Transition
          name="atlas-fade"
          mode="out-in"
        >
          <img
            :key="currentAtlasIndex"
            :src="currentAtlasImage"
            :alt="$t('atlas.preview.imageAlt')"
            class="h-auto w-full rounded-lg object-contain shadow-sm"
            style="image-rendering: pixelated; max-height: 500px;"
          >
        </Transition>
      </div>
      <div class="flex-1">
        <AtlasInfo
          :texture-size="textureSize"
          :unicode-start="unicodeStart"
          :unicode-end="unicodeEnd"
          :atlas-layout="currentAtlasLayout"
          :atlas-info-text="atlasInfoText"
          :current-atlas-index="currentAtlasIndex"
          :atlas-groups="atlasGroups"
          :pack-stats="packStats"
        />
      </div>
    </div>
  </Card>
</template>

<style scoped>
.atlas-fade-enter-active,
.atlas-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.atlas-fade-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.atlas-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.atlas-fade-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}
</style>
