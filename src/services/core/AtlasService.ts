/**
 * 图集生成服务
 * 负责将材质组合成图集，生成Unicode映射和字体配置
 */

import type {
  AtlasOptions,
  AtlasResult,
  ProcessingOptions,
  TextureInfo,
} from '~/types/atlas'
import type { ParsedTexture } from '~/types/resource-pack'
import { DEFAULT_RECOLOR_CONFIG } from '~/types/atlas'
import { AtlasProcessor } from '~/utils/atlas-processor'
import { AtlasUnicodeGenerator } from '~/utils/atlas-unicode'

export class AtlasService {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private processor = new AtlasProcessor()
  private unicodeGen = new AtlasUnicodeGenerator()
  private worker: Worker | null = null

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.initWorker()
  }

  /**
   * 生成材质图集
   */
  async generateAtlas(
    textures: ParsedTexture[],
    options: AtlasOptions = this.getDefaultOptions(),
  ): Promise<AtlasResult> {
    this.validateInputs(textures, options)

    const { size, tileSize } = options
    const tilesPerRow = Math.floor(size / tileSize)
    const maxTextures = tilesPerRow * tilesPerRow

    if (textures.length > maxTextures) {
      throw new Error('atlas.tooManyTextures')
    }

    this.setupCanvas(size, options.backgroundColor)

    const atlasDict: Record<string, TextureInfo> = {}
    const processedTextures = await this.processTextures(textures, options)

    for (let i = 0; i < processedTextures.length; i++) {
      const texture = processedTextures[i]
      const x = (i % tilesPerRow) * tileSize
      const y = Math.floor(i / tilesPerRow) * tileSize

      await this.drawTextureToCanvas(texture, x, y, tileSize)

      atlasDict[texture.id] = this.unicodeGen.generateAtlasDictEntry(texture, i, x, y)
    }

    const atlasBlob = await this.canvasToBlob()
    const metadata = this.generateMetadata(textures, options, atlasDict)

    return {
      atlasBlob,
      atlasDict,
      metadata,
    }
  }

  /**
   * 处理材质（缩放、重着色、滤镜等）
   */
  private async processTextures(
    textures: ParsedTexture[],
    options: AtlasOptions,
  ): Promise<ParsedTexture[]> {
    const processed: ParsedTexture[] = []

    for (const texture of textures) {
      const recolorConfig = this.getRecolorConfig(texture.id)
      const processingOptions: ProcessingOptions = {
        recolor: recolorConfig,
        resize: {
          width: options.tileSize,
          height: options.tileSize,
          method: 'nearest',
        },
      }

      const processedData = await this.processor.processTextureData(texture.data, processingOptions)

      processed.push({
        ...texture,
        data: processedData,
      })
    }

    return processed
  }

  /**
   * 设置画布
   */
  private setupCanvas(size: number, backgroundColor?: string): void {
    this.canvas.width = size
    this.canvas.height = size
    this.ctx.fillStyle = backgroundColor || 'transparent'
    this.ctx.fillRect(0, 0, size, size)
  }

  /**
   * 绘制材质到画布
   */
  private async drawTextureToCanvas(
    texture: ParsedTexture,
    x: number,
    y: number,
    size: number,
  ): Promise<void> {
    const img = await this.createImageFromData(texture.data)
    this.ctx.drawImage(img, x, y, size, size)
  }

  /**
   * 从Uint8Array创建Image对象
   */
  private async createImageFromData(data: Uint8Array): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const arrayBuffer = data.buffer.slice(0) as ArrayBuffer // 强制转换为 ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'image/png' })
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
   * 获取重着色配置
   */
  private getRecolorConfig(textureId: string): [number, number, number] | undefined {
    return DEFAULT_RECOLOR_CONFIG[textureId]
  }

  /**
   * 转换画布为Blob
   */
  private async canvasToBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        blob ? resolve(blob) : reject(new Error('atlas.errors.blobConversionFailed'))
      }, 'image/png', 1.0)
    })
  }

  /**
   * 生成图集元数据
   */
  private generateMetadata(
    textures: ParsedTexture[],
    options: AtlasOptions,
    atlasDict: Record<string, TextureInfo>,
  ) {
    const namespaceStats = new Map<string, number>()
    const categoryStats = new Map<string, number>()

    for (const texture of textures) {
      namespaceStats.set(texture.namespace, (namespaceStats.get(texture.namespace) || 0) + 1)
      categoryStats.set(texture.category, (categoryStats.get(texture.category) || 0) + 1)
    }

    const codes = Object.values(atlasDict).map(info => Number.parseInt(info.unicode, 16)).sort((a, b) => a - b)

    return {
      totalTextures: textures.length,
      atlasSize: options.size,
      tileSize: options.tileSize,
      generatedAt: new Date(),
      unicodeRange: {
        start: codes[0]?.toString(16).padStart(4, '0') || '0000',
        end: codes[codes.length - 1]?.toString(16).padStart(4, '0') || '0000',
      },
      statistics: {
        byNamespace: Object.fromEntries(namespaceStats),
        byCategory: Object.fromEntries(categoryStats),
      },
    }
  }

  /**
   * 获取默认选项
   */
  private getDefaultOptions(): AtlasOptions {
    return {
      size: 1024,
      tileSize: 16,
      padding: 0,
      backgroundColor: 'transparent',
      compression: 'lossless',
      quality: 1.0,
    }
  }

  /**
   * 验证输入参数
   */
  private validateInputs(textures: ParsedTexture[], options: AtlasOptions): void {
    if (!textures || textures.length === 0) {
      throw new Error('atlas.noTextures')
    }

    if (!options.size || options.size < 64 || options.size > 4096) {
      throw new Error('atlas.invalidSize')
    }

    if (!options.tileSize || options.tileSize < 8 || options.tileSize > 128) {
      throw new Error('atlas.invalidTileSize')
    }

    if (options.size % options.tileSize !== 0) {
      throw new Error('atlas.incompatibleSizes')
    }
  }

  /**
   * 初始化Web Worker
   */
  private initWorker(): void {
    try {
      const workerCode = `
        self.onmessage = function(e) {
          const { imageData, filters } = e.data
          self.postMessage({ processedData: imageData })
        }
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      this.worker = new Worker(URL.createObjectURL(blob))
    }
    catch {
      // Worker初始化失败，继续使用主线程处理
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }
}
