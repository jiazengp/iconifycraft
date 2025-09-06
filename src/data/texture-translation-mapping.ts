import mappingData from './texture-translation-mapping.json'

export interface TextureMapping {
  textureName: string
  translationKey: string
  type: 'item' | 'block'
}

export const TEXTURE_TRANSLATION_MAPPING: Record<string, { translationKey: string, type: 'item' | 'block' }> = mappingData as Record<string, { translationKey: string, type: 'item' | 'block' }>

export function getTranslationMapping(textureName: string): { translationKey: string, type: 'item' | 'block' } | null {
  const cleanName = textureName.replace(/\.(png|jpg|jpeg|gif)$/, '')
  return TEXTURE_TRANSLATION_MAPPING[cleanName] || null
}

const usedTranslationKeys = new Set<string>()

export function generateTranslationKey(textureName: string, defaultType: 'item' | 'block', namespace: string = 'minecraft'): string {
  if (namespace === 'minecraft') {
    const mapping = getTranslationMapping(textureName)
    if (mapping) {
      const baseKey = `${namespace}.minecraft.${mapping.type}.${mapping.translationKey}`

      if (!usedTranslationKeys.has(baseKey)) {
        usedTranslationKeys.add(baseKey)
        return baseKey
      }

      const cleanTextureName = textureName.replace(/\.(png|jpg|jpeg|gif)$/, '')

      const fileBasedKey = `${namespace}.minecraft.${mapping.type}.${cleanTextureName}`
      if (!usedTranslationKeys.has(fileBasedKey)) {
        usedTranslationKeys.add(fileBasedKey)
        return fileBasedKey
      }

      let counter = 2
      let numberedKey: string
      do {
        numberedKey = `${baseKey}_${counter}`
        counter++
      } while (usedTranslationKeys.has(numberedKey))

      usedTranslationKeys.add(numberedKey)
      return numberedKey
    }
  }

  const cleanName = textureName.replace(/\.(png|jpg|jpeg|gif)$/, '')
  const key = `${namespace}.minecraft.${defaultType}.${cleanName}`

  if (!usedTranslationKeys.has(key)) {
    usedTranslationKeys.add(key)
    return key
  }

  let counter = 2
  let numberedKey: string
  do {
    numberedKey = `${key}_${counter}`
    counter++
  } while (usedTranslationKeys.has(numberedKey))

  usedTranslationKeys.add(numberedKey)
  return numberedKey
}

export function resetTranslationKeyCache(): void {
  usedTranslationKeys.clear()
}
