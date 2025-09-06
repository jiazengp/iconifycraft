/**
 * 图像缓存管理
 * 优化性能，避免重复加载相同图像
 */

interface CachedImage {
  image: HTMLImageElement
  loadPromise: Promise<HTMLImageElement>
  lastUsed: number
  refCount: number
}

class ImageCache {
  private cache = new Map<string, CachedImage>()
  private maxCacheSize = 50 // 最大缓存数量
  private cleanupInterval = 60000 // 清理间隔 1分钟

  constructor() {
    // 定期清理未使用的图像
    setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  /**
   * 获取缓存的图像
   */
  async getImage(url: string): Promise<HTMLImageElement> {
    const cached = this.cache.get(url)

    if (cached) {
      cached.lastUsed = Date.now()
      cached.refCount++
      return cached.loadPromise
    }

    // 创建新的图像加载Promise
    const image = new Image()
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => {
        resolve(image)
      }
      image.onerror = () => {
        // 加载失败时从缓存中移除
        this.cache.delete(url)
        reject(new Error(`Failed to load image: ${url}`))
      }
    })

    const cacheEntry: CachedImage = {
      image,
      loadPromise,
      lastUsed: Date.now(),
      refCount: 1,
    }

    this.cache.set(url, cacheEntry)

    // 开始加载
    image.src = url

    // 检查缓存大小
    if (this.cache.size > this.maxCacheSize) {
      this.cleanup()
    }

    return loadPromise
  }

  /**
   * 释放图像引用
   */
  releaseImage(url: string) {
    const cached = this.cache.get(url)
    if (cached) {
      cached.refCount = Math.max(0, cached.refCount - 1)
    }
  }

  /**
   * 清理未使用的图像
   */
  private cleanup() {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5分钟

    for (const [url, cached] of this.cache.entries()) {
      // 清理长时间未使用且无引用的图像
      if (cached.refCount === 0 && (now - cached.lastUsed) > maxAge) {
        // 清理Image对象
        cached.image.src = ''
        cached.image.onload = null
        cached.image.onerror = null

        this.cache.delete(url)
      }
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    for (const [, cached] of this.cache.entries()) {
      cached.image.src = ''
      cached.image.onload = null
      cached.image.onerror = null
    }
    this.cache.clear()
  }

  /**
   * 获取缓存状态
   */
  getStats() {
    return {
      size: this.cache.size,
      urls: Array.from(this.cache.keys()),
    }
  }
}

// 全局图像缓存实例
const imageCache = new ImageCache()

export function useImageCache() {
  return {
    getImage: (url: string) => imageCache.getImage(url),
    releaseImage: (url: string) => imageCache.releaseImage(url),
    clear: () => imageCache.clear(),
    getStats: () => imageCache.getStats(),
  }
}
