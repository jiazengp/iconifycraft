/**
 * Unicode处理工具函数
 */

/**
 * Unicode私有区域起始点
 */
export const PRIVATE_USE_AREA_START = 0xE000
export const PRIVATE_USE_AREA_END = 0xF8FF

/**
 * 生成Unicode字符
 */
export function generateUnicodeChar(codePoint: number): string {
  return String.fromCharCode(codePoint)
}

/**
 * 格式化Unicode编码点
 */
export function formatUnicodePoint(codePoint: number): string {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
}

/**
 * 解析Unicode字符串为编码点
 */
export function parseUnicodeString(unicode: string): number {
  const match = unicode.match(/^U\+([0-9A-Fa-f]{4,6})$/)
  if (match) {
    return Number.parseInt(match[1], 16)
  }

  // 直接从字符获取
  if (unicode.length === 1) {
    return unicode.charCodeAt(0)
  }

  throw new Error(`Invalid Unicode string: ${unicode}`)
}

/**
 * 生成Unicode范围
 */
export function generateUnicodeRange(
  start: number,
  count: number,
): Array<{ codePoint: number, char: string, unicode: string }> {
  const result = []

  for (let i = 0; i < count; i++) {
    const codePoint = start + i
    result.push({
      codePoint,
      char: generateUnicodeChar(codePoint),
      unicode: formatUnicodePoint(codePoint),
    })
  }

  return result
}

/**
 * 验证Unicode编码点是否在私有区域
 */
export function isPrivateUseArea(codePoint: number): boolean {
  return codePoint >= PRIVATE_USE_AREA_START && codePoint <= PRIVATE_USE_AREA_END
}

/**
 * 转义Unicode字符为JSON安全格式
 */
export function escapeUnicodeForJSON(text: string): string {
  return text.replace(/[\uE000-\uF8FF]/g, (match) => {
    return `\\u${match.charCodeAt(0).toString(16).padStart(4, '0')}`
  })
}

/**
 * 计算Unicode范围的结束点
 */
export function calculateUnicodeEnd(start: number, count: number): string {
  return formatUnicodePoint(start + count - 1).replace('U+', '')
}

/**
 * 生成分组Unicode映射
 */
export function generateGroupedUnicodeMapping(
  groups: Array<{ name: string, count: number }>,
  startCodePoint = PRIVATE_USE_AREA_START,
): Array<{
  groupName: string
  startCodePoint: number
  endCodePoint: number
  chars: Array<{ codePoint: number, char: string, unicode: string }>
}> {
  const result = []
  let currentStart = startCodePoint

  for (const group of groups) {
    const chars = generateUnicodeRange(currentStart, group.count)

    result.push({
      groupName: group.name,
      startCodePoint: currentStart,
      endCodePoint: currentStart + group.count - 1,
      chars,
    })

    currentStart += group.count
  }

  return result
}

/**
 * 验证Unicode字符串格式
 */
export function isValidUnicodeString(unicode: string): boolean {
  return /^U\+[0-9A-Fa-f]{4,6}$/.test(unicode)
}
