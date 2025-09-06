<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  icon?: string
  padding?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
})
</script>

<template>
  <div
    class="card transition-all duration-200"
    :class="[
      padding === 'sm' && 'p-3',
      padding === 'md' && 'p-4',
      padding === 'lg' && 'p-6',
    ]"
  >
    <div
      v-if="title || icon || $slots.header"
      class="flex items-center justify-between"
      :class="{ 'mb-4': padding === 'lg', 'mb-3': padding !== 'lg' }"
    >
      <div class="flex items-center space-x-3">
        <!-- 图标 -->
        <i
          v-if="icon"
          class="text-lg text-zinc-700 dark:text-zinc-300" :class="[icon]"
        />

        <!-- 标题 -->
        <div v-if="title">
          <h3 class="text-base text-zinc-900 font-semibold tracking-tight dark:text-zinc-100">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="mt-0.5 text-sm text-zinc-600 font-medium dark:text-zinc-400">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Header slot for additional controls -->
      <slot name="header" />
    </div>

    <!-- 主要内容 -->
    <slot />

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="mt-4 border-t border-zinc-200/60 pt-3 dark:border-zinc-700/60">
      <slot name="footer" />
    </div>
  </div>
</template>
