<script setup lang="ts">
import type { SupportedLocale } from '~/modules/i18n'
import { onClickOutside } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useLangs } from '~/composables/useLangs'

const { currentLang, localeLinks, switchToLang } = useLangs()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()

const allLanguages = computed(() => [currentLang.value, ...localeLinks.value])

function toggle() {
  isOpen.value = !isOpen.value
}

async function selectLanguage(langCode: SupportedLocale) {
  await switchToLang(langCode)
  isOpen.value = false
}

onClickOutside(dropdownRef, () => {
  isOpen.value = false
}, { ignore: [triggerRef] })
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      class="icon-btn-no-bg flex items-center space-x-1"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      @click="toggle"
    >
      <i class="i-lucide-languages text-lg" />
      <i class="i-lucide-chevron-down text-sm transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="absolute right-0 top-full z-50 mt-2 w-44 border border-border rounded-xl bg-card/95 p-2 shadow-xl backdrop-blur-md"
      >
        <div class="space-y-0.5">
          <button
            v-for="lang in allLanguages"
            :key="lang.code"
            class="w-full flex items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-150 hover:bg-accent"
            :class="{
              'text-foreground': lang.active,
              'text-muted-foreground': !lang.active,
            }"
            @click="selectLanguage(lang.code)"
          >
            <div class="flex items-center space-x-3">
              <div class="h-2 w-2 flex items-center justify-center">
                <div
                  v-if="lang.active"
                  class="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100"
                />
              </div>
              <span class="flex-1">{{ lang.label }}</span>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
