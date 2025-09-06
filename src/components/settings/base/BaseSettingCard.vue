<script setup lang="ts">
interface Props {
  /** 标签文本 */
  label?: string
  /** 描述文本 */
  description?: string
  /** 使用完整内容模式，不分割左右布局 */
  fullContent?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="border border-zinc-200 rounded-lg bg-white dark:border-zinc-700 dark:bg-zinc-950">
    <!-- 标准布局模式：标签/描述 + 操作按钮 -->
    <div v-if="!fullContent" class="flex flex-row items-center justify-between p-4">
      <!-- 左侧：标签和描述 -->
      <div v-if="label || description || $slots.label || $slots.description" class="min-w-0 flex-1 space-y-0.5">
        <div v-if="label || $slots.label" class="text-sm text-zinc-900 font-medium dark:text-zinc-100">
          <slot name="label">
            {{ label }}
          </slot>
        </div>

        <p v-if="description || $slots.description" class="text-sm text-zinc-600 dark:text-zinc-400">
          <slot name="description">
            {{ description }}
          </slot>
        </p>
      </div>

      <!-- 右侧：操作区域 -->
      <div v-if="$slots.action" class="ml-4 flex-shrink-0">
        <slot name="action" />
      </div>
    </div>

    <!-- 完整内容模式 -->
    <div v-if="fullContent || ($slots.default && !($slots.label || $slots.description || label || description))" class="p-4">
      <slot />
    </div>

    <!-- 扩展内容区域 -->
    <div v-if="$slots.content" class="px-4 pb-4">
      <slot name="content" />
    </div>
  </div>
</template>
