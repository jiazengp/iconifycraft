import type { MaybeRefOrGetter } from '@vueuse/core'
import type { Ref } from 'vue'
import type { AtlasGroup, AtlasResult, FontGroup } from '~/types/atlas'
import type { IconItem } from '~/types/icon'
import type { ParsedTexture } from '~/types/resource-pack'
import { computed, ref, toValue } from 'vue'
import { resetTranslationKeyCache } from '~/data/texture-translation-mapping'
import { AtlasCanvasRenderer } from '~/utils/atlas-canvas-renderer'
import { AtlasTextureProcessor } from '~/utils/atlas-texture-processor'
import { AtlasUnicodeGenerator } from '~/utils/atlas-unicode'
import { BrowserCompatibilityChecker } from '~/utils/browser-compatibility'
import { logger } from '~/utils/logger'
import { useAtlasProgress } from './useAtlasProgress'
import { useNotification } from './useNotification'

/**
 * 图集生成器组合函数
 * @param textures - 材质列表，可以是ref、computed、getter函数或直接的数组
 * @param userNamespace - 用户命名空间ref
 * @returns 图集生成相关的状态和方法
 *
 * @example
 * ```typescript
 * // 支持多种用法
 * const { generateAtlas, atlasGenerated, iconList } = useAtlasGenerator(myTextures, namespace)          // 直接传值
 * const { generateAtlas, atlasGenerated, iconList } = useAtlasGenerator(ref(textureArray), namespace)   // ref
 * const { generateAtlas, atlasGenerated, iconList } = useAtlasGenerator(computed(() => array), namespace) // computed
 * const { generateAtlas, atlasGenerated, iconList } = useAtlasGenerator(() => myTextures.value, namespace) // getter函数
 * await generateAtlas()
 * ```
 */
