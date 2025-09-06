import type { ResourcePack } from '~/types/resource-pack'
import { ResourcePackService } from './ResourcePackService'

interface VanillaPackNames {
  item?: string
  block?: string
}

interface VanillaPackLoadResult {
  itemPack?: ResourcePack
  blockPack?: ResourcePack
  totalTextures: number
}

export class VanillaPackService {
  private resourcePackService = new ResourcePackService()

  async loadVanillaPacks(
    version: string,
    packNames?: VanillaPackNames,
    onProgress?: (progress: number) => void,
  ): Promise<VanillaPackLoadResult> {
    if (!version) {
      throw new Error('Version is required')
    }
    const result: VanillaPackLoadResult = { totalTextures: 0 }

    onProgress?.(0.2)
    const itemPack = await this.loadSinglePack('item', version, packNames?.item)
    if (itemPack) {
      result.itemPack = itemPack
      result.totalTextures += itemPack.textures.length
    }

    onProgress?.(0.6)
    const blockPack = await this.loadSinglePack('block', version, packNames?.block)
    if (blockPack) {
      result.blockPack = blockPack
      result.totalTextures += blockPack.textures.length
    }

    onProgress?.(0.9)

    if (result.totalTextures === 0) {
      throw new Error(`No vanilla textures found for version ${version}`)
    }

    return result
  }

  private async loadSinglePack(
    type: 'item' | 'block',
    version: string,
    packName?: string,
  ): Promise<ResourcePack | null> {
    try {
      const url = `/assets/vanilla/${type}/${version}.zip`
      const response = await fetch(url)

      if (!response.ok) {
        return null
      }

      const blob = await response.blob()
      const file = new File([blob], `${version}-${type}s.zip`, { type: 'application/zip' })

      const pack = await this.resourcePackService.parseResourcePack(file)
      pack.name = packName || `Vanilla_${type === 'item' ? 'Item' : 'Block'} (${version})`
      pack.isVanilla = true

      return pack
    }
    catch {
      return null
    }
  }

  async checkVanillaAvailability(version: string): Promise<{
    hasItems: boolean
    hasBlocks: boolean
  }> {
    const [itemResponse, blockResponse] = await Promise.allSettled([
      fetch(`/assets/vanilla/item/${version}.zip`, { method: 'HEAD' }),
      fetch(`/assets/vanilla/block/${version}.zip`, { method: 'HEAD' }),
    ])

    return {
      hasItems: itemResponse.status === 'fulfilled' && itemResponse.value.ok,
      hasBlocks: blockResponse.status === 'fulfilled' && blockResponse.value.ok,
    }
  }

  /**
   * 获取材质解析统计
   */
  getTextureStats(
    userResourcePacks: ResourcePack[] = [],
    vanillaResourcePacks: ResourcePack[] = [],
  ): {
    totalTextures: number
    userTextures: number
    vanillaTextures: number
    byCategory: Record<string, number>
    byNamespace: Record<string, number>
  } {
    const allPacks = [...userResourcePacks, ...vanillaResourcePacks]
    const allTextures = allPacks.flatMap(pack => pack.textures)

    const userTextures = userResourcePacks.flatMap(pack => pack.textures)
    const vanillaTextures = vanillaResourcePacks.flatMap(pack => pack.textures)

    const byCategory: Record<string, number> = {}
    const byNamespace: Record<string, number> = {}

    for (const texture of allTextures) {
      byCategory[texture.category] = (byCategory[texture.category] || 0) + 1
      byNamespace[texture.namespace] = (byNamespace[texture.namespace] || 0) + 1
    }

    return {
      totalTextures: allTextures.length,
      userTextures: userTextures.length,
      vanillaTextures: vanillaTextures.length,
      byCategory,
      byNamespace,
    }
  }
}
