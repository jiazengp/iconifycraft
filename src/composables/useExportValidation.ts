import type { ExportOptions } from '~/services/core/ExportService'
import { computed } from 'vue'

interface ValidationContext {
  hasVanillaPack: boolean
  hasAtlas: boolean
  hasTranslations: boolean
  isMetadataValid: boolean
  hasVersionSelected: boolean
}

export function useExportValidation(
  exportOptions: ExportOptions,
  context: ValidationContext,
) {
  const canExport = computed(() =>
    context.hasVanillaPack
    && context.isMetadataValid
    && context.hasVersionSelected,
  )

  const canPreview = computed(() =>
    context.hasAtlas || context.hasTranslations,
  )

  const validationIssues = computed(() => {
    const issues: string[] = []

    if (!context.hasVanillaPack) {
      issues.push('export.validation.noVanillaPack')
    }

    if (!context.isMetadataValid) {
      issues.push('export.validation.invalidMetadata')
    }

    if (!context.hasVersionSelected) {
      issues.push('export.validation.noVersionSelected')
    }

    if (exportOptions.includeAtlas && !context.hasAtlas) {
      issues.push('export.validation.noAtlas')
    }

    if (exportOptions.includeTranslations && !context.hasTranslations) {
      issues.push('export.validation.noTranslations')
    }

    return issues
  })

  const isValid = computed(() => validationIssues.value.length === 0)

  return {
    canExport,
    canPreview,
    validationIssues,
    isValid,
  }
}