export function useAtlasGenerator(textures?: MaybeRefOrGetter<ParsedTexture[]>, userNamespace?: Ref<string>) {
  const { showSuccess, showError, showInfo } = useNotification()
  const { t } = useI18n()
  const progressManager = useAtlasProgress()
  const canvasRenderer = new AtlasCanvasRenderer(16)
  const unicodeGenerator = new AtlasUnicodeGenerator()

  // 响应式状态
  const atlasGenerated = ref(false)
  const atlasImage = ref('')
  const atlasSize = ref(256)
  const textureSize = ref(16)
  const totalTextures = ref(0)
  const unicodeStart = ref('E000')
  const unicodeEnd = ref('E000')
  const atlasLayout = ref('16x16')
  const iconList = ref<IconItem[]>([])
  const atlasResult = ref<AtlasResult | null>(null)
  const packStats = ref<Record<string, { used: number, overridden: number }> | null>(null)

  // 计算属性
  const canGenerate = computed(() => {
    const textureList = textures ? toValue(textures) : []
    return textureList.length > 0 && !progressManager.isGenerating.value
  })

  const atlasInfo = computed(() => ({
    size: atlasSize.value,
    textureSize: textureSize.value,
    totalTextures: totalTextures.value,
    unicodeRange: {
      start: unicodeStart.value,
      end: unicodeEnd.value,
    },
    layout: atlasLayout.value,
  }))

  // 辅助函数 - 生成单个图集
  const generateSingleAtlas = async (textures: ParsedTexture[], atlasIndex: number, globalOffset: number = 0): Promise<AtlasGroup> => {
    const { texturesPerRow, totalRows, atlasSize } = AtlasTextureProcessor.calculateLayout(textures.length)
    const canvas = canvasRenderer.createCanvas(texturesPerRow, totalRows)
    const ctx = canvas.getContext('2d')!
    const iconData: IconItem[] = []

    let errorCount = 0
    const errors: string[] = []

    for (let i = 0; i < textures.length; i++) {
      const texture = textures[i]
      const row = Math.floor(i / texturesPerRow)
      const col = i % texturesPerRow
      const x = col * textureSize.value
      const y = row * textureSize.value

      try {
        await canvasRenderer.renderTexture(ctx, texture, x, y, {
          onError: (errorMsg, textureId) => {
            errorCount++
            errors.push(`${textureId}: ${errorMsg}`)
          },
          timeout: 3000,
        })
        const iconInfo = unicodeGenerator.generateIconData(texture, i, x, y, atlasIndex, globalOffset, false, userNamespace?.value)
        iconData.push(iconInfo)
      }
      catch {
        canvasRenderer.drawErrorPlaceholder(ctx, x, y)
        const iconInfo = unicodeGenerator.generateIconData(texture, i, x, y, atlasIndex, globalOffset, true, userNamespace?.value)
        iconData.push(iconInfo)
      }
    }

    if (errorCount > 0) {
      showError(t('atlas.errors.textureLoadFailed'), {
        message: t('atlas.errors.errorDetails', {
          count: errorCount,
          total: textures.length,
          details: errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n...${errors.length - 3} more` : ''),
        }),
      })
    }

    const fontName = atlasIndex === 0 ? 'default' : `default_${atlasIndex + 1}`

    return {
      atlasImage: canvas.toDataURL('image/png'),
      iconData,
      layout: `${texturesPerRow}x${totalRows}`,
      size: atlasSize,
      fontName,
    }
  }

  // 辅助函数 - 生成多个图集和字体分组
  const generateAtlasesWithFontGrouping = async (
    textureGroups: ParsedTexture[][],
    progressManager: {
      isGenerating: { value: boolean }
      setProgress: (progress: number) => void
      startGeneration: (atlasCount: number, textureCount: number) => void
      updateProgress: (currentAtlas: number, totalIcons: number) => void
      finishGeneration: () => void
    },
  ): Promise<{ atlasGroups: AtlasGroup[], fontGroups: FontGroup[], allIconData: IconItem[] }> => {
    const atlasGroups: AtlasGroup[] = []
    const fontGroups: FontGroup[] = []
    const allIconData: IconItem[] = []

    let currentGlobalOffset = 0
    let currentFontIndex = 0
    let currentFontAtlasGroups: AtlasGroup[] = []
    let currentFontUnicodeStart = 0xE000

    for (let atlasIndex = 0; atlasIndex < textureGroups.length; atlasIndex++) {
      const atlasTextures = textureGroups[atlasIndex]

      // 检查当前字体是否还能容纳更多Atlas
      if (unicodeGenerator.isUnicodeOverflow(atlasTextures.length, currentGlobalOffset)) {
        // 创建当前FontGroup并开始新字体
        if (currentFontAtlasGroups.length > 0) {
          fontGroups.push({
            fontName: currentFontIndex === 0 ? 'default' : `default_${currentFontIndex + 1}`,
            atlasGroups: [...currentFontAtlasGroups],
            unicodeStart: currentFontUnicodeStart,
            unicodeEnd: 0xE000 + currentGlobalOffset - 1,
          })
        }

        // 重置为新字体
        currentFontIndex++
        currentFontAtlasGroups = []
        currentGlobalOffset = 0
        currentFontUnicodeStart = 0xE000
        unicodeGenerator.resetUnicodeStart(0xE000)
      }

      const group = await generateSingleAtlas(atlasTextures, atlasIndex, currentGlobalOffset)

      atlasGroups.push(group)
      currentFontAtlasGroups.push(group)
      allIconData.push(...group.iconData)

      currentGlobalOffset += atlasTextures.length
      progressManager.updateProgress(atlasIndex + 1, allIconData.length)
    }

    // 添加最后一个FontGroup
    if (currentFontAtlasGroups.length > 0) {
      fontGroups.push({
        fontName: currentFontIndex === 0 ? 'default' : `default_${currentFontIndex + 1}`,
        atlasGroups: [...currentFontAtlasGroups],
        unicodeStart: currentFontUnicodeStart,
        unicodeEnd: 0xE000 + currentGlobalOffset - 1,
      })
    }

    return { atlasGroups, fontGroups, allIconData }
  }

  // 辅助函数 - 更新图集状态
  const updateAtlasState = (atlasGroups: AtlasGroup[], allIconData: IconItem[], textureCount: number) => {
    atlasImage.value = atlasGroups[0].atlasImage
    iconList.value = allIconData
    totalTextures.value = textureCount

    // 更新Unicode范围
    unicodeStart.value = 'E000'
    unicodeEnd.value = (0xE000 + textureCount - 1).toString(16).toUpperCase().padStart(4, '0')

    atlasSize.value = 256
    atlasLayout.value = `${atlasGroups.length} atlases`
    atlasGenerated.value = true
  }

  // 辅助函数 - 创建图集结果
  const createAtlasResult = async (
    atlasGroups: AtlasGroup[],
    fontGroups: FontGroup[],
    allIconData: IconItem[],
    mergedTextures: ParsedTexture[],
  ): Promise<AtlasResult> => {
    const atlasBlobs: Blob[] = []
    for (const group of atlasGroups) {
      const blob = await fetch(group.atlasImage).then(r => r.blob())
      atlasBlobs.push(blob)
    }

    return {
      atlasBlob: atlasBlobs[0],
      atlasBlobs,
      atlasGroups,
      fontGroups,
      atlasDict: Object.fromEntries(
        allIconData.map((icon, index) => [icon.id, {
          index,
          x: icon.x,
          y: icon.y,
          code: icon.id,
          desc: icon.name,
          namespace: icon.namespace,
          category: icon.category as 'block' | 'item',
          name: icon.name,
          translationKey: icon.translationKey,
          unicode: icon.unicode,
          unicodeChar: icon.unicodeChar,
          atlasIndex: icon.atlasIndex,
          addedIn: undefined,
        }]),
      ),
      metadata: {
        totalTextures: mergedTextures.length,
        atlasSize: atlasSize.value,
        tileSize: textureSize.value,
        generatedAt: new Date(),
        unicodeRange: {
          start: unicodeStart.value,
          end: unicodeEnd.value,
        },
        statistics: AtlasTextureProcessor.generateStatistics(mergedTextures, packStats.value || undefined),
      },
    }
  }

  const generateAtlas = async (): Promise<AtlasResult | null> => {
    if (!canGenerate.value)
      return null

    // 重置翻译key缓存，避免重复绑定
    resetTranslationKeyCache()

    const compatibilityIssues = BrowserCompatibilityChecker.checkIssues()
    const browserInfo = BrowserCompatibilityChecker.getBrowserInfo()

    const errors = compatibilityIssues.filter(issue => issue.type === 'error')
    const warnings = compatibilityIssues.filter(issue => issue.type === 'warning')

    if (errors.length > 0) {
      showError(t('atlas.errors.browserNotSupported'), {
        message: `Browser: ${browserInfo}\n${errors.map(e => e.message).join('\n')}`,
      })
      return null
    }

    if (warnings.length > 0) {
      showInfo(t('atlas.warnings.browserCompatibility'), {
        message: `Browser: ${browserInfo}\n${warnings.map(w => w.message).join('\n')}`,
      })
    }

    try {
      const allTextures = textures ? toValue(textures) : []

      if (allTextures.length === 0) {
        throw new Error('atlas.errors.noTextures')
      }

      // 步骤1: 合并材质
      progressManager.setProgress(0.15)
      const { merged: mergedTextures, conflicts, packStats: mergePackStats }
        = AtlasTextureProcessor.mergeTextures(allTextures)

      totalTextures.value = mergedTextures.length
      packStats.value = mergePackStats

      logger.info('📊 Pack Statistics:', mergePackStats)
      logger.debug('🔄 Conflicts:', conflicts)

      if (conflicts.length > 0) {
        showInfo(t('atlas.info.texturesMerged'), {
          message: t('atlas.info.conflictsDetails', { conflicts: conflicts.length, total: mergedTextures.length }),
        })
      }

      // 步骤2: 分组和布局计算
      const textureGroups = AtlasTextureProcessor.splitIntoAtlasGroups(mergedTextures)
      const atlasCount = textureGroups.length

      showInfo(t('atlas.info.atlasCount'), {
        message: t('atlas.info.willGenerate', { count: atlasCount, textures: mergedTextures.length }),
      })

      progressManager.startGeneration(atlasCount, mergedTextures.length)

      // 步骤3: 生成多个图集和字体分组
      const { atlasGroups, fontGroups, allIconData } = await generateAtlasesWithFontGrouping(textureGroups, progressManager)

      // 步骤4: 设置结果状态
      updateAtlasState(atlasGroups, allIconData, mergedTextures.length)

      showSuccess(t('atlas.success.generated'), {
        message: t('atlas.success.details', { atlases: atlasGroups.length, icons: allIconData.length }),
      })

      // 步骤5: 创建最终结果
      const result = await createAtlasResult(atlasGroups, fontGroups, allIconData, mergedTextures)
      atlasResult.value = result

      return result
    }
    catch (error) {
      showError('atlas.errors.generationFailed', {
        message: error instanceof Error ? error.message : 'atlas.errors.unknown',
      })
      return null
    }
    finally {
      progressManager.finishGeneration()
    }
  }

  const clearAtlas = () => {
    atlasGenerated.value = false
    atlasImage.value = ''
    iconList.value = []
    totalTextures.value = 0
    atlasResult.value = null
    packStats.value = null
  }

  return {
    // 状态
    atlasGenerated: readonly(atlasGenerated),
    atlasImage: readonly(atlasImage),
    atlasSize: readonly(atlasSize),
    textureSize: readonly(textureSize),
    totalTextures: readonly(totalTextures),
    unicodeStart: readonly(unicodeStart),
    unicodeEnd: readonly(unicodeEnd),
    atlasLayout: readonly(atlasLayout),
    isGenerating: readonly(progressManager.isGenerating),
    iconList: readonly(iconList),
    atlasResult: readonly(atlasResult),
    packStats: readonly(packStats),

    // 计算属性
    canGenerate,
    atlasInfo,

    // 方法
    generateAtlas,
    clearAtlas,

  }
}
