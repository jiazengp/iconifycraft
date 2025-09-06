<script setup lang="ts">
interface Step {
  id: string
  name: string
  icon: string
}

interface Props {
  step: Step
  index: number
  isActive: boolean
  isCompleted: boolean
  horizontal?: boolean
}

defineProps<Props>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="step-indicator"
    :class="[
      horizontal ? 'flex flex-col items-center text-center' : 'flex items-center',
      {
        'opacity-60': !isCompleted && !isActive,
      },
    ]"
  >
    <!-- 步骤圆圈和编号 -->
    <div class="relative">
      <div
        class="relative z-20 h-8 w-8 flex items-center justify-center border-2 rounded-full transition-all duration-200"
        :class="{
          'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100': isActive,
          'border-green-500 bg-green-500': isCompleted,
          'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950': !isCompleted && !isActive,
        }"
      >
        <!-- 完成状态显示勾选 -->
        <i
          v-if="isCompleted"
          class="i-lucide-check text-xs text-white"
        />
        <!-- 活跃/等待状态显示编号 -->
        <span
          v-else
          class="text-xs font-medium"
          :class="{
            'text-white dark:text-gray-900': isActive,
            'text-gray-500 dark:text-gray-400': !isActive,
          }"
        >
          {{ index + 1 }}
        </span>
      </div>
    </div>

    <!-- 步骤信息 -->
    <div :class="horizontal ? 'mt-2' : 'ml-3 flex-1'">
      <div
        class="text-sm font-medium"
        :class="{
          'text-gray-900 dark:text-gray-100': isActive,
          'text-green-600 dark:text-green-400': isCompleted,
          'text-gray-600 dark:text-gray-400': !isCompleted && !isActive,
        }"
      >
        {{ step.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-indicator {
  @apply transition-all duration-200;
}
</style>
