<script setup lang="ts">
import { useMotion } from '@vueuse/motion'
import { Comment, Text } from 'vue'
import BaseSwitch from '~/components/base/BaseSwitch.vue'

interface Props {
  modelValue?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger'
  label?: string
  description?: string
  name?: string
  required?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Motion控制 - 条件性初始化
const contentRef = ref()
const slots = useSlots()

// 检查是否有实际内容
const hasActualContent = computed(() => {
  if (!slots.default)
    return false
  const slotContent = slots.default()
  return slotContent && slotContent.length > 0 && slotContent.some(node =>
    (node.children && node.children !== '')
    || (node.type !== Comment && node.type !== Text)
    || (node.type === Text && node.children && node.children.toString().trim() !== ''),
  )
})

// 创建motion实例，但不立即初始化
let motionControls: any = null

function initializeMotion() {
  if (!motionControls && slots.default && contentRef.value) {
    motionControls = useMotion(contentRef, {
      initial: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        height: 0,
      },
      enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        height: 'auto',
        transition: {
          type: 'spring',
          stiffness: 500,
          damping: 30,
          mass: 0.6,
          duration: 250,
        },
      },
      leave: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        height: 0,
        transition: {
          type: 'spring',
          stiffness: 600,
          damping: 35,
          mass: 0.4,
          duration: 200,
        },
      },
    })
  }
}

// 监听开关状态变化，应用动画
watch(() => props.modelValue, (newValue) => {
  // 只有在有slot内容时才处理动画
  if (!slots.default)
    return

  nextTick(() => {
    initializeMotion()
    if (motionControls && contentRef.value) {
      if (newValue) {
        motionControls.apply('enter')
      }
      else {
        motionControls.apply('leave')
      }
    }
  })
})
</script>

<template>
  <div class="border border-zinc-200 rounded-lg bg-white dark:border-zinc-700 dark:bg-zinc-950">
    <!-- 主开关行 -->
    <div class="flex flex-row items-center justify-between p-4">
      <!-- 左侧：标签和描述 -->
      <div v-if="label || description" class="min-w-0 flex-1 space-y-0.5">
        <label v-if="label || $slots.label" class="cursor-pointer select-none text-sm text-zinc-900 font-medium dark:text-zinc-100">
          <slot name="label">{{ label }}</slot>
        </label>

        <p v-if="description || $slots.description" class="text-sm text-zinc-600 dark:text-zinc-400">
          <slot name="description">
            {{ description }}
          </slot>
        </p>
      </div>

      <!-- 右侧：开关 -->
      <BaseSwitch
        :model-value="modelValue"
        :disabled="disabled"
        :size="size"
        :color="color"
        :name="name"
        :required="required"
        @update:model-value="(value: boolean) => emit('update:modelValue', value)"
      />
    </div>

    <!-- 嵌套内容（当开关开启时显示） -->
    <div
      v-if="$slots.default"
      v-show="modelValue"
      ref="contentRef"
      class="overflow-hidden"
    >
      <div
        :class="[
          hasActualContent ? 'px-4 pb-4 pt-2' : 'h-0 overflow-hidden',
        ]"
      >
        <div
          v-if="hasActualContent"
          class="ml-2 border-l-2 border-zinc-300 pl-4 dark:border-zinc-600"
        >
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
