<script setup lang="ts">
import type { AtlasGroup, FontGroup } from '~/types/atlas'
import type { ResourcePack } from '~/types/resource-pack'
import MinecraftVersionSelector from '~/components/minecraft/MinecraftVersionSelector.vue'
import ResourcePackUploader from '~/components/resource-pack/ResourcePackUploader.vue'
import ActionPanel from './ActionPanel.vue'
import FontSettings from './FontSettings.vue'

interface Props {
  selectedVersion: string | null
  resourcePacks: ResourcePack[]
  namespace: string
  atlasGroups?: AtlasGroup[]
  fontGroups?: FontGroup[]
  canGenerate: boolean
  isGenerating: boolean
  canExport: boolean
  canSave?: boolean
  isSaving?: boolean
}

interface Emits {
  (e: 'update:selectedVersion', value: string | null): void
  (e: 'update:namespace', value: string): void
  (e: 'vanillaPacksLoaded', packs: ResourcePack[]): void
  (e: 'packsUploaded', packs: ResourcePack[]): void
  (e: 'packRemoved', packId: string): void
  (e: 'packsReordered', packs: ResourcePack[]): void
  (e: 'generateAtlas'): void
  (e: 'openExport'): void
  (e: 'saveInstance'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const showSaveButton = computed(() => {
  return props.canSave && props.resourcePacks.length > 0
})

// 本地双向绑定
const localSelectedVersion = computed({
  get: () => props.selectedVersion,
  set: value => emit('update:selectedVersion', value),
})

const localNamespace = computed({
  get: () => props.namespace,
  set: value => emit('update:namespace', value),
})

// 事件处理函数
function handleVanillaPacksLoaded(packs: ResourcePack[]) {
  emit('vanillaPacksLoaded', packs)
}

function handlePacksUploaded(packs: ResourcePack[]) {
  emit('packsUploaded', packs)
}

function handlePackRemoved(packId: string) {
  emit('packRemoved', packId)
}

function handlePacksReordered(packs: ResourcePack[]) {
  emit('packsReordered', packs)
}

function handleGenerateAtlas() {
  emit('generateAtlas')
}

function handleOpenExport() {
  emit('openExport')
}

function handleSaveInstance() {
  emit('saveInstance')
}
</script>

<template>
  <div class="unified-sidebar-container slide-enter-left">
    <!-- 版本选择 -->
    <div class="sidebar-section">
      <MinecraftVersionSelector
        v-model="localSelectedVersion"
        :unified="true"
        @vanilla-packs-loaded="handleVanillaPacksLoaded"
      />
    </div>

    <!-- 分割线 -->
    <div class="sidebar-divider" />

    <!-- 材质包上传 -->
    <div class="sidebar-section">
      <ResourcePackUploader
        :resource-packs="resourcePacks"
        :unified="true"
        @packs-uploaded="handlePacksUploaded"
        @pack-removed="handlePackRemoved"
        @packs-reordered="handlePacksReordered"
      />
    </div>

    <!-- 分割线 -->
    <div class="sidebar-divider" />

    <!-- 字体设置 -->
    <div class="sidebar-section">
      <FontSettings
        v-model:namespace="localNamespace"
        :atlas-groups="atlasGroups"
        :font-groups="fontGroups"
        :unified="true"
      />
    </div>

    <!-- 分割线 -->
    <div class="sidebar-divider" />

    <!-- 操作面板 -->
    <div class="sidebar-section">
      <ActionPanel
        :can-generate="canGenerate"
        :is-generating="isGenerating"
        :can-export="canExport"
        :can-save="showSaveButton"
        :is-saving="isSaving"
        :unified="true"
        @generate-atlas="handleGenerateAtlas"
        @open-export="handleOpenExport"
        @save-instance="handleSaveInstance"
      />
    </div>

    <!-- 分割线 -->
    <div class="sidebar-divider" />

    <!-- 设置链接 -->
    <div class="sidebar-section">
      <router-link
        :to="$route.path.includes('/en/') ? '/en/settings' : '/settings'"
        class="settings-link"
      >
        <div class="flex items-center space-x-3">
          <i class="i-lucide-settings text-sm text-zinc-600 dark:text-zinc-400" />
          <span class="text-sm text-zinc-900 font-medium dark:text-zinc-100">
            {{ t('settings.title') }}
          </span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.unified-sidebar-container {
  @apply bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm overflow-hidden;
}

.sidebar-section {
  @apply px-4 py-5;
}

.sidebar-section:first-child {
  @apply pt-5;
}

.sidebar-section:last-child {
  @apply pb-5;
}

.sidebar-divider {
  @apply h-px bg-border/60 mx-4;
}

.settings-link {
  @apply flex items-center w-full px-3 py-2 rounded-lg
         hover:bg-zinc-100 dark:hover:bg-zinc-800
         transition-colors duration-200;
}
</style>
