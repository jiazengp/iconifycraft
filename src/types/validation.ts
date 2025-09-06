/**
 * 验证相关类型定义
 */

import { z } from 'zod'

/**
 * 验证规则类型
 */
export interface ValidationRule<T = unknown> {
  validator: (value: T) => boolean | Promise<boolean>
  message: string
  code?: string
}

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * 验证错误
 */
export interface ValidationError {
  field?: string
  message: string
  code?: string
  value?: unknown
}

/**
 * 表单验证器
 */
export interface FormValidator<T extends Record<string, any>> {
  validate: (data: T) => Promise<ValidationResult>
  validateField: (field: keyof T, value: unknown) => Promise<ValidationResult>
  rules: Partial<Record<keyof T, ValidationRule[]>>
}

/**
 * Minecraft相关验证模式
 */
export const MinecraftSchemas = {
  /**
   * 版本号验证
   */
  version: z.string().regex(
    /^\d+\.\d+(\.\d+)?(-\w+)?$/,
    'Invalid Minecraft version format',
  ),

  /**
   * 命名空间验证
   */
  namespace: z.string().regex(
    /^[a-z0-9_.-]+$/,
    'Namespace must contain only lowercase letters, numbers, underscores, dots and hyphens',
  ),

  /**
   * 材质ID验证
   */
  textureId: z.string().regex(
    /^[a-z0-9_/.-]+$/,
    'Texture ID must contain only lowercase letters, numbers, underscores, slashes, dots and hyphens',
  ),

  /**
   * Unicode编码点验证
   */
  unicodePoint: z.number().int().min(0x0000).max(0x10FFFF),

  /**
   * 颜色值验证
   */
  color: z.string().regex(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^transparent$/,
    'Invalid color format',
  ),

  /**
   * 文件大小验证
   */
  fileSize: z.number().int().positive().max(100 * 1024 * 1024), // 100MB

  /**
   * 图像尺寸验证
   */
  imageSize: z.object({
    width: z.number().int().positive().max(4096),
    height: z.number().int().positive().max(4096),
  }),

  /**
   * 包格式验证
   */
  packFormat: z.number().int().min(1).max(50),
}

/**
 * 材质包验证模式
 */
export const ResourcePackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  version: MinecraftSchemas.version,
  description: z.string().max(1000).optional(),
  author: z.string().max(255).optional(),
  textures: z.array(z.object({
    id: MinecraftSchemas.textureId,
    namespace: MinecraftSchemas.namespace,
    category: z.enum(['block', 'item']),
    path: z.string().min(1),
    fullPath: z.string().min(1),
    data: z.instanceof(Uint8Array),
    size: z.number().int().positive(),
    addedIn: z.string().optional(),
  })),
  size: MinecraftSchemas.fileSize,
  uploadedAt: z.date(),
  isVanilla: z.boolean().optional(),
})

/**
 * 图集配置验证模式
 */
export const AtlasOptionsSchema = z.object({
  size: z.number().int().min(64).max(4096),
  tileSize: z.number().int().min(8).max(128),
  padding: z.number().int().min(0).max(32),
  backgroundColor: MinecraftSchemas.color.optional(),
  compression: z.enum(['lossless', 'lossy']).optional(),
  quality: z.number().min(0).max(1).optional(),
})

/**
 * 导出配置验证模式
 */
export const ExportOptionsSchema = z.object({
  includeAtlas: z.boolean(),
  includeFont: z.boolean(),
  includeTranslations: z.boolean(),
  includeSounds: z.boolean(),
  includeModels: z.boolean(),
  compressionLevel: z.number().int().min(0).max(9),
  generateReadme: z.boolean(),
  generateChangelog: z.boolean(),
  customIcon: z.instanceof(Uint8Array).optional(),
  licenseFile: z.instanceof(File).optional(),
})

/**
 * 元数据验证模式
 */
export const MetadataSchema = z.object({
  name: z.string().min(1).max(255),
  displayName: z.string().min(1).max(255),
  description: z.string().max(1000),
  author: z.string().max(255),
  version: z.string().min(1).max(50),
  category: z.string().max(100),
  homepage: z.string().url().optional().or(z.literal('')),
  license: z.string().max(255).optional(),
  tags: z.array(z.string().max(50)),
  features: z.array(z.string().max(200)),
  credits: z.array(z.object({
    name: z.string().min(1).max(255),
    role: z.string().min(1).max(100),
    contribution: z.string().max(500),
  })),
  compatibility: z.object({
    minVersion: MinecraftSchemas.version,
    maxVersion: MinecraftSchemas.version.optional(),
    packFormat: MinecraftSchemas.packFormat.optional(),
  }),
  changelog: z.array(z.object({
    version: z.string().min(1),
    date: z.string().min(1),
    changes: z.array(z.string().min(1)),
  })),
})

/**
 * 验证器实用工具
 */
export class ValidationUtils {
  /**
   * 验证并返回结果
   */
  static async validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
  ): Promise<{ success: true, data: T } | { success: false, errors: ValidationError[] }> {
    try {
      const result = await schema.parseAsync(data)
      return { success: true, data: result }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          value: err.input,
        }))
        return { success: false, errors }
      }
      return {
        success: false,
        errors: [{ message: 'Unknown validation error' }],
      }
    }
  }

  /**
   * 安全解析，返回默认值
   */
  static safeParse<T>(schema: z.ZodSchema<T>, data: unknown, defaultValue: T): T {
    const result = schema.safeParse(data)
    return result.success ? result.data : defaultValue
  }

  /**
   * 验证文件类型
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type =>
      file.type === type || file.name.toLowerCase().endsWith(type.replace('/', '.')),
    )
  }

  /**
   * 验证图像文件
   */
  static async validateImageFile(file: File): Promise<ValidationResult> {
    const errors: ValidationError[] = []

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      errors.push({
        field: 'type',
        message: 'File must be an image',
        code: 'invalid_file_type',
      })
    }

    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB
      errors.push({
        field: 'size',
        message: 'Image file size must be less than 10MB',
        code: 'file_too_large',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * 验证ZIP文件
   */
  static async validateZipFile(file: File): Promise<ValidationResult> {
    const errors: ValidationError[] = []

    // 检查文件扩展名
    if (!file.name.toLowerCase().endsWith('.zip')) {
      errors.push({
        field: 'extension',
        message: 'File must be a ZIP archive',
        code: 'invalid_file_extension',
      })
    }

    // 检查文件大小
    if (file.size > 100 * 1024 * 1024) { // 100MB
      errors.push({
        field: 'size',
        message: 'ZIP file size must be less than 100MB',
        code: 'file_too_large',
      })
    }

    // 检查文件不为空
    if (file.size === 0) {
      errors.push({
        field: 'size',
        message: 'ZIP file cannot be empty',
        code: 'empty_file',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
