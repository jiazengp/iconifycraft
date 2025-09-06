import type { Ref } from 'vue'
import { onMounted, onUnmounted, readonly, ref } from 'vue'

export interface ScrollHashOptions {
  offset?: number
  throttle?: number
  selector?: string
  updateUrl?: boolean
}

interface HeaderElement {
  element: HTMLElement
  id: string
  top: number
}

export function useScrollHash(options: ScrollHashOptions = {}) {
  const {
    offset = 0,
    throttle = 100,
    selector = 'h1, h2, h3, h4, h5, h6',
    updateUrl = true,
  } = options

  const currentHash = ref<string>('')
  const headers: Ref<HeaderElement[]> = ref([])

  let throttleTimer: number | null = null

  function throttleAndDebounce(fn: () => void, delay: number) {
    return () => {
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
      throttleTimer = window.setTimeout(fn, delay)
    }
  }

  function getAbsoluteTop(element: HTMLElement): number {
    let offsetTop = 0
    let currentElement: HTMLElement | null = element

    while (currentElement && currentElement !== document.body) {
      offsetTop += currentElement.offsetTop
      currentElement = currentElement.offsetParent as HTMLElement
    }

    return offsetTop
  }

  function collectHeaders() {
    const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>

    headers.value = Array.from(elements)
      .filter(el => el.id && el.offsetParent !== null)
      .map(el => ({
        element: el,
        id: el.id,
        top: getAbsoluteTop(el),
      }))
      .sort((a, b) => a.top - b.top)
  }

  function setActiveHash() {
    if (!headers.value.length)
      return

    const scrollY = window.scrollY
    const innerHeight = window.innerHeight
    const offsetHeight = document.body.offsetHeight
    const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1

    // 页面顶部
    if (scrollY < 1) {
      updateHash('')
      return
    }

    // 页面底部 - 高亮最后一个标题
    if (isBottom) {
      const lastHeader = headers.value[headers.value.length - 1]
      updateHash(lastHeader.id)
      return
    }

    // 找到视窗顶部上方的最后一个标题
    let activeId = ''
    for (const header of headers.value) {
      if (header.top > scrollY + offset + 4) {
        break
      }
      activeId = header.id
    }

    updateHash(activeId)
  }

  function updateHash(id: string) {
    if (currentHash.value === id)
      return

    currentHash.value = id

    if (updateUrl && !id.includes('reka')) {
      const newHash = id ? `#${id}` : ''
      const newUrl = `${window.location.pathname}${window.location.search}${newHash}`

      // 使用 replaceState 避免触发页面跳转
      window.history.replaceState(null, '', newUrl)
    }
  }

  const onScroll = throttleAndDebounce(setActiveHash, throttle)

  onMounted(() => {
    collectHeaders()

    const initialHash = window.location.hash.slice(1)
    if (initialHash) {
      currentHash.value = initialHash
    }

    requestAnimationFrame(setActiveHash)

    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    if (throttleTimer) {
      clearTimeout(throttleTimer)
    }
    window.removeEventListener('scroll', onScroll)
  })

  return {
    currentHash: readonly(currentHash),
    headers: readonly(headers),
    collectHeaders,
    setActiveHash,
  }
}
