<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from 'reka-ui'
import { computed, useId } from 'vue'

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'

interface Props {
  /** Whether the dialog is open */
  open: boolean
  /** Dialog title for accessibility */
  title?: string
  /** Optional description for screen readers */
  description?: string
  /** Dialog size variant */
  size?: DialogSize
  /** Whether the dialog is modal (default: true) */
  modal?: boolean
  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean
  /** Whether the dialog content is scrollable */
  scrollable?: boolean
  /** Portal target element or selector */
  portalTarget?: string | HTMLElement
  /** Close on overlay click (default: true) */
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  modal: true,
  showCloseButton: true,
  scrollable: false,
  closeOnOverlayClick: true,
})

const emit = defineEmits<{
  /** Emitted when dialog open state changes */
  'update:open': [value: boolean]
  /** Emitted when dialog closes */
  'close': []
  /** Emitted when overlay is clicked */
  'overlayClick': []
}>()

// const { t } = useI18n() // 未使用，已注释

// Generate unique IDs for accessibility
const titleId = useId()
const descriptionId = useId()

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    emit('update:open', value)
    if (!value) {
      emit('close')
    }
  },
})

const sizeClasses = computed(() => {
  const sizeMap: Record<DialogSize, string> = {
    'sm': 'w-full max-w-sm',
    'md': 'w-full max-w-md',
    'lg': 'w-full max-w-lg',
    'xl': 'w-full max-w-xl',
    '2xl': 'w-full max-w-2xl',
    '4xl': 'w-full max-w-4xl',
  }
  return sizeMap[props.size]
})

function handleOverlayClick() {
  emit('overlayClick')
  if (props.closeOnOverlayClick) {
    isOpen.value = false
  }
}

function handleAutoFocus(event: Event) {
  // 防止自动聚焦到关闭按钮，让焦点保持在dialog容器上
  event.preventDefault()
}
</script>

<template>
  <DialogRoot
    v-model:open="isOpen"
    :modal="modal"
  >
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal :to="portalTarget">
      <DialogOverlay
        class="dialog-overlay"
        @click="handleOverlayClick"
      />

      <DialogContent
        class="dialog-content" :class="[
          sizeClasses,
          { 'dialog-content--scrollable': scrollable },
        ]"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        role="dialog"
        aria-modal="true"
        @open-auto-focus.prevent="handleAutoFocus"
      >
        <!-- Required DialogTitle (always present for accessibility) -->
        <DialogTitle v-if="title" :id="titleId">
          <VisuallyHidden as-child>
            <span>{{ title }}</span>
          </VisuallyHidden>
        </DialogTitle>
        <DialogTitle v-else :id="titleId">
          <VisuallyHidden as-child>
            <span>Dialog</span>
          </VisuallyHidden>
        </DialogTitle>

        <!-- Required DialogDescription (always present for accessibility) -->
        <DialogDescription v-if="description" :id="descriptionId">
          <VisuallyHidden as-child>
            <span>{{ description }}</span>
          </VisuallyHidden>
        </DialogDescription>
        <DialogDescription v-else :id="descriptionId">
          <VisuallyHidden as-child>
            <span>Dialog content</span>
          </VisuallyHidden>
        </DialogDescription>

        <!-- Header -->
        <header v-if="title || $slots.header" class="dialog-header">
          <div v-if="title || $slots['header-content']" class="dialog-header-content">
            <slot name="header-content">
              <h2 v-if="title" class="dialog-title-display">
                {{ title }}
              </h2>
              <p v-if="description" class="dialog-description-display">
                {{ description }}
              </p>
            </slot>
          </div>

          <slot name="header">
            <DialogClose
              v-if="showCloseButton"
              as-child
            >
              <button
                type="button"
                class="dialog-close-button"
                :aria-label="$t('dialog.close')"
                tabindex="0"
                @keydown.enter="isOpen = false"
                @keydown.space.prevent="isOpen = false"
              >
                <i class="i-carbon-close h-4 w-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </slot>
        </header>

        <!-- Main Content -->
        <main class="dialog-main">
          <slot />
        </main>

        <!-- Footer -->
        <footer v-if="$slots.footer" class="dialog-footer">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* Dialog Overlay */
.dialog-overlay {
  @apply fixed inset-0 z-50 bg-black/50 backdrop-blur-sm;
  opacity: 0;
  animation: fadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dialog-overlay[data-state='closed'] {
  animation: fadeOut 200ms ease-in forwards;
}

/* Dialog Content */
.dialog-content {
  @apply fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%];
  @apply bg-card rounded-lg shadow-2xl;
  @apply border border-border;
  @apply max-h-[85vh] overflow-hidden flex flex-col;
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.96);
  animation: contentShow 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dialog-content[data-state='closed'] {
  animation: contentHide 200ms ease-in forwards;
}

.dialog-content--scrollable {
  @apply max-h-[90vh];
}

.dialog-content:focus {
  @apply outline-none;
}

/* Dialog Header */
.dialog-header {
  @apply flex items-start justify-between p-6 border-b border-border;
  @apply bg-muted/50;
}

.dialog-header-content {
  @apply flex-1 pr-4;
}

/* Display versions of title and description in header */
.dialog-title-display {
  @apply text-xl font-semibold text-foreground mb-2;
  @apply leading-tight;
}

.dialog-description-display {
  @apply text-sm text-muted-foreground leading-relaxed;
}

.dialog-close-button {
  @apply flex items-center justify-center w-8 h-8;
  @apply rounded-lg text-muted-foreground hover:text-foreground;
  @apply hover:bg-accent;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2;
  @apply transition-all duration-150;
  @apply flex-shrink-0;
  cursor: pointer;
}

/* Dialog Body */
.dialog-main {
  @apply flex-1 p-6 overflow-y-auto;

  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175 / 0.3) transparent;
}

.dialog-main::-webkit-scrollbar {
  @apply w-1;
}

.dialog-main::-webkit-scrollbar-track {
  @apply bg-transparent;
}

.dialog-main::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground rounded-full;
}

/* Dialog Footer */
.dialog-footer {
  @apply p-6 border-t border-border;
  @apply bg-muted/50;
  @apply flex-shrink-0;
}

/* Responsive Design */
@media (max-width: 640px) {
  .dialog-content {
    @apply mx-4 max-w-[calc(100vw-2rem)] w-auto;
    @apply max-h-[90vh];
  }

  .dialog-header,
  .dialog-main,
  .dialog-footer {
    @apply px-4;
  }

  .dialog-title {
    @apply text-lg;
  }
}

@media (max-height: 640px) {
  .dialog-content {
    @apply max-h-[95vh];
  }
}

/* Animation keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes contentShow {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes contentHide {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
}
</style>
