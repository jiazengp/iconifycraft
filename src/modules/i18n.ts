import type { Locale } from 'vue-i18n'
import type { UserModule } from '~/types'
import { createI18n } from 'vue-i18n'

export const SUPPORTED_LOCALES = ['zh', 'en'] as const
export const DEFAULT_LOCALE = 'zh'
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

// 语言代码到标准 locale 的映射
export const LOCALE_CODE_MAP: Record<SupportedLocale, string> = {
  zh: 'zh-CN',
  en: 'en-US',
}

const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  flatJson: true,
  messages: {},
})

const localesMap = Object.fromEntries(
  Object.entries(import.meta.glob('../../locales/*.yml'))
    .map(([path, loader]) => [path.match(/([\w-]*)\.yml$/)?.[1], loader]),
) as Record<Locale, () => Promise<{ default: Record<string, string> }>>

const minecraftLocalesMap = Object.fromEntries(
  Object.entries(import.meta.glob('../../locales/*.json'))
    .map(([path, loader]) => [path.match(/([\w-]*)\.json$/)?.[1], loader]),
) as Record<string, () => Promise<Record<string, string>>>

export const availableLocales = Object.keys(localesMap)
const loadedLanguages: string[] = []

function setI18nLanguage(lang: Locale) {
  i18n.global.locale.value = lang
  if (typeof document !== 'undefined')
    document.querySelector('html')?.setAttribute('lang', lang)
  return lang
}

export async function loadLanguageAsync(lang: SupportedLocale): Promise<Locale> {
  // 加载 UI 翻译
  const messages = await localesMap[lang]()
  let allMessages = messages.default

  if (minecraftLocalesMap[lang]) {
    const minecraftMessages = await minecraftLocalesMap[lang]()
    allMessages = { ...minecraftMessages, ...allMessages }
  }

  i18n.global.setLocaleMessage(lang, allMessages)

  // 每次都设置语言以确保响应式更新
  if (!loadedLanguages.includes(lang)) {
    loadedLanguages.push(lang)
  }
  return setI18nLanguage(lang)
}

// 获取 Minecraft 翻译 key
export function getMinecraftTranslationKey(filename: string, type: 'item' | 'block'): string {
  const itemName = filename.replace(/\.(png|jpg|jpeg|gif)$/, '').toLowerCase()
  return `default.${type}.minecraft.${itemName}`
}

// 获取 Minecraft 翻译名称
export function getMinecraftItemName(filename: string, type: 'item' | 'block'): string {
  const key = getMinecraftTranslationKey(filename, type)
  const translation = i18n.global.t(key)
  if (translation === key) {
    return filename.replace(/\.(png|jpg|jpeg|gif)$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }
  return translation
}

// 导出 i18n 实例
export { i18n }

export const install: UserModule = async ({ app, router }) => {
  app.use(i18n)

  // 添加路由守卫来自动处理语言加载
  router.beforeEach(async (to) => {
    // 从路由中提取语言代码
    const pathSegments = to.path.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]

    let targetLang: SupportedLocale = DEFAULT_LOCALE

    // 检查第一段是否是支持的语言代码
    if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)) {
      targetLang = firstSegment as SupportedLocale
    }

    // 自动加载对应语言
    await loadLanguageAsync(targetLang)

    return true
  })

  // 初始化默认语言
  await loadLanguageAsync(DEFAULT_LOCALE)
}
