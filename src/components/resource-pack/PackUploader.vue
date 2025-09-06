<script setup lang="ts">
import type { MoveEvent, SortableEvent } from 'sortablejs'
import type { ResourcePack } from '~/types/resource-pack'
import { useSortable } from '@vueuse/integrations/useSortable'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useResourcePack } from '~/composables/useResourcePack'
import { useResourcePackStore } from '~/stores/resource-pack'
import PackItem from './PackItem.vue'
import PackStats from './PackStats.vue'
import UploadProgress from './UploadProgress.vue'

// 使用组合式函数
const {
  dragOverlay,
  isOverDropZone,
  validationErrors,
  hasVanillaPack,
  totalPacks,
  isUploading,
  openVanillaDialog,
  openCustomDialog,
  removePack,
  removeVanillaPack,
} = useResourcePack()

const packStore = useResourcePackStore()
const sortableContainer = ref<HTMLElement>()
const isDeleteZone = ref(false)

// 计算属性
const vanillaPack = computed(() => packStore.vanillaPack)
const customPacks = computed(() => packStore.packs)
const uploadProgress = computed(() => packStore.uploadProgress)

const hasUploads = computed(() =>
  Object.keys(uploadProgress.value).length > 0,
)

// 本地可写的资源包列表用于sortable
const localPacks = ref([...packStore.packs])

// 监听store变化更新本地列表
watch(() => packStore.packs, (newPacks) => {
  localPacks.value = [...newPacks]
}, { deep: true })

// 拖拽排序功能
const sortableInstance = useSortable(sortableContainer, localPacks, {
  handle: '.drag-handle',
  animation: 200,
  ghostClass: 'sortable-ghost',
  chosenClass: 'sortable-chosen',
  dragClass: 'sortable-drag',
  onStart() {
    isDeleteZone.value = true
  },
  onEnd(evt: SortableEvent) {
    isDeleteZone.value = false

    // 如果拖拽到删除区域
    if (evt.to === dragOverlay.value || evt.to?.closest('.custom-dropzone')) {
      const packId = evt.item.dataset.packId
      if (packId) {
        removePack(packId)
      }
      return
    }

    // 处理排序变更
    if (evt.newIndex !== undefined && evt.oldIndex !== undefined) {
      packStore.reorderPacks(evt.oldIndex, evt.newIndex)
    }
  },
  onMove(evt: MoveEvent) {
    // 禁止拖拽到上传区域之外
    return !evt.to?.classList.contains('custom-dropzone')
  },
})

