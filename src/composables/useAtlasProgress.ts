import NProgress from 'nprogress'
import { ref } from 'vue'

export function useAtlasProgress() {
  const isGenerating = ref(false)
  const currentAtlas = ref(0)
  const totalAtlases = ref(0)
  const currentTexture = ref(0)
  const totalTextures = ref(0)

  const startGeneration = (atlasCount: number, textureCount: number) => {
    isGenerating.value = true
    totalAtlases.value = atlasCount
    totalTextures.value = textureCount
    currentAtlas.value = 0
    currentTexture.value = 0
    NProgress.start()
  }

  const updateProgress = (atlasIndex: number, textureIndex: number) => {
    currentAtlas.value = atlasIndex
    currentTexture.value = textureIndex

    // 计算总体进度 (0.1 到 0.9)
    const atlasProgress = atlasIndex / totalAtlases.value
    const textureProgress = textureIndex / totalTextures.value
    const overallProgress = 0.1 + (atlasProgress * 0.6) + (textureProgress * 0.2)

    NProgress.set(Math.min(overallProgress, 0.9))
  }

  const finishGeneration = () => {
    isGenerating.value = false
    NProgress.done()
  }

  const setProgress = (progress: number) => {
    NProgress.set(progress)
  }

  return {
    isGenerating,
    currentAtlas,
    totalAtlases,
    currentTexture,
    totalTextures,
    startGeneration,
    updateProgress,
    finishGeneration,
    setProgress,
  }
}
