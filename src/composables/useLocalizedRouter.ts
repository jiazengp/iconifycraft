import type { RouteLocationRaw } from 'vue-router'
import { DEFAULT_LOCALE } from '~/modules/i18n'
import { extractLangFromPath } from './useLangs'

export function useLocalizedRouter() {
  const router = useRouter()
  const route = useRoute()

  const localizeRoute = (path: string, lang?: string): string => {
    const currentLang = lang || extractLangFromPath(route.path)
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    if (currentLang === DEFAULT_LOCALE) {
      return cleanPath
    }

    return `/${currentLang}${cleanPath}`
  }

  const pushLocalized = async (to: string | RouteLocationRaw): Promise<void> => {
    if (typeof to === 'string') {
      const localizedPath = localizeRoute(to)
      await router.push(localizedPath)
    }
    else {
      const localizedRoute = { ...to }
      if (localizedRoute.path) {
        localizedRoute.path = localizeRoute(localizedRoute.path)
      }
      await router.push(localizedRoute)
    }
  }

  const replaceLocalized = async (to: string | RouteLocationRaw): Promise<void> => {
    if (typeof to === 'string') {
      const localizedPath = localizeRoute(to)
      await router.replace(localizedPath)
    }
    else {
      const localizedRoute = { ...to }
      if (localizedRoute.path) {
        localizedRoute.path = localizeRoute(localizedRoute.path)
      }
      await router.replace(localizedRoute)
    }
  }

  const resolveLocalized = (to: string | RouteLocationRaw): RouteLocationRaw => {
    if (typeof to === 'string') {
      return localizeRoute(to)
    }
    else {
      const localizedRoute = { ...to }
      if (localizedRoute.path) {
        localizedRoute.path = localizeRoute(localizedRoute.path)
      }
      return localizedRoute
    }
  }

  const getCurrentLanguage = (): string => {
    return extractLangFromPath(route.path)
  }

  const isRouteLocalized = (path: string): boolean => {
    const lang = extractLangFromPath(path)
    return lang !== DEFAULT_LOCALE
  }

  return {
    localizeRoute,
    pushLocalized,
    replaceLocalized,
    resolveLocalized,
    getCurrentLanguage,
    isRouteLocalized,
  }
}

export function useGlobalRouter() {
  const { pushLocalized, replaceLocalized, localizeRoute } = useLocalizedRouter()

  return {
    push: pushLocalized,
    replace: replaceLocalized,
    localize: localizeRoute,
  }
}
