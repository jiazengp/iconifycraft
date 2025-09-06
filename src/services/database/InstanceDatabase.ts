import type { Table } from 'dexie'
import type { SavedInstance } from '~/types/instance'
import Dexie from 'dexie'

export class InstanceDatabase extends Dexie {
  instances!: Table<SavedInstance>

  constructor() {
    super('MinecraftChatIconsInstances')

    this.version(1).stores({
      instances: 'id, name, createdAt, updatedAt, minecraftVersion, *metadata.packCount',
    })

    this.instances.hook('creating', (primaryKey, obj) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.instances.hook('updating', (modifications) => {
      (modifications as { updatedAt?: Date }).updatedAt = new Date()
    })
  }
}

export const db = new InstanceDatabase()
