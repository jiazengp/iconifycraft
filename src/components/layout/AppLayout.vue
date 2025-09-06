<script setup lang="ts">
import type { AtlasGroup } from '~/types/atlas'
import type { SavedInstance } from '~/types/instance'
import { computed, onMounted, watch } from 'vue'
import AtlasPreview from '~/components/atlas/AtlasPreview.vue'
import AtlasPreviewSkeleton from '~/components/atlas/AtlasPreviewSkeleton.vue'
import ExportConfirmationDialog from '~/components/ExportConfirmationDialog.vue'
import ExportSettingsDialog from '~/components/ExportSettingsDialog.vue'
import IconDetailDialog from '~/components/IconDetailDialog.vue'
import VirtualIconList from '~/components/VirtualIconList.vue'
import VirtualIconListSkeleton from '~/components/VirtualIconListSkeleton.vue'
import { useAppLayout } from '~/composables/useAppLayout'
import { useAtlasGenerator } from '~/composables/useAtlasGenerator'
import { useAtlasHandlers } from '~/composables/useAtlasHandlers'
import { useIconExport } from '~/composables/useIconExport'
import { useInstanceManager } from '~/composables/useInstanceManager'
import { useNotificationHandlers } from '~/composables/useNotificationHandlers'
import { useResourcePackHandlers } from '~/composables/useResourcePackHandlers'
import { useUnsavedChanges } from '~/composables/useUnsavedChanges'

import EmptyState from './EmptyState.vue'
import Sidebar from './Sidebar.vue'

interface Props {
  initialInstance?: SavedInstance
}

const props = defineProps<Props>()

// 应用状态管理
const {
  selectedVersion,
  resourcePacks,
  namespace,
  showIconDetail,
  selectedIcon,
  versionSelected,
  hasResourcePacks,
  defaultFontName,
  getAllTextures,
  openIconDetail,
  createComputedHelpers,
} = useAppLayout()

// 图集生成器
const {
  atlasGenerated,
  atlasImage,
  atlasSize,
  textureSize,
  totalTextures,
  unicodeStart,
  unicodeEnd,
  atlasLayout,
  isGenerating,
  iconList,
  atlasResult,
  packStats,
  canGenerate,
  generateAtlas,
} = useAtlasGenerator(getAllTextures, namespace)

// 为导出hook提供atlas状态
const atlasState = computed(() => ({
  atlasGenerated: atlasGenerated.value,
  iconList: iconList.value,
  atlasImage: atlasImage.value,
  atlasSize: atlasSize.value,
  textureSize: textureSize.value,
  unicodeStart: unicodeStart.value,
  unicodeEnd: unicodeEnd.value,
  atlasResult: atlasResult.value,
}))

// 导出功能
const {
  showExportSettings,
  showExportConfirmation,
  currentExportData,
  currentLicenseFileName,
  canExport,
  totalIcons,
  isExporting,
  exportProgress,
  openExportSettings,
  handleExportSettings,
  handleGoBack,
  confirmExport,
} = useIconExport(atlasState, selectedVersion, namespace)

// 实例管理和状态跟踪
const { loading: instanceLoading } = useInstanceManager()
const { startTracking, updateTrackedState } = useUnsavedChanges()

// 计算属性
const {
  safeExportData,
  atlasFileNames,
  fontFileNames,
  currentAtlasImage: _currentAtlasImage,
  emptyStateConfig,
} = createComputedHelpers(currentExportData, atlasResult, atlasImage)

// 创建类型兼容的 currentAtlasImage，保持原始类型
const currentAtlasImage = computed(() => _currentAtlasImage.value)

// 资源包事件处理
const {
  handleVanillaPacksLoaded,
  handlePacksUploaded,
  handlePackRemoved,
  handlePacksReordered,
  debouncedAutoSave,
} = useResourcePackHandlers(resourcePacks, selectedVersion, namespace, computed(() => currentAtlasImage.value ?? null))

// 图集和实例事件处理
const {
  handleGenerateAtlas,
  createSaveHandler,
  initializeInstanceData,
} = useAtlasHandlers(props, selectedVersion, namespace, resourcePacks, generateAtlas, debouncedAutoSave)

const handleSaveInstance = createSaveHandler(computed(() => currentAtlasImage.value ?? null), currentExportData)

// 通知事件处理
const {
  handleCopySuccess,
  handleDetailCopySuccess,
} = useNotificationHandlers()

// 初始化
onMounted(() => {
  startTracking({
    resourcePacks: resourcePacks.value,
    minecraftVersion: selectedVersion.value || '',
    namespace: namespace.value,
    atlasGenerated: atlasGenerated.value,
    atlasResult: atlasResult.value,
  })
})

initializeInstanceData()

// 监听状态变化
watch(selectedVersion, (newVersion, oldVersion) => {
  updateTrackedState({ minecraftVersion: newVersion || '' })
  if (oldVersion && newVersion !== oldVersion) {
    debouncedAutoSave()
  }
})

