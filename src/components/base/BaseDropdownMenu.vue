<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'

// eslint-disable-next-line ts/no-redeclare
interface DropdownMenuItem {
  /** Unique identifier for the item */
  key: string
  /** Display text for the menu item */
  label: string
  /** Optional icon class */
  icon?: string
  /** Whether the item is disabled */
  disabled?: boolean
  /** Variant styling for the item */
  variant?: 'default' | 'danger'
  /** Whether to show a separator before this item */
  separator?: boolean
}

interface Props {
  /** Array of menu items */
  items: DropdownMenuItem[]
  /** Whether the dropdown is disabled */
  disabled?: boolean
  /** Alignment of the dropdown content */
  align?: 'start' | 'center' | 'end'
  /** Side of the trigger to show content */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Offset from the trigger */
  sideOffset?: number
  /** Whether to use a portal for rendering */
  portal?: boolean
  /** Portal target element or selector */
  portalTarget?: string | HTMLElement
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  align: 'end',
  side: 'bottom',
  sideOffset: 4,
  portal: true,
})

const emit = defineEmits<{
  /** Emitted when a menu item is selected */
  select: [key: string]
}>()

function handleItemSelect(key: string) {
  emit('select', key)
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger :disabled="disabled" as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal v-if="portal" :to="portalTarget">
      <DropdownMenuContent
        :align="align"
        :side="side"
        :side-offset="sideOffset"
        class="dropdown-content"
      >
        <template v-for="item in items" :key="item.key">
          <div v-if="item.separator" class="dropdown-separator" />
          <DropdownMenuItem
            :disabled="item.disabled"
            class="dropdown-item" :class="[
              `dropdown-item--${item.variant || 'default'}`,
              { 'dropdown-item--disabled': item.disabled },
            ]"
            @select="handleItemSelect(item.key)"
          >
            <i v-if="item.icon" class="dropdown-item__icon" :class="[item.icon]" />
            <span class="dropdown-item__label">{{ item.label }}</span>
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>

    <DropdownMenuContent
      v-else
      :align="align"
      :side="side"
      :side-offset="sideOffset"
      class="dropdown-content"
    >
      <template v-for="item in items" :key="item.key">
        <div v-if="item.separator" class="dropdown-separator" />
        <DropdownMenuItem
          :disabled="item.disabled"
          class="dropdown-item" :class="[
            `dropdown-item--${item.variant || 'default'}`,
            { 'dropdown-item--disabled': item.disabled },
          ]"
          @select="handleItemSelect(item.key)"
        >
          <i v-if="item.icon" class="dropdown-item__icon" :class="[item.icon]" />
          <span class="dropdown-item__label">{{ item.label }}</span>
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>

<style>
.dropdown-content {
  @apply min-w-40 rounded-xl border border-zinc-200 dark:border-zinc-700;
  @apply bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl shadow-zinc-900/10 dark:shadow-zinc-950/30;
  @apply p-2 z-50;
  animation-duration: 200ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-content[data-side='top'] {
  animation-name: slideDownAndFade;
}

.dropdown-content[data-side='right'] {
  animation-name: slideLeftAndFade;
}

.dropdown-content[data-side='bottom'] {
  animation-name: slideUpAndFade;
}

.dropdown-content[data-side='left'] {
  animation-name: slideRightAndFade;
}

.dropdown-item {
  @apply flex items-center gap-3 px-3 py-2 text-sm rounded-lg;
  @apply cursor-pointer select-none transition-colors duration-150;
  @apply text-zinc-700 dark:text-zinc-300;
  @apply hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80;
  @apply hover:text-zinc-900 dark:hover:text-zinc-100;
  @apply focus:bg-zinc-100/80 dark:focus:bg-zinc-800/80 focus:outline-none;
  @apply focus:text-zinc-900 dark:focus:text-zinc-100;
}

.dropdown-item--danger {
  @apply text-red-600 dark:text-red-400;
  @apply hover:bg-red-50 dark:hover:bg-red-900/20;
  @apply hover:text-red-700 dark:hover:text-red-300;
  @apply focus:bg-red-50 dark:focus:bg-red-900/20;
  @apply focus:text-red-700 dark:focus:text-red-300;
}

.dropdown-item--disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply hover:bg-transparent dark:hover:bg-transparent !important;
  @apply focus:bg-transparent dark:focus:bg-transparent !important;
  @apply hover:text-zinc-700 dark:hover:text-zinc-300 !important;
}

.dropdown-item__icon {
  @apply w-4 h-4 flex-shrink-0;
}

.dropdown-item__label {
  @apply flex-1 truncate;
}

.dropdown-separator {
  @apply h-px bg-zinc-200 dark:bg-zinc-700 mx-1 my-1;
}

/* Animations */
@keyframes slideUpAndFade {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRightAndFade {
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeftAndFade {
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
