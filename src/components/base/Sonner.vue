<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import { h } from 'vue'
import { Toaster as Sonner } from 'vue-sonner'

const props = defineProps<ToasterProps>()

// 创建Lucide图标组件 - 使用更合适的图标
const CheckCircleIcon = () => h('i', { class: 'i-lucide-circle-check w-5 h-5' })
const XCircleIcon = () => h('i', { class: 'i-lucide-circle-x w-5 h-5' })
const AlertTriangleIcon = () => h('i', { class: 'i-lucide-triangle-alert w-5 h-5' })
const InfoIcon = () => h('i', { class: 'i-lucide-info w-5 h-5' })
const Loader2Icon = () => h('i', { class: 'i-lucide-loader-2 w-5 h-5 animate-spin' })
</script>

<template>
  <Sonner
    v-bind="props"
    :unstyled="false"
  >
    <!-- Custom icons using Lucide -->
    <template #success-icon>
      <CheckCircleIcon />
    </template>
    <template #error-icon>
      <XCircleIcon />
    </template>
    <template #warning-icon>
      <AlertTriangleIcon />
    </template>
    <template #info-icon>
      <InfoIcon />
    </template>
    <template #loading-icon>
      <Loader2Icon />
    </template>
  </Sonner>
</template>