watch(namespace, (newNamespace, oldNamespace) => {
  updateTrackedState({ namespace: newNamespace })
  if (oldNamespace && newNamespace !== oldNamespace) {
    debouncedAutoSave()
  }
})
</script>

<template>
  <div class="app-layout">
    <div class="mx-auto max-w-7xl px-4 py-6 lg:px-8 sm:px-6">
      <div class="slide-enter-content grid grid-cols-1 gap-6 lg:grid-cols-4 xl:gap-8">
        <!-- 左侧边栏 -->
        <div class="lg:col-span-1 space-y-4">
          <Sidebar
            v-model:selected-version="selectedVersion"
            v-model:namespace="namespace"
            :resource-packs="resourcePacks"
            :atlas-groups="atlasResult?.atlasGroups ? [...atlasResult.atlasGroups] as AtlasGroup[] : undefined"
            :font-groups="atlasResult?.fontGroups ? [...atlasResult.fontGroups] : undefined"
            :can-generate="canGenerate"
            :is-generating="isGenerating"
            :can-export="canExport"
            :can-save="hasResourcePacks"
            :is-saving="instanceLoading"
            @vanilla-packs-loaded="handleVanillaPacksLoaded"
            @packs-uploaded="handlePacksUploaded"
            @pack-removed="handlePackRemoved"
            @packs-reordered="handlePacksReordered"
            @generate-atlas="handleGenerateAtlas"
            @open-export="openExportSettings"
            @save-instance="handleSaveInstance"
          />
        </div>

        <!-- 主内容区 -->
        <div class="lg:col-span-3">
          <div class="slide-enter-content--fast space-y-6">
            <!-- 生成中的骨架屏 -->
            <template v-if="isGenerating">
              <!-- 图集预览骨架屏 -->
              <AtlasPreviewSkeleton />
              <!-- 图标列表骨架屏 -->
              <VirtualIconListSkeleton />
            </template>

            <!-- 正常内容 -->
            <template v-else>
              <!-- 图集预览 -->
              <div v-if="atlasGenerated && atlasImage">
                <AtlasPreview
                  :atlas-image="atlasImage"
                  :atlas-size="atlasSize"
                  :total-textures="totalTextures"
                  :texture-size="textureSize"
                  :unicode-start="unicodeStart"
                  :unicode-end="unicodeEnd"
                  :atlas-layout="atlasLayout"
                  :atlas-groups="atlasResult?.atlasGroups ? [...atlasResult.atlasGroups] as AtlasGroup[] : undefined"
                  :pack-stats="packStats"
                />
              </div>

              <!-- 图标预览列表 -->
              <div v-if="iconList.length > 0">
                <VirtualIconList
                  :icons="iconList"
                  :atlas-groups="atlasResult?.atlasGroups ? [...atlasResult.atlasGroups] as AtlasGroup[] : undefined"
                  :icon-size="32"
                  @icon-click="openIconDetail"
                  @copy-success="handleCopySuccess"
                />
              </div>

              <!-- 空状态 -->
              <EmptyState
                v-if="!atlasGenerated"
                v-bind="emptyStateConfig"
                :version-selected="versionSelected"
                :has-resource-packs="hasResourcePacks"
                :atlas-generated="atlasGenerated"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 图标详情对话框 -->
    <IconDetailDialog
      v-model:open="showIconDetail"
      :icon-data="selectedIcon"
      :atlas-groups="atlasResult?.atlasGroups ? [...atlasResult.atlasGroups] as AtlasGroup[] : undefined"
      :font-groups="atlasResult?.fontGroups ? [...atlasResult.fontGroups] : undefined"
      :atlas-size="atlasSize"
      :texture-size="textureSize"
      :font-name="defaultFontName"
      @copy-success="handleDetailCopySuccess"
    />

    <!-- 导出对话框 -->
    <ExportSettingsDialog
      v-model:open="showExportSettings"
      :icon-count="totalIcons"
      :source-packs="resourcePacks.map(pack => ({ name: pack.name, author: pack.metadata?.author, description: pack.metadata?.pack?.description }))"
      @export="handleExportSettings"
    />

    <ExportConfirmationDialog
      v-model:open="showExportConfirmation"
      :export-data="safeExportData"
      :icon-count="totalIcons"
      :source-packs="resourcePacks.map(pack => ({ name: pack.name, author: pack.metadata?.author, description: pack.metadata?.pack?.description }))"
      :license-file-name="currentLicenseFileName"
      :font-name="defaultFontName"
      :atlas-file-names="atlasFileNames"
      :font-file-names="fontFileNames"
      :atlas-image="currentAtlasImage"
      :is-exporting="isExporting"
      :export-progress="exportProgress"
      @export="confirmExport"
      @go-back="handleGoBack"
    />
  </div>
</template>
