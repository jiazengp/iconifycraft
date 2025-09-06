import type { CreateInstanceData, InstanceStats, SavedInstance } from '~/types/instance'
import { deserializeFromStorage, serializeForStorage } from '~/utils/serialization'
import { db } from './database/InstanceDatabase'

export class InstanceStorageService {
  private static instance: InstanceStorageService

  static getInstance(): InstanceStorageService {
    if (!InstanceStorageService.instance) {
      InstanceStorageService.instance = new InstanceStorageService()
    }
    return InstanceStorageService.instance
  }

  async saveInstance(instance: CreateInstanceData): Promise<string> {
    const id = crypto.randomUUID()
    const serializedData = serializeForStorage(instance)

    const instanceData: SavedInstance = {
      ...serializedData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.instances.add(instanceData)
    return id
  }

  async getInstance(id: string): Promise<SavedInstance | undefined> {
    const instance = await db.instances.get(id)
    return instance ? deserializeFromStorage(instance) : undefined
  }

  async getAllInstances(): Promise<SavedInstance[]> {
    const instances = await db.instances.orderBy('updatedAt').reverse().toArray()
    return instances.map(deserializeFromStorage)
  }

  async getInstancesPaginated(limit = 20, offset = 0): Promise<SavedInstance[]> {
    const instances = await db.instances
      .orderBy('updatedAt')
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray()

    return instances.map(deserializeFromStorage)
  }

  async searchInstances(query: string): Promise<SavedInstance[]> {
    const lowerQuery = query.toLowerCase()
    const instances = await db.instances
      .filter(instance =>
        instance.name.toLowerCase().includes(lowerQuery)
        || instance.minecraftVersion.toLowerCase().includes(lowerQuery),
      )
      .toArray()

    return instances.map(deserializeFromStorage)
  }

  async updateInstance(id: string, updates: Partial<Omit<SavedInstance, 'id' | 'createdAt'>>): Promise<void> {
    const serializedUpdates = serializeForStorage(updates)
    await db.instances.update(id, {
      ...serializedUpdates,
      updatedAt: new Date(),
    })
  }

  async deleteInstance(id: string): Promise<void> {
    await db.instances.delete(id)
  }

  async deleteInstances(ids: string[]): Promise<void> {
    await db.instances.bulkDelete(ids)
  }

  async renameInstance(id: string, newName: string): Promise<void> {
    await this.updateInstance(id, { name: newName })
  }

  async getStorageStats(): Promise<InstanceStats> {
    const instances = await db.instances.toArray()

    if (instances.length === 0) {
      return { totalInstances: 0, totalSize: 0 }
    }

    const dates = instances.map(i => i.createdAt)
    const totalSize = await this.estimateStorageSize()

    return {
      totalInstances: instances.length,
      totalSize,
      oldestInstance: new Date(Math.min(...dates.map(d => d.getTime()))),
      newestInstance: new Date(Math.max(...dates.map(d => d.getTime()))),
    }
  }

  async cleanupOldInstances(keepCount = 50): Promise<number> {
    const instances = await db.instances.orderBy('updatedAt').reverse().toArray()

    if (instances.length <= keepCount) {
      return 0
    }

    const toDelete = instances.slice(keepCount)
    const deleteIds = toDelete.map(i => i.id)

    await this.deleteInstances(deleteIds)
    return toDelete.length
  }

  async exportInstance(id: string): Promise<SavedInstance | null> {
    const instance = await this.getInstance(id)
    return instance ?? null
  }

  async importInstance(instanceData: SavedInstance): Promise<string> {
    const { id, createdAt, updatedAt, ...createData } = instanceData
    const serializedData = serializeForStorage(createData)

    const newInstance: SavedInstance = {
      ...serializedData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.instances.add(newInstance)
    return newInstance.id
  }

  async instanceExists(id: string): Promise<boolean> {
    const count = await db.instances.where('id').equals(id).count()
    return count > 0
  }

  private async estimateStorageSize(): Promise<number> {
    const instances = await db.instances.toArray()

    let totalSize = 0
    for (const instance of instances) {
      totalSize += JSON.stringify(instance).length * 2
      totalSize += instance.resourcePacks.length * 1024 * 1024

      if (instance.thumbnail) {
        totalSize += 50 * 1024
      }
    }

    return totalSize
  }
}

export const instanceStorage = InstanceStorageService.getInstance()
