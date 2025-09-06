/**
 * 图集生成相关类型定义
 */

import type { IconItem } from './icon'

export interface AtlasOptions {
  size: 512 | 1024 | 2048
  tileSize: 8 | 16 | 32
  padding: number
  backgroundColor: string
  compression: 'none' | 'lossless' | 'lossy'
  quality: number
}

export interface TextureInfo {
  index: number
  x: number
  y: number
  code: string
  desc: string
  namespace: string
  category: 'block' | 'item'
  name: string
  translationKey: string
  unicode: string
  unicodeChar?: string // 添加直接的Unicode字符
  atlasIndex?: number
  addedIn?: string
}

export interface AtlasResult {
  atlasBlob: Blob
  atlasBlobs?: readonly Blob[] // 多图集支持
  atlasGroups?: readonly AtlasGroup[] // 图集组信息
  fontGroups?: readonly FontGroup[] // 字体分组信息
  atlasDict: Record<string, TextureInfo>
  metadata: AtlasMetadata
}

export interface AtlasGroup {
  atlasImage: string
  iconData: readonly IconItem[]
  layout: string
  size: number
  fontName: string
  bitmapIndex?: number // 在单字体文件中的bitmap索引
}

// IconData 已合并到 IconItem，请使用 IconItem 类型

export interface AtlasMetadata {
  totalTextures: number
  atlasSize: number
  tileSize: number
  generatedAt: Date
  unicodeRange: {
    start: string
    end: string
  }
  statistics: {
    byNamespace: Record<string, number>
    byCategory: Record<string, number>
    byPack?: Record<string, { used: number, overridden: number, percentage: number }>
  }
}

export interface FontProvider {
  type: 'bitmap'
  file: string
  height: number
  ascent: number
  chars: string[]
}

export interface FontGroup {
  fontName: string
  atlasGroups: readonly AtlasGroup[]
  unicodeStart: number
  unicodeEnd: number
}

export interface FontConfig {
  providers: FontProvider[]
}

export interface ProcessingOptions {
  recolor?: [number, number, number]
  resize?: {
    width: number
    height: number
    method: 'nearest' | 'bilinear' | 'bicubic'
  }
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  filters?: Array<{
    type: 'brightness' | 'contrast' | 'saturation' | 'hue'
    value: number
  }>
}

export interface RecolorConfig {
  [textureId: string]: [number, number, number]
}

// 预设重着色配置 (基于原Python脚本)
export const DEFAULT_RECOLOR_CONFIG: RecolorConfig = {
  'minecraft:block/water_flow': [63, 118, 228],
  'minecraft:block/water_overlay': [63, 118, 228],
  'minecraft:block/water_still': [63, 118, 228],
  'minecraft:block/birch_leaves': [128, 167, 55],
  'minecraft:block/spruce_leaves': [97, 153, 97],
  'minecraft:block/lily_pad': [32, 128, 48],
  'minecraft:block/grass_block_top': [121, 192, 90],
  'minecraft:block/grass_block_side_overlay': [121, 192, 90],
  'minecraft:block/grass': [121, 192, 90],
  'minecraft:block/fern': [121, 192, 90],
  'minecraft:block/tall_grass_bottom': [121, 192, 90],
  'minecraft:block/tall_grass_top': [121, 192, 90],
  'minecraft:block/large_fern_bottom': [121, 192, 90],
  'minecraft:block/large_fern_top': [121, 192, 90],
  'minecraft:block/sugar_cane': [121, 192, 90],
  'minecraft:block/oak_leaves': [119, 171, 47],
  'minecraft:block/acacia_leaves': [119, 171, 47],
  'minecraft:block/jungle_leaves': [119, 171, 47],
  'minecraft:block/dark_oak_leaves': [119, 171, 47],
  'minecraft:block/vine': [119, 171, 47],
}
