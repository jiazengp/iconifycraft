<script setup lang="ts">
import { computed } from 'vue'
import Card from '~/components/base/Card.vue'
import Stepper from '~/components/base/Stepper.vue'

interface Props {
  icon: string
  title: string
  description: string
  steps?: string[]
  stepsTitle?: string
  versionSelected?: boolean
  hasResourcePacks?: boolean
  atlasGenerated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  stepsTitle: '步骤',
  versionSelected: false,
  hasResourcePacks: false,
  atlasGenerated: false,
})

// 当前步骤
const currentStep = computed(() => {
  if (props.atlasGenerated)
    return 4 // 完成所有步骤
  if (props.hasResourcePacks)
    return 3 // 第3步活跃
  if (props.versionSelected)
    return 2 // 第2步活跃
  return 1 // 第1步活跃
})

// 将步骤文本转换为状态指示器格式
const stepIndicators = computed(() => {
  if (!props.steps)
    return []

  return props.steps.map((stepText, index) => ({
    id: `step-${index}`,
    name: stepText,
  }))
})

// 完成的步骤数组
const completedSteps = computed(() => {
  const completed: number[] = []
  if (props.versionSelected)
    completed.push(1)
  if (props.hasResourcePacks)
    completed.push(2)
  if (props.atlasGenerated)
    completed.push(3)
  return completed
})
</script>

<template>
  <Card>
    <div class="slide-enter-scale p-8 text-center">
      <i :class="icon" class="mb-4 text-4xl text-zinc-400" />
      <h3 class="mb-2 text-lg text-zinc-900 font-medium dark:text-zinc-100">
        {{ title }}
      </h3>
      <p class="mb-6 text-zinc-600 dark:text-zinc-400">
        {{ description }}
      </p>

      <!-- 状态指示器步骤 -->
      <div v-if="steps" class="mx-auto max-w-lg">
        <Stepper
          :steps="stepIndicators"
          :current-step="currentStep"
          :completed-steps="completedSteps"
          :linear="true"
        />
      </div>

      <slot />
    </div>
  </Card>
</template>

<style scoped>
</style>
