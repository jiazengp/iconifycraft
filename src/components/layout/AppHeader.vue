<script setup lang="ts">
import LanguageSelector from '~/components/settings/LanguageSelector.vue'
import ThemeSelector from '~/components/settings/ThemeSelector.vue'
import { useLocalizedRouter } from '~/composables/useLocalizedRouter'

const { localizeRoute } = useLocalizedRouter()

// Navigation configuration
const navigationItems = computed(() => [
  {
    to: localizeRoute('/instances'),
    titleKey: 'instances.title',
  },
  {
    to: localizeRoute('/settings'),
    titleKey: 'settings.title',
  },
])

// Settings configuration
const settingsItems = [
  {
    component: LanguageSelector,
  },
  {
    component: ThemeSelector,
  },
  {
    href: 'https://github.com/jiazengp/IconifyCraft',
    icon: 'i-carbon-logo-github',
    title: 'GitHub',
    external: true,
  },
]
</script>

<template>
  <header class="border-b border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-950">
    <div class="mx-auto max-w-7xl px-4 lg:px-8 sm:px-6">
      <div class="h-14 flex items-center justify-between">
        <router-link :to="localizeRoute('')" class="flex items-center transition-opacity space-x-3 hover:opacity-80">
          <img src="/logo.png" alt="IconifyCraft" class="h-9 w-9 rounded-xl object-contain">
          <h1 class="text-lg text-zinc-900 font-semibold tracking-tight font-serif dark:text-zinc-100">
            IconifyCraft
          </h1>
        </router-link>
        <!-- Navigation Items -->
        <nav class="flex flex-1 items-center justify-end">
          <div class="flex items-center space-x-2">
            <router-link
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              class="nav-item"
              :title="$t(item.titleKey)"
            >
              <span class="nav-text">{{ $t(item.titleKey) }}</span>
            </router-link>
          </div>
        </nav>

        <!-- Settings -->
        <div class="flex items-center">
          <div v-for="(item, index) in settingsItems" :key="index" class="flex items-center">
            <div class="mx-2 h-4 w-px bg-zinc-300 dark:bg-zinc-600" :class="{ '!w-[0.5px]': index === 0 }" />

            <!-- Component items -->
            <component :is="item.component" v-if="item.component" />

            <!-- External link items -->
            <a
              v-else-if="item.external"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="icon-btn-no-bg"
              :title="item.title"
            >
              <i class="text-lg" :class="[item.icon]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-item {
  @apply px-3 py-2 rounded-lg;
  @apply text-zinc-700 dark:text-zinc-300;
  @apply hover:text-zinc-900 dark:hover:text-zinc-100;
  @apply transition-colors duration-150;
  @apply text-base font-size-14px;
}

.nav-item.router-link-active {
  @apply text-blue-600 dark:text-blue-400;
}

.nav-text {
  @apply inline;
}

@media (max-width: 640px) {
  .nav-item {
    @apply px-2;
  }
}
</style>
