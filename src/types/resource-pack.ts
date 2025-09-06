/**
 * 材质包相关类型定义
 */

export interface ParsedTexture {
  id: string
  namespace: string
  category: 'block' | 'item'
  path: string
  fullPath: string
  data: Uint8Array
  size: number
  addedIn?: string
  removedIn?: string
  sourcePack?: string
}

export interface PackMetadata {
  pack?: {
    pack_format?: number
    description?: string
  }
  author?: string
  version?: string
  [key: string]: unknown
}

export interface ResourcePack {
  id: string
  name: string
  version: string
  metadata: PackMetadata
  textures: ParsedTexture[]
  size: number
  uploadedAt: Date
  isVanilla?: boolean
  icon?: string // base64 encoded pack.png data URL
}

export interface PackInheritance {
  order: string[]
  conflicts: Array<{
    textureId: string
    packs: string[]
  }>
}

export interface UploadProgress {
  [packId: string]: {
    progress: number
    stage: 'parsing' | 'extracting' | 'validating' | 'complete'
    error?: string
  }
}

export interface PackConflict {
  textureId: string
  packs: Array<{
    packId: string
    packName: string
    priority: number
  }>
  resolution: 'use-highest' | 'use-lowest' | 'manual'
}
