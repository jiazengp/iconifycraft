/**
 * 材质包图标验证和处理服务
 * 负责验证用户上传的pack.png图标是否符合Minecraft官方要求
 */

export interface IconValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  imageData?: {
    width: number
    height: number
    format: string
    hasTransparency: boolean
    fileSize: number
  }
}

export interface PackIconRequirements {
  // 官方推荐尺寸
  recommendedSizes: number[]
  // 支持的尺寸范围
  minSize: number
  maxSize: number
  // 支持的格式
  supportedFormats: string[]
  // 最大文件大小 (字节)
  maxFileSize: number
  // 是否必须是正方形
  mustBeSquare: boolean
}

export class PackIconService {
  // Minecraft材质包图标官方要求
  private readonly REQUIREMENTS: PackIconRequirements = {
    recommendedSizes: [64, 128, 256, 512], // 官方推荐尺寸
    minSize: 16, // 最小尺寸
    maxSize: 1024, // 最大尺寸
    supportedFormats: ['image/png'], // 只支持PNG格式
    maxFileSize: 2 * 1024 * 1024, // 最大2MB
    mustBeSquare: true, // 必须是正方形
  }

  /**
   * 验证上传的图标文件
   */
  async validatePackIcon(file: File): Promise<IconValidationResult> {
    const result: IconValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    try {
      // 1. 基础文件验证
      this.validateBasicFile(file, result)

      if (result.errors.length > 0) {
        result.isValid = false
        return result
      }

      // 2. 图像数据验证
      const imageData = await this.loadAndValidateImage(file, result)
      if (imageData) {
        result.imageData = imageData
      }

      // 3. 最终验证结果
      result.isValid = result.errors.length === 0

      return result
    }
    catch (error) {
      result.isValid = false
      result.errors.push(error instanceof Error ? error.message : 'packIcon.errors.unknown')
      return result
    }
  }

  /**
   * 基础文件验证
   */
  private validateBasicFile(file: File, result: IconValidationResult): void {
    // 检查文件格式
    if (!this.REQUIREMENTS.supportedFormats.includes(file.type)) {
      result.errors.push(`不支持的文件格式: ${file.type}。仅支持PNG格式。`)
    }

    // 检查文件大小
    if (file.size > this.REQUIREMENTS.maxFileSize) {
      result.errors.push(`文件太大: ${this.formatFileSize(file.size)}。最大允许${this.formatFileSize(this.REQUIREMENTS.maxFileSize)}。`)
    }

    // 检查文件名
    if (file.name.toLowerCase() !== 'pack.png') {
      result.warnings.push(`建议将文件命名为 "pack.png"。当前文件名: ${file.name}`)
    }
  }

