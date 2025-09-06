<script setup lang="ts">
import { computed } from 'vue'
import Skeleton from './Skeleton.vue'

interface Props {
  lines?: number
  height?: string | number
  randomize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lines: 3,
  height: '1rem',
  randomize: true,
})

const lineWidths = computed(() => {
  const widths: string[] = []

  for (let i = 0; i < props.lines; i++) {
    if (props.randomize) {
      // 随机宽度，但最后一行通常较短
      if (i === props.lines - 1) {
        widths.push(`${60 + Math.random() * 20}%`)
      }
      else {
        widths.push(`${80 + Math.random() * 20}%`)
      }
    }
    else {
      widths.push('100%')
    }
  }

  return widths
})
</script>

<template>
  <div class="space-y-2">
    <Skeleton
      v-for="(width, index) in lineWidths"
      :key="index"
      variant="text"
      :width="width"
      :height="height"
    />
  </div>
</template>
