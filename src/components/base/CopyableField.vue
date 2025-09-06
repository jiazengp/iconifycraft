<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  label: string
  value: string
  copied?: boolean
}

interface Emits {
  (e: 'copy', value: string, label: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

function handleCopy() {
  emit('copy', props.value, props.label)
}
</script>

<template>
  <div class="flex items-start justify-between border border-border rounded-xl bg-muted/50 p-4">
    <div class="mr-3 min-w-0 flex-1">
      <label class="mb-1 block text-sm text-foreground font-medium">{{ label }}</label>
      <p class="break-all text-sm text-foreground leading-relaxed font-mono">
        {{ value }}
      </p>
    </div>
    <button
      class="copy-button group relative flex-shrink-0 overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
      :class="[
        copied
          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 focus:ring-emerald-500 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
          : 'bg-card hover:bg-muted/50 text-foreground border border-border hover:border-primary/60 shadow-sm hover:shadow focus:ring-primary/20',
      ]"
      @click="handleCopy"
    >
      <div class="relative z-10 flex items-center space-x-2">
        <div class="relative h-4 w-4 overflow-hidden">
          <!-- 复制图标 -->
          <i
            class="i-carbon-copy absolute inset-0 text-sm transition-all duration-300 ease-out"
            :style="{
              opacity: copied ? 0 : 1,
              transform: copied ? 'translateY(-100%) scale(0.8)' : 'translateY(0) scale(1)',
            }"
          />
          <!-- 完成图标 -->
          <i
            class="i-carbon-checkmark absolute inset-0 text-sm transition-all duration-300 ease-out"
            :style="{
              opacity: copied ? 1 : 0,
              transform: copied ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.8)',
            }"
          />
        </div>
        <span class="font-medium transition-all duration-200">{{ copied ? t('button.copied') : t('button.copy') }}</span>
      </div>

      <!-- 成功时的微妙动画背景 -->
      <div
        v-if="copied"
        class="absolute inset-0 animate-pulse rounded-lg from-emerald-50/80 to-emerald-100/80 bg-gradient-to-r dark:from-emerald-900/40 dark:to-emerald-800/40"
      />
    </button>
  </div>
</template>

<style scoped>
.copy-button {
  /* 微妙的阴影效果 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.copy-button:hover {
  /* 悬停时增强阴影 */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.copy-button:active {
  /* 点击时的微妙按下效果 */
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 成功状态的特殊效果 */
.copy-button:has(.animate-pulse) {
  animation: subtle-bounce 0.6s ease-out;
}

@keyframes subtle-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
