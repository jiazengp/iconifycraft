<script setup lang="ts">
import { StepperIndicator, StepperItem, StepperRoot, StepperTitle, StepperTrigger } from 'reka-ui'
import { computed } from 'vue'

export interface Step {
  id: string
  name: string
  description?: string
}

interface Props {
  steps: Step[]
  currentStep: number
  completedSteps?: number[]
  linear?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  completedSteps: () => [],
  linear: true,
})

const emit = defineEmits<{
  'update:current-step': [value: number]
}>()

const currentStepValue = computed({
  get: () => props.currentStep,
  set: (value: number) => {
    emit('update:current-step', value)
  },
})

function isStepCompleted(index: number) {
  return props.completedSteps.includes(index + 1) || props.currentStep > index + 1
}
</script>

<template>
  <div class="stepper-wrapper">
    <StepperRoot
      v-model="currentStepValue"
      orientation="horizontal"
      :linear="linear"
      class="stepper-root"
    >
      <StepperItem
        v-for="(step, index) in steps"
        :key="step.id"
        :step="index + 1"
        :value="index + 1"
        class="stepper-item"
      >
        <StepperTrigger class="stepper-trigger">
          <StepperIndicator class="stepper-indicator">
            <i
              v-if="isStepCompleted(index)"
              class="i-lucide-check text-xs"
            />
            <span
              v-else
              class="text-xs font-medium"
            >
              {{ index + 1 }}
            </span>
          </StepperIndicator>
        </StepperTrigger>

        <div class="stepper-content">
          <StepperTitle class="stepper-title">
            {{ step.name }}
          </StepperTitle>
        </div>
      </StepperItem>
    </StepperRoot>
  </div>
</template>

<style scoped>
.stepper-wrapper {
  @apply max-w-lg mx-auto;
}

.stepper-root {
  @apply flex items-start w-full relative;
  gap: 4rem;
}

.stepper-root::before {
  content: '';
  @apply absolute top-4 left-16 right-16 h-0.5;
  @apply bg-gray-200 dark:bg-gray-700;
  z-index: 1;
}

.stepper-item {
  @apply flex flex-col items-center flex-1 relative;
  z-index: 2;
}

.stepper-trigger {
  @apply cursor-default;
}

.stepper-indicator {
  @apply flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 mb-2;
  @apply border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950;
}

.stepper-item[data-state='active'] .stepper-indicator {
  @apply border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100;
}

.stepper-item[data-state='active'] .stepper-indicator span {
  @apply text-white dark:text-gray-900;
}

.stepper-item[data-state='completed'] .stepper-indicator {
  @apply border-green-500 bg-green-500;
}

.stepper-item[data-state='completed'] .stepper-indicator i {
  @apply text-white;
}

.stepper-item[data-state='inactive'] .stepper-indicator span {
  @apply text-gray-500 dark:text-gray-400;
}

.stepper-content {
  @apply text-center;
}

.stepper-title {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.stepper-item[data-state='active'] .stepper-title {
  @apply text-gray-900 dark:text-gray-100;
}

.stepper-item[data-state='completed'] .stepper-title {
  @apply text-green-600 dark:text-green-400;
}
</style>
