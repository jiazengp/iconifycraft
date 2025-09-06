<script setup lang="ts">
interface SourcePack {
  name: string
  author?: string
  description?: string
}

interface Props {
  sourcePacks: SourcePack[]
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-4">
    <h3 class="flex items-center text-base text-zinc-900 font-medium space-x-2 dark:text-zinc-100">
      <i class="i-carbon-warning text-yellow-600" />
      <span>{{ $t('export.confirmation.copyright') }}</span>
    </h3>

    <div class="border border-yellow-200 rounded-lg bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
      <p class="mb-3 text-sm text-yellow-800 dark:text-yellow-200">
        {{ $t('export.confirmation.copyrightWarning') }}
      </p>
      <div class="max-h-32 overflow-y-auto space-y-2">
        <div
          v-for="pack in sourcePacks"
          :key="pack.name"
          class="rounded bg-yellow-100 px-2 py-1 text-xs dark:bg-yellow-800/30"
        >
          <div class="text-yellow-900 font-medium dark:text-yellow-100">
            {{ pack.name }}
          </div>
          <div v-if="pack.author" class="text-yellow-700 dark:text-yellow-300">
            {{ $t('export.confirmation.author') }}: {{ pack.author }}
          </div>
          <div v-if="pack.description" class="truncate text-yellow-600 dark:text-yellow-400">
            {{ pack.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
