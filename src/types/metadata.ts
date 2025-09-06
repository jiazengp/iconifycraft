/**
 * 材质包元数据自定义类型定义
 */

export interface PackMetadata {
  pack: {
    pack_format: number
    description: string
    supported_formats?: {
      min_inclusive?: number
      max_inclusive?: number
    } | number[] | number | string
    filter?: {
      block?: string[]
    }
  }
  meta?: {
    game_versions?: string[]
    created_by?: string
    creation_date?: string
    version?: string
    homepage?: string
    sources?: string[]
    license?: string
  }
}

export interface CustomMetadata {
  [key: string]: unknown
  name: string
  displayName: string
  description: string
  version?: string
  author?: string
  homepage?: string
  license?: string
  tags: string[]
  category: 'utility' | 'decoration' | 'gameplay' | 'themed' | 'other'
  compatibility: {
    minVersion: string
    maxVersion?: string
    packFormat: number
  }
  features: string[]
  credits: Array<{
    name: string
    role: string
    contribution: string
  }>
  changelog: Array<{
    version: string
    date: string
    changes: string[]
  }>
}

export interface MetadataTemplate {
  id: string
  name: string
  description: string
  category: string
  template: Partial<CustomMetadata>
  isBuiltIn: boolean
}

export interface MetadataExportOptions {
  format: 'mcmeta' | 'json' | 'yaml' | 'toml'
  includeCustomFields: boolean
  minify: boolean
  validateFormat: boolean
}

export interface MetadataValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    severity: 'error' | 'warning'
  }>
  suggestions: string[]
}

export interface FontMetadata {
  providers: Array<{
    type: 'bitmap'
    file: string
    height: number
    ascent: number
    chars: string[]
  }>
}

export interface AtlasMetadata {
  sources: Array<{
    type: 'directory' | 'single'
    source: string
    prefix?: string
  }>
}

export const DEFAULT_PACK_METADATA: PackMetadata = {
  pack: {
    pack_format: 34,
    description: 'Generated IconifyCraft Resource Pack',
  },
}

export const DEFAULT_CUSTOM_METADATA: CustomMetadata = {
  name: 'iconifycraft-icons',
  displayName: 'IconifyCraft Icons',
  description: 'Chat icons generated from IconifyCraft',
  tags: ['icons', 'chat', 'unicode'],
  category: 'utility',
  compatibility: {
    minVersion: '1.20',
    packFormat: 34,
  },
  features: [],
  credits: [],
  changelog: [],
}

export const BUILTIN_TEMPLATES: MetadataTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal Pack',
    description: 'Basic resource pack with minimal metadata',
    category: 'basic',
    template: {
      name: 'minimal-icons',
      displayName: 'Minimal Icons',
      description: 'Simple icon pack',
      version: '1.0.0',
      category: 'utility',
      tags: ['minimal', 'icons'],
    },
    isBuiltIn: true,
  },
  {
    id: 'detailed',
    name: 'Detailed Pack',
    description: 'Resource pack with comprehensive metadata',
    category: 'detailed',
    template: {
      name: 'detailed-icons',
      displayName: 'Detailed Icon Pack',
      description: 'Comprehensive icon pack with detailed metadata and documentation',
      version: '1.0.0',
      category: 'utility',
      tags: ['detailed', 'icons', 'comprehensive'],
      features: ['Unicode chat icons', 'High resolution textures', 'Cross-version compatibility'],
      credits: [
        {
          name: 'Mojang Studios',
          role: 'Original Textures',
          contribution: 'Original Minecraft texture assets',
        },
      ],
    },
    isBuiltIn: true,
  },
  {
    id: 'themed',
    name: 'Themed Pack',
    description: 'Resource pack for themed content',
    category: 'themed',
    template: {
      name: 'themed-icons',
      displayName: 'Themed Icon Pack',
      description: 'Themed icon collection for specific use cases',
      version: '1.0.0',
      category: 'themed',
      tags: ['themed', 'specialized', 'icons'],
    },
    isBuiltIn: true,
  },
]

export const PACK_CATEGORIES = [
  { value: 'utility', label: 'Utility', description: 'Functional and practical packs' },
  { value: 'decoration', label: 'Decoration', description: 'Visual enhancement packs' },
  { value: 'gameplay', label: 'Gameplay', description: 'Gameplay affecting packs' },
  { value: 'themed', label: 'Themed', description: 'Specific theme or style packs' },
  { value: 'other', label: 'Other', description: 'Uncategorized packs' },
] as const

export const COMMON_TAGS = [
  'icons',
  'chat',
  'unicode',
  'utility',
  'decoration',
  'themed',
  'minimal',
  'detailed',
  'comprehensive',
  'high-resolution',
  'retro',
  'modern',
  'fantasy',
  'realistic',
  'cartoon',
  'pixel-art',
]

export const COMMON_FEATURES = [
  'Unicode chat icons',
  'High resolution textures',
  'Cross-version compatibility',
  'Custom font integration',
  'Multilingual support',
  'Namespace organization',
  'Texture variants',
  'Animation support',
  'Color customization',
  'Plugin integration',
]
