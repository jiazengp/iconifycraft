<script setup lang="ts">
interface Props {
  active: boolean
  label: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-carbon-checkmark',
})
</script>

<template>
  <div class="flex items-center space-x-2.5">
    <div class="flex items-center space-x-2">
      <!-- 图标 -->
      <div
        class="h-6 w-6 flex items-center justify-center rounded-lg transition-all duration-200"
        :class="active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'"
      >
        <i
          :class="[icon, active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400']"
          class="text-sm"
        />
      </div>

      <!-- 状态点 -->
      <div
        class="h-2 w-2 rounded-full transition-all duration-200"
        :class="active ? 'bg-green-500 shadow-md shadow-green-500/30' : 'bg-gray-400 dark:bg-gray-500'"
      />
    </div>

    <span
      class="text-sm font-medium transition-colors duration-200"
      :class="active ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'"
    >
      {{ label }}
    </span>
  </div>
</template>
