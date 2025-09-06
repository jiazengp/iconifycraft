import type { AtlasResult, FontGroup } from '~/types/atlas'
import type { IconItem } from '~/types/icon'
import { escapeUnicodeForJSON } from '~/utils/unicode'

interface FontConfig {
  height: number
  ascent: number
  spaceAdvance: number
}

interface CharacterEntry {
  unicodeChar?: string
  unicode?: string
}

interface AtlasGroup {
  iconData: readonly IconItem[]
  layout: string
  fontName: string
}

/**
 * 字体文件生成器
 */
export class FontFileGenerator {
  private static readonly DEFAULT_FONT_CONFIG: FontConfig = {
    height: 8,
    ascent: 7,
    spaceAdvance: 2,
  }

  /**
   * 生成单个字体文件内容
   */
  generateSingle(
    atlasResult: AtlasResult,
    namespace: string,
    fontFileName: string,
  ): string {
    const sortedEntries = [...Object.values(atlasResult.atlasDict)]
      .sort((a, b) => a.index - b.index)

    const columnsPerRow = this.getColumnsPerRow(
      atlasResult.atlasGroups?.[0]?.layout,
      sortedEntries.length,
    )

    const charRows = this.extractCharactersFromEntries(sortedEntries, columnsPerRow)
    const fontData = this.createFontData(namespace, fontFileName, charRows)

    return escapeUnicodeForJSON(JSON.stringify(fontData, null, 2))
  }

  /**
   * 基于FontGroups生成字体文件
   */
  generateFromFontGroups(
    fontGroups: FontGroup[],
    namespace: string,
    textureSize: number,
  ): Array<{ fontName: string, content: string }> {
    return fontGroups.map(fontGroup =>
      this.generateFontFromGroup(fontGroup, namespace, textureSize),
    )
  }

  /**
   * 生成多个字体文件内容（向后兼容）
   */
  generateMultiple(
    atlasGroups: NonNullable<AtlasResult['atlasGroups']>,
    namespace: string,
    textureSize: number,
  ): Array<{ fontName: string, content: string }> {
    return [...atlasGroups].map(group => ({
      fontName: group.fontName,
      content: this.generateSingleAtlasFont(group, namespace, textureSize),
    }))
  }

  private generateFontFromGroup(
    fontGroup: FontGroup,
    namespace: string,
    textureSize: number,
  ): { fontName: string, content: string } {
    const bitmapProviders = [...fontGroup.atlasGroups].map((atlasGroup, index) =>
      this.createBitmapProvider(atlasGroup, namespace, fontGroup.fontName, index, textureSize),
    )

    const fontData = {
      providers: [
        this.createSpaceProvider(),
        ...bitmapProviders,
      ],
    }

    return {
      fontName: fontGroup.fontName,
      content: escapeUnicodeForJSON(JSON.stringify(fontData, null, 2)),
    }
  }

  private generateSingleAtlasFont(
    group: AtlasGroup,
    namespace: string,
    textureSize: number,
  ): string {
    const charRows = this.extractCharactersFromGroup(group, textureSize)
    const fontData = this.createFontData(namespace, group.fontName, charRows)
    return escapeUnicodeForJSON(JSON.stringify(fontData, null, 2))
  }

  private createBitmapProvider(
    atlasGroup: AtlasGroup,
    namespace: string,
    fontName: string,
    index: number,
    textureSize: number,
  ) {
    const charRows = this.extractCharactersFromGroup(atlasGroup, textureSize)
    const atlasFileName = index === 0 ? fontName : `${fontName}_${index + 1}`
    const config = FontFileGenerator.DEFAULT_FONT_CONFIG

    return {
      type: 'bitmap' as const,
      file: `${namespace}:font/${atlasFileName}.png`,
      height: config.height,
      ascent: config.ascent,
      chars: charRows,
    }
  }

  private createFontData(namespace: string, fileName: string, charRows: string[]) {
    const config = FontFileGenerator.DEFAULT_FONT_CONFIG

    return {
      providers: [
        this.createSpaceProvider(),
        {
          type: 'bitmap',
          file: `${namespace}:font/${fileName}.png`,
          height: config.height,
          ascent: config.ascent,
          chars: charRows,
        },
      ],
    }
  }

  private createSpaceProvider() {
    return {
      type: 'space' as const,
      advances: {
        ' ': FontFileGenerator.DEFAULT_FONT_CONFIG.spaceAdvance,
      },
    }
  }

  private extractCharactersFromEntries(
    entries: CharacterEntry[],
    columnsPerRow: number,
  ): string[] {
    const allChars = entries
      .map(entry => this.getCharacterFromEntry(entry))
      .join('')

    return this.splitIntoRows(allChars, columnsPerRow)
  }

  private extractCharactersFromGroup(
    group: AtlasGroup,
    textureSize: number,
  ): string[] {
    const columnsPerRow = this.getColumnsPerRow(group.layout)
    const sortedIcons = this.sortIconsByPosition([...group.iconData], textureSize, columnsPerRow)
    const allChars = sortedIcons.map(icon => icon.unicodeChar).join('')

    return this.splitIntoRows(allChars, columnsPerRow, true)
  }

  private getCharacterFromEntry(entry: CharacterEntry): string {
    if (entry.unicodeChar) {
      return entry.unicodeChar
    }
    if (entry.unicode) {
      const unicodeHex = entry.unicode.replace(/^U\+/, '')
      const unicodeValue = Number.parseInt(unicodeHex, 16)
      return String.fromCharCode(unicodeValue)
    }
    return ''
  }

  private sortIconsByPosition(
    icons: IconItem[],
    textureSize: number,
    columnsPerRow: number,
  ): IconItem[] {
    return icons.sort((a, b) => {
      const getPosition = (icon: IconItem) => {
        const row = Math.floor(icon.y / textureSize)
        const col = Math.floor(icon.x / textureSize)
        return row * columnsPerRow + col
      }
      return getPosition(a) - getPosition(b)
    })
  }

  private splitIntoRows(
    chars: string,
    columnsPerRow: number,
    padLastRow = false,
  ): string[] {
    const charRows: string[] = []

    for (let i = 0; i < chars.length; i += columnsPerRow) {
      let rowChars = chars.substring(i, i + columnsPerRow)

      if (rowChars.length > 0) {
        if (padLastRow && rowChars.length < columnsPerRow && i + columnsPerRow >= chars.length) {
          const paddingCount = columnsPerRow - rowChars.length
          rowChars += ' '.repeat(paddingCount)
        }
        charRows.push(rowChars)
      }
    }

    return charRows
  }

  private getColumnsPerRow(layout?: string, fallbackLength?: number): number {
    if (layout) {
      const match = layout.match(/(\d+)x(\d+)/)
      if (match) {
        return Number.parseInt(match[1])
      }
    }

    return fallbackLength ? Math.ceil(Math.sqrt(fallbackLength)) : 16
  }
}
