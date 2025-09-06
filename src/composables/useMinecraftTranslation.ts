import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useMinecraftTranslation() {
  const { t, te } = useI18n()

  const getMinecraftTranslationKey = (filename: string, category: 'block' | 'item') => {
    return `${category}.minecraft.${filename}`
  }

  const getTranslatedNameSync = (filename: string, category: 'block' | 'item') => {
    const webKey = `default.${getMinecraftTranslationKey(filename, category)}`

    if (te(webKey)) {
      return t(webKey)
    }

    // 如果没有翻译，使用格式化的文件名
    return filename.replace(/\.(png|jpg|jpeg|gif)$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const getTranslatedName = (filename: string, category: 'block' | 'item') => {
    return computed(() => {
      return getTranslatedNameSync(filename, category)
    })
  }

  return {
    getTranslatedName,
    getTranslatedNameSync,
    getMinecraftTranslationKey,
  }
}
