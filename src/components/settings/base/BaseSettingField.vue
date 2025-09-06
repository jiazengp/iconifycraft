<script setup lang="ts">
interface Props {
  label?: string
  description?: string
  required?: boolean
  error?: string
  hint?: string
  animationDelay?: number
  className?: string
  vertical?: boolean
  forceVertical?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  vertical: false,
  forceVertical: false,
  animationDelay: 0,
})

// 处理标签和描述的响应式翻译
const labelText = computed(() => {
  if (!props.label)
    return ''
  // 如果label已经是翻译过的字符串，直接返回
  return props.label
})

const descriptionText = computed(() => {
  if (!props.description)
    return ''
  // 如果description已经是翻译过的字符串，直接返回
  return props.description
})

const fieldStyle = computed(() => ({
  animationDelay: `${props.animationDelay}s`,
  animationFillMode: 'both',
}))
</script>

<template>
  <div
    class="base-setting-field"
    :class="[
      className,
      {
        'vertical': vertical || forceVertical,
        'content-enter': animationDelay > 0,
      },
    ]"
    :style="fieldStyle"
  >
    <!-- 标签和描述 -->
    <div class="setting-header" :class="{ 'mb-3': vertical }">
      <label v-if="labelText" class="setting-label">
        {{ labelText }}
        <span v-if="required" class="ml-1 text-red-500">*</span>
      </label>
      <p v-if="descriptionText" class="setting-description">
        {{ descriptionText }}
      </p>
    </div>

    <!-- 控件内容 -->
    <div class="setting-content">
      <slot />
    </div>

    <!-- 提示文本 -->
    <p v-if="hint" class="setting-hint">
      {{ hint }}
    </p>

    <!-- 错误信息 -->
    <p v-if="error" class="setting-error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.base-setting-field {
  @apply space-y-3;
}

.base-setting-field.vertical {
  @apply space-y-2;
}

.setting-header {
  @apply space-y-1;
}

.setting-label {
  @apply block text-sm font-semibold text-foreground;
}

.setting-description {
  @apply text-sm text-muted-foreground leading-relaxed;
}

.setting-content {
  @apply w-full;
}

.setting-hint {
  @apply text-xs text-muted-foreground italic;
}

.setting-error {
  @apply text-xs text-destructive font-medium;
}

/* 水平布局 - 标签和控件在同一行 */
@media (min-width: 768px) {
  .base-setting-field:not(.vertical) {
    @apply flex items-start justify-between space-y-0 space-x-4;
  }

  .base-setting-field:not(.vertical) .setting-header {
    @apply flex-1 space-y-1;
  }

  .base-setting-field:not(.vertical) .setting-content {
    @apply flex-shrink-0 w-auto;
  }

  .base-setting-field:not(.vertical) .setting-hint,
  .base-setting-field:not(.vertical) .setting-error {
    @apply absolute mt-1;
  }
}

/* 动画效果 */
.content-enter {
  @apply opacity-0 translate-y-4;
  animation: slideInUp 0.5s ease-out forwards;
}

@keyframes slideInUp {
  to {
    @apply opacity-100 translate-y-0;
  }
}

/* 移动端优化 */
@media (max-width: 767px) {
  .base-setting-field {
    @apply space-y-2;
  }

  .setting-label {
    @apply text-base; /* 防止iOS缩放 */
  }
}
</style>
