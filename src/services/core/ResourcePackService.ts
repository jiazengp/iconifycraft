/**
 * 材质包解析服务
 * 负责解析ZIP文件，提取材质和元数据
 */

import type { PackMetadata, ParsedTexture, ResourcePack } from '~/types/resource-pack'

export class ResourcePackService {
  private readonly SUPPORTED_EXTENSIONS = ['.png', '.mcmeta'] as const
  private readonly TEXTURE_PATH_REGEX = /^assets\/([^/]+)\/textures\/(block|item)\/(.+)\.png$/
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

  /**
   * 解析ZIP格式的材质包
   */
  async parseResourcePack(file: File): Promise<ResourcePack> {
    this.validateFile(file)

    const { files, metadata, packIcon } = await this.extractZipContent(file)
    const textures = await this.parseTextures(files)
    const icon = await this.processPackIcon(packIcon, textures)

    return {
      id: this.generatePackId(file.name),
      name: this.sanitizePackName(file.name),
      version: metadata?.pack?.pack_format?.toString() || 'unknown',
      metadata,
      textures,
      size: file.size,
      uploadedAt: new Date(),
      icon,
    }
  }

  /**
   * 验证文件格式和大小
   */
  private validateFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      throw new Error('validation.invalidFileType')
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('validation.fileTooLarge')
    }

    if (file.size === 0) {
      throw new Error('validation.emptyFile')
    }
  }

  /**
   * 提取ZIP文件内容
   */
  private async extractZipContent(file: File): Promise<{
    files: Map<string, Uint8Array>
    metadata: PackMetadata
    packIcon: Uint8Array | null
  }> {
    try {
      // 使用动态导入避免增加打包体积
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(file)

      const files = new Map<string, Uint8Array>()
      let metadata: PackMetadata = {}
      let packIcon: Uint8Array | null = null

      for (const [path, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir)
          continue

        const lowerPath = path.toLowerCase()

        // 解析 pack.mcmeta
        if (lowerPath.endsWith('pack.mcmeta')) {
          const content = await zipEntry.async('text')
          try {
            metadata = JSON.parse(content)
          }
          catch {
            // 忽略无效的 mcmeta 文件
          }
          continue
        }

        // 提取 pack.png
        if (lowerPath === 'pack.png') {
          packIcon = await zipEntry.async('uint8array')
          continue
        }

        // 提取材质文件
        if (lowerPath.endsWith('.png') && this.isTexturePath(path)) {
          const data = await zipEntry.async('uint8array')
          files.set(path, data)
        }
      }

      return { files, metadata, packIcon }
    }
    catch {
      throw new Error('parse.invalid_zip')
    }
  }

  /**
   * 解析材质文件
   */
  private async parseTextures(files: Map<string, Uint8Array>): Promise<ParsedTexture[]> {
    const textures: ParsedTexture[] = []

    for (const [path, data] of files) {
      const match = this.TEXTURE_PATH_REGEX.exec(path)
      if (!match)
        continue

      const [, namespace, category, texturePath] = match

      // 验证图像数据
      if (!await this.isValidImage(data)) {
        continue
      }

      textures.push({
        id: this.generateTextureId(namespace, category, texturePath),
        namespace,
        category: category as 'block' | 'item',
        path: texturePath,
        fullPath: path,
        data,
        size: data.length,
        addedIn: 'unknown', // 从材质包解析时无法确定具体版本，设置为unknown
      })
    }

    return textures.sort((a, b) => a.id.localeCompare(b.id))
  }

  /**
   * 验证是否为有效的图像数据
   */
  private async isValidImage(data: Uint8Array): Promise<boolean> {
    try {
      // 检查PNG文件头
      const pngHeader = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]

      if (data.length < 8)
        return false

      for (let i = 0; i < 8; i++) {
        if (data[i] !== pngHeader[i])
          return false
      }

      return true
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否为材质路径
   */
  private isTexturePath(path: string): boolean {
    return this.TEXTURE_PATH_REGEX.test(path)
  }

  /**
   * 生成材质包ID
   */
  private generatePackId(fileName: string): string {
    const sanitized = fileName.replace(/[^\w.-]/g, '_')
    return `pack_${Date.now()}_${sanitized}`
  }

  /**
   * 生成材质ID
   */
  private generateTextureId(namespace: string, category: string, path: string): string {
    return `${namespace}:${category}/${path}`
  }

  /**
   * 清理材质包名称
   */
  private sanitizePackName(fileName: string): string {
    return fileName.replace(/\.zip$/i, '').replace(/[_-]/g, ' ')
  }

  /**
   * 获取支持的文件扩展名
   */
  getSupportedExtensions(): readonly string[] {
    return this.SUPPORTED_EXTENSIONS
  }

  /**
   * 处理pack图标
   */
  private async processPackIcon(packIcon: Uint8Array | null, textures: ParsedTexture[]): Promise<string | undefined> {
    if (packIcon && await this.isValidImage(packIcon)) {
      return this.createDataUrl(packIcon)
    }

    // 如果没有pack.png，自动生成一个图标
    return await this.generateAutoIcon(textures)
  }

  private async generateAutoIcon(textures: ParsedTexture[]): Promise<string | undefined> {
    if (textures.length === 0)
      return undefined

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx)
        return undefined

      const iconSize = 64
      const gridSize = 2
      const textureSize = iconSize / gridSize

      canvas.width = iconSize
      canvas.height = iconSize
      ctx.fillStyle = '#374151'
      ctx.fillRect(0, 0, iconSize, iconSize)

      const selectedTextures = this.selectRepresentativeTextures(textures, 4)

      for (let i = 0; i < selectedTextures.length; i++) {
        const texture = selectedTextures[i]
        const x = (i % gridSize) * textureSize
        const y = Math.floor(i / gridSize) * textureSize

        try {
          const img = await this.loadImageFromData(texture.data)
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(img, x, y, textureSize, textureSize)
        }
        catch {
          ctx.fillStyle = '#6b7280'
          ctx.fillRect(x, y, textureSize, textureSize)
          ctx.fillStyle = '#374151'
        }
      }

      return canvas.toDataURL('image/png')
    }
    catch {
      return undefined
    }
  }

  private selectRepresentativeTextures(textures: ParsedTexture[], maxCount: number): ParsedTexture[] {
    if (textures.length <= maxCount)
      return textures

    const selected: ParsedTexture[] = []
    const priorityNames = [
      'diamond_sword',
      'diamond_pickaxe',
      'golden_apple',
      'emerald',
      'diamond',
      'iron_ingot',
      'gold_ingot',
      'redstone',
      'grass_block',
      'stone',
      'oak_log',
      'water',
      'dirt',
      'cobblestone',
      'sand',
      'oak_leaves',
      'sword',
      'pickaxe',
      'apple',
      'bread',
    ]

    for (const name of priorityNames) {
      if (selected.length >= maxCount)
        break
      const texture = textures.find(t => t.path.includes(name))
      if (texture && !selected.includes(texture)) {
        selected.push(texture)
      }
    }

    if (selected.length < maxCount) {
      const items = textures.filter(t => t.category === 'item' && !selected.includes(t))
      const blocks = textures.filter(t => t.category === 'block' && !selected.includes(t))
      const remaining = maxCount - selected.length
      const itemsCount = Math.min(Math.ceil(remaining / 2), items.length)

      selected.push(...items.slice(0, itemsCount))
      selected.push(...blocks.slice(0, remaining - itemsCount))
    }

    if (selected.length < maxCount) {
      const remaining = textures.filter(t => !selected.includes(t))
      selected.push(...remaining.slice(0, maxCount - selected.length))
    }

    return selected
  }

  private loadImageFromData(data: Uint8Array): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = this.createDataUrl(data)

      const cleanup = () => URL.revokeObjectURL(url)

      img.onload = () => {
        cleanup()
        resolve(img)
      }
      img.onerror = () => {
        cleanup()
        reject(new Error('Failed to load image'))
      }
      img.src = url
    })
  }

  private createDataUrl(data: Uint8Array): string {
    return URL.createObjectURL(new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer], { type: 'image/png' }))
  }

  getMaxFileSize(): number {
    return this.MAX_FILE_SIZE
  }
}
