/**
 * Intersection Observer 组合函数
 * 用于检测元素是否在视口中，优化渲染性能
 */

import { onMounted, onUnmounted, readonly, ref } from 'vue'

interface UseIntersectionObserverOptions {
  /** 根元素边距 */
  rootMargin?: string
  /** 触发阈值 */
  threshold?: number | number[]
  /** 根元素 */
  root?: Element | null
}

export function useIconIntersectionObserver(
  callback: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void,
  options: UseIntersectionObserverOptions = {},
) {
  const {
    rootMargin = '50px',
    threshold = 0,
    root = null,
  } = options

  const targetRef = ref<Element>()
  const isIntersecting = ref(false)
  let observer: IntersectionObserver | null = null

  const startObserving = () => {
    if (!targetRef.value || observer)
      return

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const wasIntersecting = isIntersecting.value
        isIntersecting.value = entry.isIntersecting

        // 只在状态变化时调用回调
        if (wasIntersecting !== entry.isIntersecting) {
          callback(entry.isIntersecting, entry)
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    )

    observer.observe(targetRef.value)
  }

  const stopObserving = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    if (targetRef.value) {
      startObserving()
    }
  })

  onUnmounted(() => {
    stopObserving()
  })

  return {
    targetRef,
    isIntersecting: readonly(isIntersecting),
    startObserving,
    stopObserving,
  }
}
