<script setup lang="ts">
import BaseConfirmDialog from '~/components/base/BaseConfirmDialog.vue'
import SettingsLayout from '~/components/settings/SettingsLayout.vue'
import SettingsRenderer from '~/components/settings/SettingsRenderer.vue'
import SettingsSection from '~/components/settings/SettingsSection.vue'
import { useAppSettings } from '~/composables/useAppSettings'
import { useSettingsConfig } from '~/composables/useSettingsConfig'

const { t } = useI18n()
const { settingsConfig } = useSettingsConfig()
const { resetToDefaults } = useAppSettings()

// 重置设置功能
const showResetDialog = ref(false)

function handleResetSettings() {
  showResetDialog.value = true
}

function handleConfirmReset() {
  resetToDefaults()
  showResetDialog.value = false
}
</script>

<template>
  <SettingsLayout
    :title="t('settings.title')"
    :description="t('settings.description')"
    class="slide-enter"
  >
    <!-- 使用配置驱动的设置渲染器 -->
    <div class="space-y-8">
      <SettingsSection
        v-for="section in settingsConfig"
        :id="section.id"
        :key="section.id"
        :title="unref(section.title)"
        :description="unref(section.description)"
        :class="[
          section.className,
          { 'content-enter': section.animationDelay },
        ]"
        :style="{
          animationDelay: `${section.animationDelay}s`,
          animationFillMode: 'both',
        }"
      >
        <!-- 渲染每个section的设置项 -->
        <SettingsRenderer :sections="[section]" />
      </SettingsSection>
    </div>

    <!-- 重置设置 -->
    <SettingsSection
      id="reset"
      :title="t('settings.reset.sectionTitle')"
      :description="t('settings.reset.sectionDescription')"
      class="slide-enter-right"
      style="animation-delay: 0.8s; animation-fill-mode: both;"
    >
      <div class="flex items-center justify-between py-4">
        <div class="flex-1">
          <h4 class="mb-1 text-sm text-foreground font-medium">
            {{ t('settings.reset.title') }}
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ t('settings.reset.description') }}
          </p>
        </div>
        <div class="ml-6 flex-shrink-0">
          <button
            class="reset-button"
            @click="handleResetSettings"
          >
            {{ t('settings.reset.button') }}
          </button>
        </div>
      </div>
    </SettingsSection>
  </SettingsLayout>

  <!-- 重置确认对话框 -->
  <BaseConfirmDialog
    v-model:open="showResetDialog"
    type="warning"
    :title="t('settings.reset.confirmTitle')"
    :description="t('settings.reset.confirmDescription')"
    :confirm-text="t('settings.reset.confirmButton')"
    :cancel-text="t('settings.reset.cancel')"
    dangerous
    @confirm="handleConfirmReset"
  />
</template>

<style scoped>
.reset-button {
  @apply px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg
         hover:bg-destructive/20 hover:border-destructive/30 focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:ring-offset-2
         transition-all duration-200;
}

/* 动画效果 */
.slide-enter {
  @apply opacity-0 translate-y-4;
  animation: slideInUp 0.6s ease-out forwards;
}

.slide-enter-left {
  @apply opacity-0 -translate-x-4;
  animation: slideInLeft 0.6s ease-out forwards;
}

.slide-enter-right {
  @apply opacity-0 translate-x-4;
  animation: slideInRight 0.6s ease-out forwards;
}

.slide-enter-scale {
  @apply opacity-0 scale-95;
  animation: slideInScale 0.6s ease-out forwards;
}

.content-enter {
  @apply opacity-0 translate-y-4;
  animation: slideInUp 0.5s ease-out forwards;
}

@keyframes slideInUp {
  to {
    @apply opacity-100 translate-y-0;
  }
}

@keyframes slideInLeft {
  to {
    @apply opacity-100 translate-x-0;
  }
}

@keyframes slideInRight {
  to {
    @apply opacity-100 translate-x-0;
  }
}

@keyframes slideInScale {
  to {
    @apply opacity-100 scale-100;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .reset-button {
    @apply px-3 py-2 text-xs;
  }
}
</style>
