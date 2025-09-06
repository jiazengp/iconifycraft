import type { ComputedRef } from 'vue'
import type { SupportedLocale } from '~/modules/i18n'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  availableLocales,
  DEFAULT_LOCALE,
  loadLanguageAsync,
  SUPPORTED_LOCALES,
} from '~/modules/i18n'
import { logger } from '~/utils/logger'

export interface LangLink {
  code: SupportedLocale
  label: string
  link: string
  active: boolean
}

export interface LangConfig {
  currentLang: ComputedRef<LangLink>
  localeLinks: ComputedRef<LangLink[]>
  switchToLang: (lang: SupportedLocale) => Promise<void>
  isDefaultLocale: ComputedRef<boolean>
  normalizeLink: (path: string, targetLang?: SupportedLocale) => string
}

const LANG_LABELS: Record<SupportedLocale, string> = {
  zh: '中文',
  en: 'English',
}

export function extractLangFromPath(path: string): SupportedLocale {
  // Remove trailing slash for consistent parsing
  const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path
  const segments = normalizedPath.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)) {
    return firstSegment as SupportedLocale
  }

  return DEFAULT_LOCALE
}

export function removeLangPrefix(path: string, lang?: SupportedLocale): string {
  const langToRemove = lang || extractLangFromPath(path)

  if (langToRemove === DEFAULT_LOCALE) {
    return path
  }

  const withoutLang = path.replace(new RegExp(`^/${langToRemove}(?=/|$)`), '') || '/'
  return withoutLang
}

export function addLangPrefix(path: string, lang: SupportedLocale): string {
  if (lang === DEFAULT_LOCALE) {
    return path
  }

  const cleanPath = path === '/' ? '' : path
  return `/${lang}${cleanPath}`
}

export function normalizeLink(path: string, targetLang?: SupportedLocale): string {
  const currentLang = extractLangFromPath(path)
  const lang = targetLang || currentLang

  const basePath = removeLangPrefix(path, currentLang)

  return addLangPrefix(basePath, lang)
}

export function useLangs(): LangConfig {
  const route = useRoute()
  const router = useRouter()
  const { locale } = useI18n()

  const currentDetectedLang = ref<SupportedLocale>(DEFAULT_LOCALE)

  const currentLang = computed((): LangLink => {
    const lang = currentDetectedLang.value
    const currentPath = route.path

    return {
      code: lang,
      label: LANG_LABELS[lang],
      link: normalizeLink(currentPath, lang),
      active: true,
    }
  })

  const localeLinks = computed((): LangLink[] => {
    const current = currentDetectedLang.value
    const currentPath = route.path

    return SUPPORTED_LOCALES
      .filter(lang => lang !== current && availableLocales.includes(lang))
      .map(lang => ({
        code: lang,
        label: LANG_LABELS[lang],
        link: normalizeLink(currentPath, lang),
        active: false,
      }))
  })

  const isDefaultLocale = computed(() => {
    return currentDetectedLang.value === DEFAULT_LOCALE
  })

  const switchToLang = async (lang: SupportedLocale): Promise<void> => {
    if (lang === currentDetectedLang.value) {
      return
    }

    const currentPath = route.path
    const newPath = normalizeLink(currentPath, lang)

    try {
      await loadLanguageAsync(lang)

      currentDetectedLang.value = lang

      await router.push(newPath)

      logger.info('Language switched:', {
        from: extractLangFromPath(currentPath),
        to: lang,
        oldPath: currentPath,
        newPath,
      })
    }
    catch (error) {
      logger.error('Error switching language:', error)
      currentDetectedLang.value = extractLangFromPath(currentPath)
      throw error
    }
  }

  watch(
    () => route.path,
    async (newPath) => {
      // Handle trailing slash redirect for language routes
      if (newPath !== '/' && newPath.endsWith('/') && extractLangFromPath(newPath) !== DEFAULT_LOCALE) {
        const normalizedPath = newPath.slice(0, -1)
        await router.replace(normalizedPath)
        return
      }

      const detectedLang = extractLangFromPath(newPath)

      if (detectedLang !== currentDetectedLang.value) {
        currentDetectedLang.value = detectedLang

        if (locale.value !== detectedLang) {
          await loadLanguageAsync(detectedLang)
        }
      }
    },
    { immediate: true },
  )

  return {
    currentLang,
    localeLinks,
    switchToLang,
    isDefaultLocale,
    normalizeLink,
  }
}

export function useLanguageSwitch() {
  const { currentLang, localeLinks, switchToLang } = useLangs()

  const getAllLanguageLinks = () => {
    return [currentLang.value, ...localeLinks.value]
  }

  const setLanguage = async (langCode: SupportedLocale) => {
    await switchToLang(langCode)
  }

  return {
    currentLanguage: computed(() => currentLang.value.code),
    getAllLanguageLinks,
    setLanguage,
  }
}
