/**
 * 元数据验证工具
 */
import type { CustomMetadata, MetadataValidationResult } from '~/types/metadata'
import { isValidURL } from './validation'

export class MetadataValidator {
  /**
   * 验证元数据
   */
  validate(metadata: CustomMetadata): MetadataValidationResult {
    const errors: Array<{ field: string, message: string, severity: 'error' | 'warning' }> = []
    const suggestions: string[] = []

    this.validateRequired(metadata, errors)
    this.validateFormats(metadata, errors)
    this.validateOptional(metadata, errors, suggestions)

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      suggestions,
    }
  }

  /**
   * 验证必填字段
   */
  private validateRequired(
    metadata: CustomMetadata,
    errors: Array<{ field: string, message: string, severity: 'error' | 'warning' }>,
  ): void {
    if (!metadata.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'validation.name.required',
        severity: 'error',
      })
    }
    else if (!/^[a-z0-9_-]+$/.test(metadata.name)) {
      errors.push({
        field: 'name',
        message: 'validation.name.format',
        severity: 'warning',
      })
    }

    if (!metadata.displayName?.trim()) {
      errors.push({
        field: 'displayName',
        message: 'validation.displayName.required',
        severity: 'error',
      })
    }

    if (!metadata.description?.trim()) {
      errors.push({
        field: 'description',
        message: 'validation.description.required',
        severity: 'error',
      })
    }
    else if (metadata.description.length > 256) {
      errors.push({
        field: 'description',
        message: 'validation.description.tooLong',
        severity: 'warning',
      })
    }
  }

  /**
   * 验证格式
   */
  private validateFormats(
    metadata: CustomMetadata,
    errors: Array<{ field: string, message: string, severity: 'error' | 'warning' }>,
  ): void {
    if (metadata.version && !this.isValidVersion(metadata.version)) {
      errors.push({
        field: 'version',
        message: 'validation.version.format',
        severity: 'warning',
      })
    }

    if (metadata.homepage && !isValidURL(metadata.homepage)) {
      errors.push({
        field: 'homepage',
        message: 'validation.homepage.format',
        severity: 'warning',
      })
    }

    if (!metadata.compatibility.minVersion) {
      errors.push({
        field: 'compatibility.minVersion',
        message: 'validation.compatibility.minVersion.required',
        severity: 'error',
      })
    }
  }

  /**
   * 验证可选字段并生成建议
   */
  private validateOptional(
    metadata: CustomMetadata,
    errors: Array<{ field: string, message: string, severity: 'error' | 'warning' }>,
    suggestions: string[],
  ): void {
    if (!metadata.author?.trim()) {
      suggestions.push('validation.suggestions.addAuthor')
    }

    if (metadata.tags.length === 0) {
      suggestions.push('validation.suggestions.addTags')
    }
  }

  /**
   * 验证版本号格式
   */
  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+(?:-[a-z0-9]+)?$/i.test(version)
  }
}
