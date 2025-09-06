<script setup lang="ts">
import { useInstanceDetail } from '~/composables/useInstanceDetail'
import { useLocalizedRouter } from '~/composables/useLocalizedRouter'

const { loading, currentInstance } = useInstanceDetail()
const { pushLocalized } = useLocalizedRouter()
</script>

<template>
  <div v-if="loading" class="min-h-[50vh] flex items-center justify-center">
    <div class="flex flex-col items-center text-center space-y-4">
      <i class="i-lucide-loader-2 animate-spin text-2xl text-zinc-400" />
      <p class="text-zinc-600 dark:text-zinc-400">
        {{ $t('instances.loading') }}
      </p>
    </div>
  </div>

  <div v-else-if="currentInstance" class="min-h-screen">
    <InstanceSubNavbar
      :instance="currentInstance"
      :show-atlas-badge="false"
    />

    <AppLayout :initial-instance="currentInstance" />
  </div>

  <div v-else class="min-h-[50vh] flex items-center justify-center">
    <div class="text-center space-y-4">
      <i class="i-lucide-alert-triangle text-3xl text-red-400" />
      <h2 class="text-xl text-zinc-900 font-semibold dark:text-zinc-100">
        {{ $t('instances.notFound.title') }}
      </h2>
      <p class="text-zinc-600 dark:text-zinc-400">
        {{ $t('instances.notFound.description') }}
      </p>
      <button
        class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        @click="pushLocalized('/instances')"
      >
        {{ $t('instances.backToList') }}
      </button>
    </div>
  </div>
</template>
