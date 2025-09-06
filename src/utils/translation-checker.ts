/**
 * 翻译检查工具
 * 用于检查哪些材质文件没有对应的翻译key
 */

import { getTranslationMapping } from '~/data/texture-translation-mapping'
import { logger } from '~/utils/logger'

export interface TranslationCheckResult {
  /** 有翻译的材质 */
  translated: {
    textureName: string
    translationKey: string
    translationType: 'item' | 'block'
    hasCustomMapping: boolean
  }[]
  /** 没有翻译的材质 */
  untranslated: {
    textureName: string
    expectedKey: string
    type: 'item' | 'block'
  }[]
  /** 统计信息 */
  stats: {
    total: number
    translated: number
    untranslated: number
    customMapped: number
    coverage: number
  }
}

/**
 * 检查材质的翻译覆盖率
 */
export function checkTranslationCoverage(
  textures: { name: string, fullPath?: string }[],
  translations: { [key: string]: string },
): TranslationCheckResult {
  const result: TranslationCheckResult = {
    translated: [],
    untranslated: [],
    stats: {
      total: 0,
      translated: 0,
      untranslated: 0,
      customMapped: 0,
      coverage: 0,
    },
  }

  for (const texture of textures) {
    const textureName = texture.name.replace(/\.(png|jpg|jpeg|gif)$/, '')

    // 判断材质类型
    const isBlockTexture = texture.fullPath?.includes('/textures/block/')
    const defaultType: 'item' | 'block' = isBlockTexture ? 'block' : 'item'

    // 检查是否有自定义映射
    const mapping = getTranslationMapping(texture.name)

    let translationKey: string
    let translationType: 'item' | 'block'
    let hasCustomMapping = false

    if (mapping) {
      // 使用自定义映射
      translationKey = `${mapping.type}.minecraft.${mapping.translationKey}`
      translationType = mapping.type
      hasCustomMapping = true
    }
    else {
      // 使用默认映射
      translationKey = `${defaultType}.minecraft.${textureName}`
      translationType = defaultType
    }

    // 检查翻译是否存在
    if (translations[translationKey]) {
      result.translated.push({
        textureName: texture.name,
        translationKey,
        translationType,
        hasCustomMapping,
      })

      if (hasCustomMapping) {
        result.stats.customMapped++
      }
    }
    else {
      result.untranslated.push({
        textureName: texture.name,
        expectedKey: translationKey,
        type: translationType,
      })
    }
  }

  result.stats.total = textures.length
  result.stats.translated = result.translated.length
  result.stats.untranslated = result.untranslated.length
  result.stats.coverage = (result.stats.translated / result.stats.total) * 100

  return result
}

/**
 * 生成翻译检查报告
 */
export function generateTranslationReport(result: TranslationCheckResult): string {
  const lines: string[] = []

  lines.push('# 材质翻译检查报告')
  lines.push('')

  // 统计信息
  lines.push('## 统计信息')
  lines.push(`- 总材质数量: ${result.stats.total}`)
  lines.push(`- 已翻译: ${result.stats.translated}`)
  lines.push(`- 未翻译: ${result.stats.untranslated}`)
  lines.push(`- 自定义映射: ${result.stats.customMapped}`)
  lines.push(`- 翻译覆盖率: ${result.stats.coverage.toFixed(1)}%`)
  lines.push('')

  // 未翻译的材质
  if (result.untranslated.length > 0) {
    lines.push('## 缺失翻译的材质')
    lines.push('')
    lines.push('以下材质没有找到对应的翻译key：')
    lines.push('')

    // 按类型分组
    const itemTextures = result.untranslated.filter(t => t.type === 'item')
    const blockTextures = result.untranslated.filter(t => t.type === 'block')

    if (itemTextures.length > 0) {
      lines.push('### 物品材质 (Items)')
      lines.push('')
      for (const texture of itemTextures) {
        lines.push(`- \`${texture.textureName}\` → \`${texture.expectedKey}\``)
      }
      lines.push('')
    }

    if (blockTextures.length > 0) {
      lines.push('### 方块材质 (Blocks)')
      lines.push('')
      for (const texture of blockTextures) {
        lines.push(`- \`${texture.textureName}\` → \`${texture.expectedKey}\``)
      }
      lines.push('')
    }
  }

  // 需要添加到映射表的建议
  if (result.untranslated.length > 0) {
    lines.push('## 建议添加到映射表')
    lines.push('')
    lines.push('```typescript')
    lines.push('// 添加到 TEXTURE_TRANSLATION_MAPPING 中：')

    for (const texture of result.untranslated.slice(0, 20)) { // 只显示前20个
      const cleanName = texture.textureName.replace(/\.(png|jpg|jpeg|gif)$/, '')
      lines.push(`'${cleanName}': { translationKey: '${cleanName}', type: '${texture.type}' },`)
    }

    if (result.untranslated.length > 20) {
      lines.push(`// ... 还有 ${result.untranslated.length - 20} 个`)
    }

    lines.push('```')
    lines.push('')
  }

  // 自定义映射使用情况
  if (result.stats.customMapped > 0) {
    lines.push('## 自定义映射使用情况')
    lines.push('')
    lines.push(`共有 ${result.stats.customMapped} 个材质使用了自定义映射：`)
    lines.push('')

    const customMapped = result.translated.filter(t => t.hasCustomMapping)
    for (const texture of customMapped) {
      lines.push(`- \`${texture.textureName}\` → \`${texture.translationKey}\``)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * 控制台输出翻译检查结果
 */
export function logTranslationCheck(result: TranslationCheckResult): void {
  logger.info('🔍 材质翻译检查结果')
  logger.info(`📊 覆盖率: ${result.stats.coverage.toFixed(1)}% (${result.stats.translated}/${result.stats.total})`)

  if (result.stats.customMapped > 0) {
    logger.info(`🔧 自定义映射: ${result.stats.customMapped} 个`)
  }

  if (result.untranslated.length > 0) {
    logger.warn(`❌ 缺失翻译: ${result.untranslated.length} 个`)
    logger.warn('缺失的翻译key：')

    result.untranslated.slice(0, 10).forEach((texture) => {
      logger.warn(`  - ${texture.textureName} → ${texture.expectedKey}`)
    })

    if (result.untranslated.length > 10) {
      logger.warn(`  ... 还有 ${result.untranslated.length - 10} 个`)
    }
  }
  else {
    logger.info('✅ 所有材质都有对应的翻译！')
  }
}
