/**
 * Minecraft版本和材质相关类型定义
 */

export interface MinecraftVersion {
  id: string
  name: string
  releaseDate: string
  protocolVersion: number
  dataVersion: number
  packFormat: number
  isSnapshot?: boolean
  textureChanges: TextureChange[]
}

export interface TextureChange {
  texture: string
  changeType: 'added' | 'removed' | 'renamed' | 'modified'
  fromVersion?: string
  toVersion?: string
  oldPath?: string
  newPath?: string
  description?: string
}

export interface TextureCompatibility {
  isCompatible: boolean
  reason?: string
  addedIn?: string
  removedIn?: string
  alternatives?: string[]
}

export interface VersionRange {
  min: string
  max?: string
}

export interface TextureAvailability {
  textureId: string
  addedIn?: string
  removedIn?: string
  renamedFrom?: string
  renamedTo?: string
}

// MC版本数据常量 - 只包含1.20-1.20.6和1.21-1.21.8版本
export const MC_VERSIONS: MinecraftVersion[] = [
  // 1.21系列 (1.21 - 1.21.8)
  {
    id: '1.21.8',
    name: 'Minecraft 1.21.8',
    releaseDate: '2024-12-03',
    protocolVersion: 771,
    dataVersion: 4082,
    packFormat: 48,
    textureChanges: [],
  },
  {
    id: '1.21.7',
    name: 'Minecraft 1.21.7',
    releaseDate: '2024-11-21',
    protocolVersion: 770,
    dataVersion: 4081,
    packFormat: 48,
    textureChanges: [],
  },
  {
    id: '1.21.6',
    name: 'Minecraft 1.21.6',
    releaseDate: '2024-11-13',
    protocolVersion: 769,
    dataVersion: 4080,
    packFormat: 48,
    textureChanges: [],
  },
  {
    id: '1.21.5',
    name: 'Minecraft 1.21.5',
    releaseDate: '2024-11-07',
    protocolVersion: 768,
    dataVersion: 4079,
    packFormat: 48,
    textureChanges: [],
  },
  {
    id: '1.21.4',
    name: 'Minecraft 1.21.4',
    releaseDate: '2024-10-23',
    protocolVersion: 768,
    dataVersion: 4078,
    packFormat: 48,
    textureChanges: [],
  },
  {
    id: '1.21.3',
    name: 'Minecraft 1.21.3',
    releaseDate: '2024-10-09',
    protocolVersion: 768,
    dataVersion: 4077,
    packFormat: 48,
    textureChanges: [],
  },
  {
    id: '1.21.2',
    name: 'Minecraft 1.21.2',
    releaseDate: '2024-09-18',
    protocolVersion: 768,
    dataVersion: 4076,
    packFormat: 48,
    textureChanges: [],
  },
  {
    id: '1.21.1',
    name: 'Minecraft 1.21.1',
    releaseDate: '2024-08-08',
    protocolVersion: 767,
    dataVersion: 3955,
    packFormat: 34,
    textureChanges: [],
  },
  {
    id: '1.21',
    name: 'Minecraft 1.21',
    releaseDate: '2024-06-13',
    protocolVersion: 767,
    dataVersion: 3953,
    packFormat: 34,
    textureChanges: [
      {
        texture: 'minecraft:item/mace',
        changeType: 'added',
        fromVersion: '1.21',
        description: 'Added mace weapon',
      },
      {
        texture: 'minecraft:block/trial_spawner',
        changeType: 'added',
        fromVersion: '1.21',
        description: 'Added trial spawner block',
      },
    ],
  },
  // 1.20系列 (1.20 - 1.20.6)
  {
    id: '1.20.6',
    name: 'Minecraft 1.20.6',
    releaseDate: '2024-04-29',
    protocolVersion: 766,
    dataVersion: 3839,
    packFormat: 32,
    textureChanges: [],
  },
  {
    id: '1.20.5',
    name: 'Minecraft 1.20.5',
    releaseDate: '2024-04-23',
    protocolVersion: 766,
    dataVersion: 3837,
    packFormat: 32,
    textureChanges: [],
  },
  {
    id: '1.20.4',
    name: 'Minecraft 1.20.4',
    releaseDate: '2023-12-07',
    protocolVersion: 765,
    dataVersion: 3700,
    packFormat: 26,
    textureChanges: [],
  },
  {
    id: '1.20.3',
    name: 'Minecraft 1.20.3',
    releaseDate: '2023-12-05',
    protocolVersion: 765,
    dataVersion: 3698,
    packFormat: 26,
    textureChanges: [],
  },
  {
    id: '1.20.2',
    name: 'Minecraft 1.20.2',
    releaseDate: '2023-09-21',
    protocolVersion: 764,
    dataVersion: 3578,
    packFormat: 18,
    textureChanges: [],
  },
  {
    id: '1.20.1',
    name: 'Minecraft 1.20.1',
    releaseDate: '2023-06-12',
    protocolVersion: 763,
    dataVersion: 3465,
    packFormat: 15,
    textureChanges: [],
  },
  {
    id: '1.20',
    name: 'Minecraft 1.20',
    releaseDate: '2023-06-07',
    protocolVersion: 763,
    dataVersion: 3463,
    packFormat: 15,
    textureChanges: [],
  },
]
