/**
 * Canvas对象池
 * 复用canvas实例以减少内存分配和垃圾回收
 */

interface PooledCanvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  size: number
  lastUsed: number
}

class CanvasPool {
  private pool: PooledCanvas[] = []
  private maxPoolSize = 20 // 最大池大小
  private maxIdleTime = 30000 // 30秒未使用则清理

  constructor() {
    // 定期清理空闲的canvas
    setInterval(() => {
      this.cleanup()
    }, 10000) // 每10秒清理一次
  }

  /**
   * 获取canvas实例
   */
  getCanvas(size: number): { canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D } {
    // 寻找可复用的canvas
    const reusableIndex = this.pool.findIndex(
      item => item.size === size && (Date.now() - item.lastUsed) < this.maxIdleTime,
    )

    if (reusableIndex !== -1) {
      const pooled = this.pool.splice(reusableIndex, 1)[0]
      pooled.lastUsed = Date.now()

      // 清理canvas内容
      pooled.ctx.clearRect(0, 0, size, size)

      return {
        canvas: pooled.canvas,
        ctx: pooled.ctx,
      }
    }

    // 创建新的canvas
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    return { canvas, ctx }
  }

  /**
   * 回收canvas到池中
   */
  returnCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, size: number) {
    if (this.pool.length >= this.maxPoolSize) {
      // 池已满，不回收
      return
    }

    // 清理canvas
    ctx.clearRect(0, 0, size, size)
    ctx.setTransform(1, 0, 0, 1, 0, 0) // 重置变换

    this.pool.push({
      canvas,
      ctx,
      size,
      lastUsed: Date.now(),
    })
  }

  /**
   * 清理空闲的canvas
   */
  private cleanup() {
    const now = Date.now()
    this.pool = this.pool.filter((item) => {
      const isExpired = (now - item.lastUsed) > this.maxIdleTime
      if (isExpired) {
        // 清理过期的canvas
        item.canvas.width = 0
        item.canvas.height = 0
      }
      return !isExpired
    })
  }

  /**
   * 清空池
   */
  clear() {
    this.pool.forEach((item) => {
      item.canvas.width = 0
      item.canvas.height = 0
    })
    this.pool = []
  }

  /**
   * 获取池状态
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      maxPoolSize: this.maxPoolSize,
      sizes: this.pool.map(item => item.size),
    }
  }
}

// 全局canvas池实例
const canvasPool = new CanvasPool()

export function useCanvasPool() {
  return {
    getCanvas: (size: number) => canvasPool.getCanvas(size),
    returnCanvas: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, size: number) =>
      canvasPool.returnCanvas(canvas, ctx, size),
    clear: () => canvasPool.clear(),
    getStats: () => canvasPool.getStats(),
  }
}
