import type { TextureInfo } from '~/types/atlas'
import type { IconItem, IconType } from '~/types/icon'
import type { ParsedTexture } from '~/types/resource-pack'
import { generateTranslationKey } from '~/data/texture-translation-mapping'

export class AtlasUnicodeGenerator {
  private currentUnicodeStart = 0xE000
  private maxPrivateUseArea = 0xF8FF

  /**
   * 生成Unicode字符
   */
  generateUnicode(index: number, globalOffset: number = 0): string {
    const code = this.currentUnicodeStart + globalOffset + index
    return code.toString(16).padStart(4, '0')
  }

  /**
   * 重置Unicode起始位置
   */
  resetUnicodeStart(start: number = 0xE000): void {
    this.currentUnicodeStart = start
  }

  /**
   * 检查Unicode是否超出私用区范围
   */
  isUnicodeOverflow(totalTextures: number, globalOffset: number = 0): boolean {
    return (this.currentUnicodeStart + globalOffset + totalTextures - 1) > this.maxPrivateUseArea
  }

  /**
   * 生成翻译Key（已弃用，使用外部优化版本）
   * @deprecated 使用 generateTranslationKey from ~/data/texture-translation-mapping
   */
  generateTranslationKey(texture: ParsedTexture): string {
    const name = texture.path.split('/').pop()?.replace('.png', '') || texture.id
    return generateTranslationKey(name, texture.category as 'item' | 'block', texture.namespace)
  }

  /**
   * 生成图标数据
   */
  generateIconData(
    texture: ParsedTexture,
    index: number,
    x: number,
    y: number,
    atlasIndex: number,
    globalOffset: number = 0,
    isError: boolean = false,
    userNamespace?: string,
  ): IconItem {
    const unicodeValue = this.currentUnicodeStart + globalOffset + index
    const unicodeString = `U+${unicodeValue.toString(16).toUpperCase().padStart(4, '0')}`
    const unicodeChar = String.fromCharCode(unicodeValue)
    const name = texture.path.split('/').pop()?.replace('.png', '') || texture.id

    // 使用用户设置的命名空间，优先于材质的命名空间
    const effectiveNamespace = userNamespace || texture.namespace

    // 根据路径确定 iconType（在数据创建的最早阶段就处理好）
    const iconType: IconType = this.determineIconType(texture)

    // 使用优化的翻译key生成器，避免重复
    const translationKey = generateTranslationKey(name, iconType, effectiveNamespace)

    return {
      id: texture.id,
      name: isError ? `ERROR: ${name}` : name,
      unicode: unicodeString,
      unicodeChar,
      translationKey,
      category: texture.category,
      iconType,
      namespace: effectiveNamespace,
      x,
      y,
      sourcePack: texture.sourcePack,
      fullPath: texture.fullPath,
      atlasIndex,
    }
  }

  /**
   * 根据纹理信息确定图标类型
   */
  private determineIconType(texture: ParsedTexture): IconType {
    // 优先使用路径判断
    if (texture.fullPath?.includes('/textures/item/')) {
      return 'item'
    }
    if (texture.fullPath?.includes('/textures/block/')) {
      return 'block'
    }

    // 其次使用category字段
    if (texture.category === 'item' || texture.category === 'block') {
      return texture.category
    }

    // 默认回退到item
    return 'item'
  }

  /**
   * 生成图集字典条目
   */
  generateAtlasDictEntry(
    texture: ParsedTexture,
    index: number,
    x: number,
    y: number,
  ): TextureInfo {
    const unicode = this.generateUnicode(index)
    const translationKey = this.generateTranslationKey(texture)

    return {
      index,
      x,
      y,
      code: unicode,
      desc: `${texture.category}\\${texture.path}`,
      namespace: texture.namespace,
      category: texture.category,
      name: texture.path,
      translationKey,
      unicode,
      addedIn: texture.addedIn,
    }
  }
}
