import type { ParsedTexture } from '~/types/resource-pack'

interface CanvasRendererOptions {
  onError?: (error: string, textureId: string) => void
  onSuccess?: (textureId: string) => void
  timeout?: number
}

export class AtlasCanvasRenderer {
  private textureSize: number

  constructor(textureSize: number = 16) {
    this.textureSize = textureSize
  }

  createCanvas(texturesPerRow: number, totalRows: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = texturesPerRow * this.textureSize
    canvas.height = totalRows * this.textureSize

    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.imageSmoothingEnabled = false
    ;(ctx as any).webkitImageSmoothingEnabled = false
    ;(ctx as any).mozImageSmoothingEnabled = false
    ;(ctx as any).msImageSmoothingEnabled = false

    return canvas
  }

  async renderTexture(
    ctx: CanvasRenderingContext2D,
    texture: ParsedTexture,
    x: number,
    y: number,
    options: CanvasRendererOptions = {},
  ): Promise<void> {
    const { onError, onSuccess, timeout = 5000 } = options

    // 使用原始材质数据
    if (!texture.data || texture.data.length === 0) {
      const errorMsg = `Texture data missing for: ${texture.id}`
      onError?.(errorMsg, texture.id)
      throw new Error(errorMsg)
    }

    const blob = new Blob([new Uint8Array(texture.data)], { type: 'image/png' })
    const imageUrl = URL.createObjectURL(blob)

    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          const errorMsg = `Texture load timeout: ${texture.id}`
          onError?.(errorMsg, texture.id)
          reject(new Error(errorMsg))
        }, timeout)

        img.onload = () => {
          clearTimeout(timeoutId)
          onSuccess?.(texture.id)
          resolve()
        }
        img.onerror = () => {
          clearTimeout(timeoutId)
          const errorMsg = `Failed to load texture: ${texture.id}`
          onError?.(errorMsg, texture.id)
          reject(new Error(errorMsg))
        }
        img.src = imageUrl
      })

      ctx.drawImage(img, x, y, this.textureSize, this.textureSize)
    }
    finally {
      URL.revokeObjectURL(imageUrl)
    }
  }

  drawErrorPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#ff4444'
    ctx.fillRect(x, y, this.textureSize, this.textureSize)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.floor(this.textureSize / 4)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ERR', x + this.textureSize / 2, y + this.textureSize / 2)
  }

  async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        blob ? resolve(blob) : reject(new Error('atlas.errors.blobConversionFailed'))
      }, 'image/png', 1.0)
    })
  }
}
