<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '~/components/layout/AppHeader.vue'
import InstanceSubNavbar from '~/components/layout/InstanceSubNavbar.vue'
import TheFooter from '~/components/TheFooter.vue'
import { useInstanceManager } from '~/composables/useInstanceManager'
import { useLocalizedRouter } from '~/composables/useLocalizedRouter'

const route = useRoute()
const { pushLocalized } = useLocalizedRouter()
const { loadInstance, currentInstance, loading } = useInstanceManager()

const instanceId = computed(() => {
  const params = route.params as { id?: string | string[] }
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  return id ?? ''
})

async function loadInstanceData() {
  const id = instanceId.value
  const success = await loadInstance(id)

  if (!success) {
    await pushLocalized('/instances')
  }
}

onMounted(() => {
  if (instanceId.value) {
    loadInstanceData()
  }
})
</script>

<template>
  <div class="minecraft-icons-app min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50">
    <AppHeader />

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="i-lucide-loader-2 animate-spin text-2xl text-zinc-400" />
        <p>{{ $t('instances.loading') }}</p>
      </div>
    </div>

    <div v-else-if="currentInstance" class="instance-content">
      <InstanceSubNavbar
        :instance="currentInstance"
        :show-atlas-badge="false"
      />

      <main>
        <RouterView :initial-instance="currentInstance" />
      </main>
    </div>

    <div v-else class="error-state">
      <div class="error-content">
        <i class="i-lucide-alert-triangle text-3xl text-red-400" />
        <h2>{{ $t('instances.notFound.title') }}</h2>
        <p>{{ $t('instances.notFound.description') }}</p>
        <button class="btn" @click="pushLocalized('/instances')">
          {{ $t('instances.backToList') }}
        </button>
      </div>
    </div>

    <TheFooter />
  </div>
</template>

<style scoped>
.loading-state {
  @apply flex items-center justify-center min-h-[50vh];
}

.loading-spinner {
  @apply flex flex-col items-center space-y-4 text-center;
}

.loading-spinner p {
  @apply text-zinc-600 dark:text-zinc-400;
}

.instance-content {
  @apply min-h-screen;
}

.error-state {
  @apply flex items-center justify-center min-h-[50vh];
}

.error-content {
  @apply text-center space-y-4;
}

.error-content h2 {
  @apply text-xl font-semibold text-zinc-900 dark:text-zinc-100;
}

.error-content p {
  @apply text-zinc-600 dark:text-zinc-400;
}

.btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors;
}
</style>
