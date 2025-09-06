import type { ResourcePack } from './resource-pack'

export interface SavedInstance {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  lastOpenedAt?: Date
  minecraftVersion: string
  namespace: string
  resourcePacks: ResourcePack[]
  exportSettings?: Record<string, unknown>
  metadata: {
    packCount: number
    hasThumbnail: boolean
  }
  thumbnail?: Blob
  icon?: Uint8Array
}

export interface InstanceStats {
  totalInstances: number
  totalSize: number
  oldestInstance?: Date
  newestInstance?: Date
}

export interface CreateInstanceData extends Omit<SavedInstance, 'id' | 'createdAt' | 'updatedAt'> {}