  /**
   * 加载并验证图像数据
   */
  private async loadAndValidateImage(file: File, result: IconValidationResult): Promise<{
    width: number
    height: number
    format: string
    hasTransparency: boolean
    fileSize: number
  } | null> {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        try {
          const { width, height } = img

          // 设置canvas尺寸
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0)

          const imageData = {
            width,
            height,
            format: file.type,
            hasTransparency: this.checkTransparency(ctx, width, height),
            fileSize: file.size,
          }

          // 验证图像尺寸
          this.validateImageDimensions(imageData, result)

          resolve(imageData)
        }
        catch {
          result.errors.push('packIcon.errors.cannotReadImageData')
          resolve(null)
        }
      }

      img.onerror = () => {
        result.errors.push('packIcon.errors.cannotLoadImage')
        resolve(null)
      }

      // 创建图像URL
      const url = URL.createObjectURL(file)
      img.src = url

      // 清理URL（在图像加载后）
      img.onload = (...args) => {
        URL.revokeObjectURL(url)
        // 调用原始的onload
        ;(img.onload as any)?.apply(img, args)
      }
    })
  }

  /**
   * 验证图像尺寸
   */
  private validateImageDimensions(imageData: { width: number, height: number }, result: IconValidationResult): void {
    const { width, height } = imageData

    // 检查是否为正方形
    if (this.REQUIREMENTS.mustBeSquare && width !== height) {
      result.errors.push(`图标必须是正方形。当前尺寸: ${width}x${height}`)
    }

    // 检查尺寸范围
    if (width < this.REQUIREMENTS.minSize || height < this.REQUIREMENTS.minSize) {
      result.errors.push(`图标太小。最小尺寸: ${this.REQUIREMENTS.minSize}x${this.REQUIREMENTS.minSize}，当前: ${width}x${height}`)
    }

    if (width > this.REQUIREMENTS.maxSize || height > this.REQUIREMENTS.maxSize) {
      result.errors.push(`图标太大。最大尺寸: ${this.REQUIREMENTS.maxSize}x${this.REQUIREMENTS.maxSize}，当前: ${width}x${height}`)
    }

    // 检查是否为推荐尺寸
    if (!this.REQUIREMENTS.recommendedSizes.includes(width)) {
      result.warnings.push(`建议使用推荐尺寸: ${this.REQUIREMENTS.recommendedSizes.join('x, ')}x。当前: ${width}x${height}`)
    }

    // 检查是否为2的幂
    if (!this.isPowerOfTwo(width)) {
      result.warnings.push(`为了最佳兼容性，建议使用2的幂次方尺寸 (16, 32, 64, 128, 256, 512...)`)
    }
  }

  /**
   * 检查图像是否包含透明度
   */
  private checkTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
    try {
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      // 检查alpha通道
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          return true // 发现透明或半透明像素
        }
      }
      return false
    }
    catch {
      return false // 无法检测，假设没有透明度
    }
  }

  /**
   * 检查数字是否为2的幂
   */
  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024)
      return `${bytes} B`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /**
   * 生成调整大小的图标
   */
  async resizeIcon(file: File, targetSize: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        try {
          canvas.width = targetSize
          canvas.height = targetSize

          // 使用高质量的图像缩放
          ctx.imageSmoothingEnabled = false // 像素艺术风格，保持锐利边缘
          ctx.drawImage(img, 0, 0, targetSize, targetSize)

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            }
            else {
              reject(new Error('packIcon.errors.cannotResize'))
            }
          }, 'image/png')
        }
        catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('packIcon.errors.cannotLoadImage'))

      const url = URL.createObjectURL(file)
      img.src = url

      img.onload = (...args) => {
        URL.revokeObjectURL(url)
        ;(img.onload as any)?.apply(img, args)
      }
    })
  }

  /**
   * 优化图标文件
   */
  async optimizeIcon(file: File, options: {
    targetSize?: number
    quality?: number
    removeMetadata?: boolean
  } = {}): Promise<Blob> {
    const { targetSize } = options

    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        try {
          const size = targetSize || Math.min(img.width, img.height)
          canvas.width = size
          canvas.height = size

          // 清空画布（确保透明背景）
          ctx.clearRect(0, 0, size, size)

          // 绘制图像
          ctx.imageSmoothingEnabled = size < img.width // 只在缩小时启用平滑
          ctx.drawImage(img, 0, 0, size, size)

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            }
            else {
              reject(new Error('packIcon.errors.optimizationFailed'))
            }
          }, 'image/png') // PNG保持最佳质量和透明度
        }
        catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('packIcon.errors.cannotLoadImage'))

      const url = URL.createObjectURL(file)
      img.src = url

      img.onload = (...args) => {
        URL.revokeObjectURL(url)
        ;(img.onload as any)?.apply(img, args)
      }
    })
  }

  /**
   * 获取图标预览URL
   */
  getPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * 获取要求说明
   */
  getRequirements(): PackIconRequirements {
    return { ...this.REQUIREMENTS }
  }

  /**
   * 生成要求说明文本
   */
  getRequirementsText(): string {
    const req = this.REQUIREMENTS
    return [
      `• 格式: PNG格式`,
      `• 尺寸: ${req.minSize}x${req.minSize} 到 ${req.maxSize}x${req.maxSize} 像素`,
      `• 推荐尺寸: ${req.recommendedSizes.join('x, ')}x 像素`,
      `• 形状: 必须是正方形`,
      `• 文件大小: 最大 ${this.formatFileSize(req.maxFileSize)}`,
      `• 建议: 包含透明背景，使用2的幂次方尺寸`,
      `• 文件名: 建议命名为 pack.png`,
    ].join('\n')
  }
}
