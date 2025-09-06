<script setup lang="ts">
const { t } = useI18n()

const navigationItems = [
  {
    key: 'appearance',
    label: 'settings.appearance.title',
    icon: 'i-lucide-palette',
  },
  {
    key: 'behavior',
    label: 'settings.behavior.title',
    icon: 'i-lucide-settings',
  },
] as const

const activeSection = ref('appearance')
const sectionKeys = navigationItems.map(item => item.key) as string[]

function handleScroll() {
  for (const section of sectionKeys) {
    const element = document.getElementById(section)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
        activeSection.value = section
        break
      }
    }
  }
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = sectionId
    history.replaceState(null, '', `#${sectionId}`)
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  const hash = window.location.hash.slice(1)
  if (hash && sectionKeys.includes(hash)) {
    nextTick(() => scrollToSection(hash))
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="settings-sidebar">
    <nav class="space-y-1">
      <button
        v-for="item in navigationItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeSection === item.key }"
        @click="scrollToSection(item.key)"
      >
        <i :class="item.icon" class="nav-icon" />
        <span class="nav-label">{{ t(item.label) }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.settings-sidebar {
  @apply w-64 flex-shrink-0 sticky top-6 self-start;
}

.nav-item {
  @apply w-full flex items-center space-x-3 px-3 py-2 text-left text-sm font-medium rounded-lg
         text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100
         hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200;
}

.nav-item.active {
  @apply bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100;
}

.nav-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.nav-label {
  @apply truncate;
}

/* 在中等屏幕上移除sticky定位，改为水平布局 */
@media (max-width: 1024px) {
  .settings-sidebar {
    @apply relative top-auto w-full;
  }

  .settings-sidebar nav {
    @apply flex flex-wrap gap-2 space-y-0;
  }

  .nav-item {
    @apply flex-none w-auto min-w-0 justify-start items-center space-x-2 px-4 py-2 h-10;
  }

  .nav-label {
    @apply whitespace-nowrap;
  }
}

/* 在小屏幕上进一步优化 */
@media (max-width: 768px) {
  .nav-item {
    @apply px-3 py-1.5 text-xs;
  }

  .nav-icon {
    @apply w-3.5 h-3.5;
  }
}
</style>
