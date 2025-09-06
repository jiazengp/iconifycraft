<script setup lang="ts">
import type { ResourcePack } from '~/types/resource-pack'
import { ref, watch } from 'vue'
import Card from '~/components/base/Card.vue'
import { useVanillaPack } from '~/composables/useVanillaPack'

interface MinecraftVersion {
  id: string
  name: string
  packFormat: number
}

interface Props {
  modelValue?: string | null
  resourcePacks?: ResourcePack[]
  unified?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
  (e: 'versionChanged', version: string | null): void
  (e: 'vanillaPacksLoaded', packs: ResourcePack[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  resourcePacks: () => [],
  unified: false,
})

const emit = defineEmits<Emits>()

const { t: $t } = useI18n()
const { loadVanillaPacks } = useVanillaPack()

const selectedVersion = ref(props.modelValue || '')

const minecraftVersions: MinecraftVersion[] = [
  { id: '1.21.8', name: 'Minecraft 1.21.8', packFormat: 48 },
  { id: '1.21.7', name: 'Minecraft 1.21.7', packFormat: 48 },
  { id: '1.21.6', name: 'Minecraft 1.21.6', packFormat: 48 },
  { id: '1.21.5', name: 'Minecraft 1.21.5', packFormat: 48 },
  { id: '1.21.4', name: 'Minecraft 1.21.4', packFormat: 48 },
  { id: '1.21.3', name: 'Minecraft 1.21.3', packFormat: 48 },
  { id: '1.21.2', name: 'Minecraft 1.21.2', packFormat: 48 },
  { id: '1.21.1', name: 'Minecraft 1.21.1', packFormat: 34 },
  { id: '1.21', name: 'Minecraft 1.21', packFormat: 34 },
  { id: '1.20.6', name: 'Minecraft 1.20.6', packFormat: 32 },
  { id: '1.20.5', name: 'Minecraft 1.20.5', packFormat: 32 },
  { id: '1.20.4', name: 'Minecraft 1.20.4', packFormat: 26 },
  { id: '1.20.3', name: 'Minecraft 1.20.3', packFormat: 26 },
  { id: '1.20.2', name: 'Minecraft 1.20.2', packFormat: 18 },
  { id: '1.20.1', name: 'Minecraft 1.20.1', packFormat: 15 },
  { id: '1.20', name: 'Minecraft 1.20', packFormat: 15 },
]

const selectClasses = 'select-modern'

function handleVersionChange() {
  const value = selectedVersion.value || null
  emit('update:modelValue', value)
  emit('versionChanged', value)

  if (selectedVersion.value) {
    handleLoadVanillaPacks(selectedVersion.value)
  }
}

async function handleLoadVanillaPacks(version: string) {
  if (!version)
    return

  const packNames = {
    item: $t('vanilla.pack.itemWithVersion', { version }),
    block: $t('vanilla.pack.blockWithVersion', { version }),
  }

  const loadedPacks = await loadVanillaPacks(version, packNames)

  if (loadedPacks.length > 0) {
    emit('vanillaPacksLoaded', loadedPacks)
  }
}

watch(() => props.modelValue, (newValue) => {
  selectedVersion.value = newValue || ''
})
</script>

<template>
  <Card
    v-if="!unified"
    :title="$t('minecraft.version.title')"
    icon="i-lucide-layers"
  >
    <div class="space-y-4">
      <div class="select-wrapper">
        <select
          v-model="selectedVersion"
          :class="selectClasses"
          @change="handleVersionChange"
        >
          <option value="">
            {{ $t('minecraft.selectVersion') }}
          </option>
          <option
            v-for="version in minecraftVersions"
            :key="version.id"
            :value="version.id"
          >
            {{ version.name }}
          </option>
        </select>
        <div class="select-arrow">
          <i class="i-lucide-chevron-down select-icon" />
        </div>
      </div>

      <div
        v-if="selectedVersion"
        class="flex items-start rounded-lg border-none p-3 space-x-3"
      >
        <div class="flex-shrink-0 rounded bg-zinc-200 p-1 dark:bg-zinc-700">
          <i class="i-lucide-info text-sm text-zinc-600 dark:text-zinc-400" />
        </div>
        <div class="flex-1">
          <p class="text-sm text-zinc-800 font-medium dark:text-zinc-200">
            {{ $t('minecraft.versionSelected') }}
          </p>
          <p class="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            {{ $t('minecraft.willAutoLoad', { version: selectedVersion }) }}
          </p>
        </div>
      </div>
    </div>
  </Card>

  <div v-else class="space-y-4">
    <div class="mb-4 flex items-center space-x-3">
      <i class="i-lucide-layers text-lg text-zinc-700 dark:text-zinc-300" />
      <h3 class="text-base text-zinc-900 font-semibold tracking-tight dark:text-zinc-100">
        {{ $t('minecraft.version.title') }}
      </h3>
    </div>

    <div class="select-wrapper">
      <select
        v-model="selectedVersion"
        :class="selectClasses"
        @change="handleVersionChange"
      >
        <option value="">
          {{ $t('minecraft.selectVersion') }}
        </option>
        <option
          v-for="version in minecraftVersions"
          :key="version.id"
          :value="version.id"
        >
          {{ version.name }}
        </option>
      </select>
      <div class="select-arrow">
        <i class="i-lucide-chevron-down select-icon" />
      </div>
    </div>

    <div
      v-if="selectedVersion"
      class="flex items-start rounded-lg border-none bg-zinc-50 p-3 space-x-3 dark:bg-zinc-800/50"
    >
      <div class="flex-shrink-0 rounded bg-zinc-200 p-1 dark:bg-zinc-700">
        <i class="i-lucide-info text-sm text-zinc-600 dark:text-zinc-400" />
      </div>
      <div class="flex-1">
        <p class="text-sm text-zinc-800 font-medium dark:text-zinc-200">
          {{ $t('minecraft.versionSelected') }}
        </p>
        <p class="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {{ $t('minecraft.willAutoLoad', { version: selectedVersion }) }}
        </p>
      </div>
    </div>
  </div>
</template>
