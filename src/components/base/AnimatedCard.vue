<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  interactive: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0 }"
    :leave="{ opacity: 0, y: -20 }"
    :duration="300"
    class="animated-card border border-gray-200 rounded-lg bg-white transition-all duration-200 dark:border-gray-700 hover:border-gray-300 dark:bg-gray-800 dark:hover:border-gray-600"
    :class="[
      size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4',
      interactive && 'cursor-pointer hover:scale-[1.02]',
    ]"
    @click="interactive && $emit('click', $event)"
  >
    <slot />
  </div>
</template>
