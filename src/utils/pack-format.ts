/**
 * Minecraft版本与pack format映射工具
 */

export interface PackFormatMapping {
  [version: string]: number
}

export const PACK_FORMAT_MAP: PackFormatMapping = {
  '1.6.1': 1,
  '1.6.2': 1,
  '1.6.4': 1,
  '1.7.2': 1,
  '1.7.4': 1,
  '1.7.5': 1,
  '1.7.6': 1,
  '1.7.7': 1,
  '1.7.8': 1,
  '1.7.9': 1,
  '1.7.10': 1,
  '1.8': 1,
  '1.8.1': 1,
  '1.8.2': 1,
  '1.8.3': 1,
  '1.8.4': 1,
  '1.8.5': 1,
  '1.8.6': 1,
  '1.8.7': 1,
  '1.8.8': 1,
  '1.8.9': 1,
  '1.9': 2,
  '1.9.1': 2,
  '1.9.2': 2,
  '1.9.3': 2,
  '1.9.4': 2,
  '1.10': 2,
  '1.10.1': 2,
  '1.10.2': 2,
  '1.11': 3,
  '1.11.1': 3,
  '1.11.2': 3,
  '1.12': 3,
  '1.12.1': 3,
  '1.12.2': 3,
  '1.13': 4,
  '1.13.1': 4,
  '1.13.2': 4,
  '1.14': 4,
  '1.14.1': 4,
  '1.14.2': 4,
  '1.14.3': 4,
  '1.14.4': 4,
  '1.15': 5,
  '1.15.1': 5,
  '1.15.2': 5,
  '1.16': 5,
  '1.16.1': 5,
  '1.16.2': 6,
  '1.16.3': 6,
  '1.16.4': 6,
  '1.16.5': 6,
  '1.17': 7,
  '1.17.1': 7,
  '1.18': 8,
  '1.18.1': 8,
  '1.18.2': 9,
  '1.19': 9,
  '1.19.1': 9,
  '1.19.2': 9,
  '1.19.3': 12,
  '1.19.4': 13,
  '1.20': 15,
  '1.20.1': 15,
  '1.20.2': 18,
  '1.20.3': 22,
  '1.20.4': 26,
  '1.20.5': 32,
  '1.20.6': 32,
  '1.21': 34,
  '1.21.1': 34,
  '1.21.2': 41,
  '1.21.3': 41,
  '1.21.4': 46,
}

export const LATEST_PACK_FORMAT = 46

/**
 * 获取Minecraft版本对应的pack format
 */
export function getPackFormatForVersion(version: string): number {
  return PACK_FORMAT_MAP[version] || LATEST_PACK_FORMAT
}

/**
 * 比较两个版本号
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  const maxLength = Math.max(parts1.length, parts2.length)

  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0

    if (part1 < part2)
      return -1
    if (part1 > part2)
      return 1
  }

  return 0
}