// 方法
function formatFileSize(bytes?: number): string {
  if (!bytes)
    return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

function cancelUpload(packId: string) {
  // 实现上传取消逻辑
  const progress = { ...uploadProgress.value }
  delete progress[packId]
  packStore.$patch({ uploadProgress: progress })
}

// 生命周期
onMounted(() => {
  // 初始化拖拽排序
  if (sortableContainer.value && customPacks.value.length > 0) {
    sortableInstance.option('disabled', false)
  }
})

onUnmounted(() => {
  // 清理拖拽实例
  if (sortableInstance) {
    sortableInstance.stop()
  }
})
</script>

<template>
  <div class="pack-uploader">
    <!-- 原版材质包上传区域 -->
    <div class="vanilla-section mb-8">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">
            {{ $t('upload.vanilla.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('upload.vanilla.description') }}
          </p>
        </div>
        <RButton
          v-if="!hasVanillaPack"
          variant="outline"
          @click="() => openVanillaDialog()"
        >
          <i class="i-carbon-cloud-upload mr-2" />
          {{ $t('upload.vanilla.upload') }}
        </RButton>
      </div>

      <div v-if="hasVanillaPack" class="vanilla-pack-info">
        <div class="flex items-center justify-between border border-green-200 rounded-lg bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div class="flex items-center">
            <i class="i-carbon-checkmark-filled mr-3 text-xl text-green-600" />
            <div>
              <p class="text-green-800 font-medium dark:text-green-200">
                {{ vanillaPack?.name }}
              </p>
              <p class="text-sm text-green-600 dark:text-green-400">
                {{ $t('upload.vanilla.loaded') }} • {{ formatFileSize(vanillaPack?.size) }}
              </p>
            </div>
          </div>
          <RButton
            variant="ghost"
            size="sm"
            @click="removeVanillaPack"
          >
            <i class="i-carbon-trash-can" />
          </RButton>
        </div>
      </div>

      <div v-else class="vanilla-dropzone">
        <div
          class="border-2 border-gray-300 rounded-lg border-dashed p-8 text-center transition-colors dark:border-gray-600"
          :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isOverDropZone }"
          @click="() => openVanillaDialog()"
        >
          <i class="i-carbon-document-add mb-4 text-4xl text-gray-400" />
          <p class="mb-2 text-lg text-gray-700 font-medium dark:text-gray-300">
            {{ $t('upload.vanilla.required') }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('upload.drag') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 自定义材质包上传区域 -->
    <div v-if="hasVanillaPack" class="custom-section">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">
            {{ $t('upload.custom.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('upload.custom.description') }}
          </p>
        </div>
        <RButton
          variant="default"
          :disabled="isUploading"
          @click="() => openCustomDialog()"
        >
          <i class="i-carbon-add mr-2" />
          {{ $t('upload.custom.upload') }}
        </RButton>
      </div>

      <!-- 材质包列表 -->
      <div v-if="customPacks.length > 0" class="pack-list mb-4">
        <div ref="sortableContainer" class="space-y-2">
          <div
            v-for="(pack, index) in customPacks"
            :key="pack.id"
            class="pack-wrapper"
            :data-pack-id="pack.id"
          >
            <PackItem
              :pack="pack as Readonly<ResourcePack>"
              :priority="index + 1"
              :total="customPacks.length"
              @remove="removePack(pack.id)"
            />
          </div>
        </div>
      </div>

      <!-- 拖拽上传区域 -->
      <div
        ref="dragOverlay"
        class="custom-dropzone cursor-pointer border-2 border-gray-300 rounded-lg border-dashed p-6 text-center transition-colors dark:border-gray-600"
        :class="{
          'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isOverDropZone,
          'border-red-500 bg-red-50 dark:bg-red-900/20': isDeleteZone,
        }"
        @click="() => openCustomDialog()"
      >
        <i v-if="!isDeleteZone" class="i-carbon-cloud-upload mb-3 text-3xl text-gray-400" />
        <i v-else class="i-carbon-trash-can mb-3 text-3xl text-red-500" />

        <p v-if="!isDeleteZone" class="mb-1 text-gray-700 font-medium dark:text-gray-300">
          {{ $t('upload.custom.drag') }}
        </p>
        <p v-else class="mb-1 text-red-600 font-medium dark:text-red-400">
          {{ $t('upload.custom.deleteHint') }}
        </p>

        <p v-if="!isDeleteZone" class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('upload.multipleSupported') }}
        </p>
        <p v-else class="text-sm text-red-500 dark:text-red-400">
          {{ $t('upload.custom.deleteDescription') }}
        </p>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="hasUploads" class="upload-progress mt-6">
      <h4 class="mb-3 font-medium">
        {{ $t('upload.progress.title') }}
      </h4>
      <div class="space-y-2">
        <div
          v-for="(progress, packId) in uploadProgress"
          :key="packId"
          class="progress-item"
        >
          <UploadProgress
            :pack-id="packId"
            :progress="progress"
            @cancel="cancelUpload(String(packId))"
          />
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <RAlert
      v-if="validationErrors.length > 0"
      variant="destructive"
      class="mt-4"
    >
      <i class="i-carbon-warning" />
      <RAlertTitle>{{ $t('errors.uploadErrors') }}</RAlertTitle>
      <RAlertDescription>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="error in validationErrors" :key="error">
            {{ $t(error) }}
          </li>
        </ul>
      </RAlertDescription>
    </RAlert>

    <!-- 统计信息 -->
    <div v-if="totalPacks > 0" class="stats mt-6">
      <PackStats />
    </div>
  </div>
</template>

<style scoped>
.pack-uploader {
  @apply space-y-6;
}

.pack-item {
  @apply transform transition-all duration-200;
}

.pack-enter-active,
.pack-leave-active {
  transition: all 0.3s ease;
}

.pack-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.pack-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.custom-dropzone:hover {
  @apply border-blue-400 bg-blue-25 dark:bg-blue-900/10;
}

.vanilla-dropzone {
  cursor: pointer;
}

.vanilla-dropzone:hover {
  @apply border-blue-400 bg-blue-25 dark:bg-blue-900/10;
}
</style>
