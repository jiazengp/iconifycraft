import type { ProcessingOptions } from '~/types/atlas'
/**
 * 图集处理工具
 */

export class AtlasProcessor {
  /**
   * 处理材质数据
   */
  async processTextureData(
    imageData: Uint8Array,
    options: ProcessingOptions,
  ): Promise<Uint8Array> {
    const img = await this.createImageFromData(imageData)

    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!

    const targetWidth = options.resize?.width || img.width
    const targetHeight = options.resize?.height || img.height

    tempCanvas.width = targetWidth
    tempCanvas.height = targetHeight

    const smoothing = options.resize?.method !== 'nearest'
    tempCtx.imageSmoothingEnabled = smoothing
    if (!smoothing) {
      tempCtx.imageSmoothingQuality = 'high'
    }

    tempCtx.drawImage(img, 0, 0, targetWidth, targetHeight)

    if (options.recolor) {
      await this.applyRecolor(tempCtx, targetWidth, targetHeight, options.recolor)
    }

    if (options.filters) {
      await this.applyFilters(tempCtx, targetWidth, targetHeight, options.filters)
    }

    return this.canvasToUint8Array(tempCanvas)
  }

  /**
   * 从Uint8Array创建Image对象
   */
  private async createImageFromData(data: Uint8Array): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([new Uint8Array(data)], { type: 'image/png' })
      const url = URL.createObjectURL(blob)
      const img = new Image()

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('atlas.errors.imageLoadFailed'))
      }

      img.src = url
    })
  }

  /**
   * 应用重着色效果
   */
  private async applyRecolor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: [number, number, number],
  ): Promise<void> {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // 非透明像素
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        const factor = gray / 255

        data[i] = Math.min(255, color[0] * factor) // R
        data[i + 1] = Math.min(255, color[1] * factor) // G
        data[i + 2] = Math.min(255, color[2] * factor) // B
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * 应用滤镜效果
   */
  private async applyFilters(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filters: Array<{ type: string, value: number }>,
  ): Promise<void> {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (const filter of filters) {
      switch (filter.type) {
        case 'brightness':
          this.applyBrightness(data, filter.value)
          break
        case 'contrast':
          this.applyContrast(data, filter.value)
          break
        case 'saturation':
          this.applySaturation(data, filter.value)
          break
        case 'hue':
          this.applyHueShift(data, filter.value)
          break
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * 转换画布为Uint8Array
   */
  private canvasToUint8Array(canvas: HTMLCanvasElement): Uint8Array {
    const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height)
    return new Uint8Array(imageData.data.buffer)
  }

  /**
   * 滤镜实现
   */
  private applyBrightness(data: Uint8ClampedArray, value: number): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + value))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value))
    }
  }

  private applyContrast(data: Uint8ClampedArray, value: number): void {
    const factor = (259 * (value + 255)) / (255 * (259 - value))

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
    }
  }

  private applySaturation(data: Uint8ClampedArray, value: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

      data[i] = Math.min(255, Math.max(0, gray + value * (data[i] - gray)))
      data[i + 1] = Math.min(255, Math.max(0, gray + value * (data[i + 1] - gray)))
      data[i + 2] = Math.min(255, Math.max(0, gray + value * (data[i + 2] - gray)))
    }
  }

  private applyHueShift(data: Uint8ClampedArray, degrees: number): void {
    const radians = (degrees * Math.PI) / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255

      const newR = r * cos - g * sin
      const newG = r * sin + g * cos

      data[i] = Math.min(255, Math.max(0, newR * 255))
      data[i + 1] = Math.min(255, Math.max(0, newG * 255))
      data[i + 2] = Math.min(255, Math.max(0, b * 255))
    }
  }
}
