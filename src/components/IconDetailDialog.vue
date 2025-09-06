<script setup lang="ts">
import type { AtlasGroup, FontGroup } from '~/types/atlas'
import type { IconItem } from '~/types/icon'
import { computed } from 'vue'
import BaseDialog from '~/components/base/BaseDialog.vue'
import CopyableField from '~/components/base/CopyableField.vue'
import IconImage from '~/components/base/IconImage.vue'
import { useCopyToClipboard } from '~/composables/useCopyToClipboard'
import { useIconDisplay } from '~/composables/useIconDisplay'
import CategoryLabel from './CategoryLabel.vue'

interface Props {
  iconData?: IconItem | null
  atlasGroups?: AtlasGroup[]
  fontGroups?: FontGroup[]
  atlasSize?: number
  textureSize?: number
  fontName?: string
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconData: null,
  atlasGroups: () => [],
  fontGroups: () => [],
  atlasSize: 512,
  textureSize: 16,
  fontName: 'minecraft:default',
  open: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'copySuccess': [message: string]
  'copyError': [message: string]
}>()

const { copyToClipboard, isCopied } = useCopyToClipboard()
const { getMinecraftTranslationKey } = useMinecraftTranslation()
const { translatedName } = useIconDisplay(props.iconData)

const translationKey = computed(() => {
  if (!props.iconData)
    return ''
  return getMinecraftTranslationKey(props.iconData.name, props.iconData.iconType)
})

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

function getCurrentFontName(): string {
  if (!props.iconData)
    return props.fontName || 'minecraft:default'

  const namespace = props.fontName?.split(':')[0] || 'minecraft'

  if (props.fontGroups && props.fontGroups.length > 0) {
    const iconUnicode = Number.parseInt(props.iconData.unicode.replace('U+', ''), 16)

    for (const fontGroup of props.fontGroups) {
      if (iconUnicode >= fontGroup.unicodeStart && iconUnicode <= fontGroup.unicodeEnd) {
        return `${namespace}:${fontGroup.fontName}`
      }
    }
  }

  return `${namespace}:default`
}

function getTextComponent(unicode: string): string {
  const unicodeEscape = `\\u${unicode.substring(2).toLowerCase()}`
  const fontName = getCurrentFontName()
  return `{"text":"${unicodeEscape}","font":"${fontName}"}`
}

function getTellrawCommand(unicode: string): string {
  const unicodeEscape = `\\u${unicode.substring(2).toLowerCase()}`
  const fontName = getCurrentFontName()
  return `/tellraw @a [{"text":"${unicodeEscape}","font":"${fontName}"},{"text":" ${translatedName.value}","font":"minecraft:default"}]`
}

async function handleCopy(text: string, label: string, key: string) {
  await copyToClipboard(
    text,
    label,
    key,
    message => emit('copySuccess', message),
    message => emit('copyError', message),
  )
}
</script>

<template>
  <BaseDialog
    v-model:open="isOpen"
    :title="$t('icon.detail.title')"
    :description="$t('icon.detail.description')"
    size="lg"
  >
    <template #trigger>
      <slot />
    </template>

    <!-- 内容 -->
    <div v-if="iconData" class="space-y-5">
      <!-- 图标预览 -->
      <div class="flex items-center space-x-4">
        <div class="icon-preview relative h-20 w-20 flex-shrink-0 overflow-hidden border border-border rounded-xl bg-transparent shadow-sm">
          <IconImage
            v-if="iconData"
            :icon="iconData"
            :atlas-groups="atlasGroups"
            :size="80"
            :texture-size="textureSize"
            error-style="simple"
            :show-transparent-bg="true"
            container-class="w-full h-full"
            :aria-label="$t('icon.detail.preview')"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="mb-1 text-xl text-foreground font-semibold">
            {{ translatedName }}
          </h4>
          <p class="mb-2 text-sm text-muted-foreground font-mono">
            {{ translationKey }}
          </p>
          <div class="flex items-center space-x-2">
            <CategoryLabel :category="iconData.category" />
            <span class="text-sm text-muted-foreground">•</span>
            <span class="text-sm text-muted-foreground font-mono">{{ iconData.namespace }}</span>
          </div>
        </div>
      </div>

      <!-- 可复制的信息 -->
      <div class="space-y-3">
        <!-- Unicode -->
        <CopyableField
          :label="$t('icon.detail.unicodeCharacter')"
          :value="iconData.unicode"
          :copied="isCopied('unicode')"
          @copy="(value, label) => handleCopy(value, label, 'unicode')"
        />

        <!-- 翻译Key -->
        <CopyableField
          :label="$t('icon.detail.translationKey')"
          :value="iconData.translationKey"
          :copied="isCopied('translationKey')"
          @copy="(value, label) => handleCopy(value, label, 'translationKey')"
        />

        <!-- 文本组件 -->
        <CopyableField
          :label="$t('icon.detail.textComponent')"
          :value="getTextComponent(iconData.unicode)"
          :copied="isCopied('textComponent')"
          @copy="(value, label) => handleCopy(value, label, 'textComponent')"
        />

        <!-- Tellraw 命令 -->
        <CopyableField
          :label="$t('icon.detail.tellrawCommand')"
          :value="getTellrawCommand(iconData.unicode)"
          :copied="isCopied('tellraw')"
          @copy="(value, label) => handleCopy(value, label, 'tellraw')"
        />
      </div>

      <!-- 来源信息 -->
      <div class="border-t border-border pt-3">
        <div class="space-y-1">
          <div>
            <span class="text-xs text-muted-foreground font-medium">{{ $t('icon.detail.source') }}：</span>
            <span class="text-xs text-foreground font-medium">{{ iconData.sourcePack }}</span>
          </div>
          <div v-if="iconData.fullPath">
            <span class="text-xs text-muted-foreground font-medium">{{ $t('icon.detail.path') }}：</span>
            <span class="break-all text-xs text-muted-foreground leading-relaxed font-mono">{{ iconData.fullPath }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
/* 图标预览透明背景 */
.icon-preview {
  background-image:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0px;
}

.dark .icon-preview {
  background-image:
    linear-gradient(45deg, #404040 25%, transparent 25%), linear-gradient(-45deg, #404040 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #404040 75%), linear-gradient(-45deg, transparent 75%, #404040 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0px;
}

/* BaseDialog handles all animations now, these are no longer needed */
</style>
