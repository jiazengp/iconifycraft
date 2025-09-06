<script setup lang="ts">
import type { ResourcePack } from '~/types/resource-pack'
import NProgress from 'nprogress'
import { ref } from 'vue'
import Card from '~/components/base/Card.vue'
import { useNotification } from '~/composables/useNotification'
import { ResourcePackService } from '~/services/core/ResourcePackService'
import ResourcePackList from './ResourcePackList.vue'

interface Props {
  resourcePacks?: ResourcePack[]
  unified?: boolean
}

interface Emits {
  (e: 'packsUploaded', packs: ResourcePack[]): void
  (e: 'packRemoved', packId: string): void
  (e: 'packsReordered', packs: ResourcePack[]): void
}

withDefaults(defineProps<Props>(), {
  resourcePacks: () => [],
  unified: false,
})

const emit = defineEmits<Emits>()

const { showSuccess, showError } = useNotification()
const { t: $t } = useI18n()
const resourcePackService = new ResourcePackService()

// 响应式状态
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

// 方法
function triggerFileUpload() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    handleFiles(Array.from(files))
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  handleFiles(files)
}

async function handleFiles(files: File[]) {
  const zipFiles = files.filter(file => file.name.endsWith('.zip'))

  if (zipFiles.length === 0) {
    showError($t('upload.failed'), { message: $t('upload.error.invalidFormat') })
    return
  }

  NProgress.start()

  try {
    const uploadedPacks: ResourcePack[] = []

    for (let i = 0; i < zipFiles.length; i++) {
      const file = zipFiles[i]

      const progress = (i + 0.5) / zipFiles.length
      NProgress.set(progress)

      try {
        const pack = await resourcePackService.parseResourcePack(file)

        const validTextures = pack.textures.filter(texture =>
          (texture.category === 'item' && texture.fullPath.includes('/textures/item/'))
          || (texture.category === 'block' && texture.fullPath.includes('/textures/block/')),
        )

        if (validTextures.length === 0) {
          showError($t('upload.error.parseError'), {
            message: $t('upload.error.noValidTextures', { name: file.name }),
          })
          continue
        }

        pack.textures = validTextures
        uploadedPacks.push(pack)

        const itemCount = validTextures.filter(t => t.category === 'item').length
        const blockCount = validTextures.filter(t => t.category === 'block').length

        showSuccess($t('upload.messages.uploaded'), {
          message: $t('upload.messages.packUploaded', { name: pack.name, itemCount, blockCount }),
        })
      }
      catch (error) {
        showError($t('upload.failed'), {
          message: $t('upload.error.parseFileFailed', { name: file.name, error: error instanceof Error ? error.message : $t('errors.unknown') }),
        })
      }
    }

    if (uploadedPacks.length > 0) {
      emit('packsUploaded', uploadedPacks)
    }
  }
  finally {
    NProgress.done()
  }
}

function handleRemovePack(packId: string) {
  emit('packRemoved', packId)
}

function handleReorderPacks(packs: ResourcePack[]) {
  emit('packsReordered', packs)
}
</script>

<template>
  <Card
    v-if="!unified"
    :title="$t('upload.title')"
    icon="i-lucide-upload"
  >
    <div class="space-y-4">
      <!-- 文件上传区域 -->
      <div
        class="group cursor-pointer border-2 border-zinc-300 rounded-lg border-dashed p-6 text-center transition-colors dark:border-zinc-600 hover:border-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
        :class="{
          'border-zinc-400 bg-zinc-50 dark:bg-zinc-800': isDragOver,
        }"
        @click="triggerFileUpload"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
      >
        <!-- 上传图标 -->
        <div>
          <i class="i-lucide-upload mb-3 text-2xl text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
          <p class="mb-1 text-sm text-zinc-700 font-medium dark:text-zinc-300">
            {{ $t('upload.dragOrClick') }}
          </p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ $t('upload.multipleSupported') }}
          </p>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept=".zip"
        multiple
        class="hidden"
        @change="handleFileChange"
      >

      <!-- 已上传的材质包列表 -->
      <ResourcePackList
        v-if="resourcePacks.length > 0"
        :packs="resourcePacks"
        @remove="handleRemovePack"
        @reorder="handleReorderPacks"
      />
    </div>
  </Card>

  <!-- Unified layout -->
  <div v-else class="space-y-4">
    <!-- Section header -->
    <div class="mb-4 flex items-center space-x-3">
      <i class="i-lucide-upload text-lg text-zinc-700 dark:text-zinc-300" />
      <h3 class="text-base text-zinc-900 font-semibold tracking-tight dark:text-zinc-100">
        {{ $t('upload.title') }}
      </h3>
    </div>

    <!-- 文件上传区域 -->
    <div
      class="group cursor-pointer border-2 border-zinc-300 rounded-lg border-dashed p-6 text-center transition-colors dark:border-zinc-600 hover:border-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
      :class="{
        'border-zinc-400 bg-zinc-50 dark:bg-zinc-800': isDragOver,
      }"
      @click="triggerFileUpload"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
    >
      <!-- 上传图标 -->
      <div>
        <i class="i-lucide-upload mb-3 text-2xl text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
        <p class="mb-1 text-sm text-zinc-700 font-medium dark:text-zinc-300">
          {{ $t('upload.dragOrClick') }}
        </p>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          {{ $t('upload.multipleSupported') }}
        </p>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".zip"
      multiple
      class="hidden"
      @change="handleFileChange"
    >

    <!-- 已上传的材质包列表 -->
    <ResourcePackList
      v-if="resourcePacks.length > 0"
      :packs="resourcePacks"
      @remove="handleRemovePack"
      @reorder="handleReorderPacks"
    />
  </div>
</template>
