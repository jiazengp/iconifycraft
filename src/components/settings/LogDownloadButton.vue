<script setup lang="ts">
import type { StoredLogEntry } from '~/utils/logger'
import BaseSettingCard from '~/components/settings/base/BaseSettingCard.vue'
import { useNotification } from '~/composables/useNotification'
import { logger } from '~/utils/logger'

// 兼容旧日志格式的类型
interface LegacyLogEntry {
  date?: string
  type?: string
  args?: unknown[]
  tag?: string
}

type CompatibleLogEntry = StoredLogEntry & LegacyLogEntry

const { t } = useI18n()
const notification = useNotification()
const { showSuccess, showError } = notification

const logs = ref(logger.exportLogs())
const logCount = computed(() => logs.value.length)
const hasLogs = computed(() => logCount.value > 0)

function handleDownload(format: 'json' | 'txt') {
  try {
    const currentLogs = logger.exportLogs() as CompatibleLogEntry[]

    if (currentLogs.length === 0) {
      showError(t('settings.debugging.noLogsToDownload'))
      return
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `iconifycraft-logs-${timestamp}.${format}`

    let content: string
    let mimeType: string

    if (format === 'json') {
      content = JSON.stringify(currentLogs, null, 2)
      mimeType = 'application/json'
    }
    else {
      content = currentLogs.map((log) => {
        const timestamp = new Date(log.timestamp || log.date || Date.now()).toLocaleString()
        const level = (log.level !== undefined ? `LEVEL_${log.level}` : log.type?.toUpperCase()) || 'LOG'
        const message = log.message || (Array.isArray(log.args)
          ? log.args.map((arg: any) => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ')
          : String(log.args))
        const tag = log.module || log.tag ? `[${log.module || log.tag}]` : ''

        return `${timestamp} ${level}${tag} ${message}`
      }).join('\n')
      mimeType = 'text/plain'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
    showSuccess(t('settings.debugging.downloadSuccess', { filename }))
  }
  catch (err) {
    showError(t('settings.debugging.downloadError'))
    logger.error('Download logs failed:', err)
  }
}

// 清除处理函数
function handleClear() {
  try {
    logger.clearLogs()
    logs.value = []
    showSuccess(t('settings.debugging.clearSuccess'))
  }
  catch (err) {
    showError(t('settings.debugging.clearError'))
    logger.error('Clear logs failed:', err)
  }
}

// 定期更新日志数量
onMounted(() => {
  const interval = setInterval(() => {
    logs.value = logger.exportLogs()
  }, 5000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<template>
  <div class="space-y-4">
    <!-- JSON 下载 -->
    <BaseSettingCard
      :label="t('settings.debugging.downloadJson')"
      :description="t('settings.debugging.downloadJsonDesc')"
    >
      <template #action>
        <button
          class="btn-outline btn"
          :disabled="!hasLogs"
          @click="handleDownload('json')"
        >
          <i class="i-lucide-download text-sm" />
        </button>
      </template>
    </BaseSettingCard>

    <!-- TXT 下载 -->
    <BaseSettingCard
      :label="t('settings.debugging.downloadTxt')"
      :description="t('settings.debugging.downloadTxtDesc')"
    >
      <template #action>
        <button
          class="btn-outline btn"
          :disabled="!hasLogs"
          @click="handleDownload('txt')"
        >
          <i class="i-lucide-file-text text-sm" />
        </button>
      </template>
    </BaseSettingCard>

    <!-- 清除日志 -->
    <BaseSettingCard
      :label="t('settings.debugging.clearLogs')"
      :description="`${t('settings.debugging.clearLogsDesc')} - ${hasLogs
        ? t('settings.debugging.logsCount', { count: logCount })
        : t('settings.debugging.noLogs')}`"
    >
      <template #action>
        <button
          class="btn-destructive btn"
          :disabled="!hasLogs"
          @click="handleClear"
        >
          <i class="i-lucide-trash-2 text-sm" />
        </button>
      </template>
    </BaseSettingCard>
  </div>
</template>
