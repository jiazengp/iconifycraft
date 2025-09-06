import { ref } from 'vue'

export interface CanvasRenderOptions {
  width?: number
  height?: number
  pixelated?: boolean
  antialias?: boolean
}

export function useCanvasRenderer(options: CanvasRenderOptions = {}) {
  const {
    width = 64,
    height = 64,
    pixelated = true,
    antialias = false,
  } = options

  const canvasRef = ref<HTMLCanvasElement>()
  const isLoading = ref(false)
  const error = ref<string>()

  const getContext = (): CanvasRenderingContext2D | null => {
    if (!canvasRef.value)
      return null

    const ctx = canvasRef.value.getContext('2d')
    if (!ctx)
      return null

    ctx.imageSmoothingEnabled = !pixelated && antialias
    return ctx
  }

  const clear = () => {
    const ctx = getContext()
    if (!ctx)
      return

    ctx.clearRect(0, 0, width, height)
  }

  const renderImage = async (imageSource: string | Uint8Array | File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const ctx = getContext()
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      isLoading.value = true
      error.value = undefined

      let imageUrl: string

      if (typeof imageSource === 'string') {
        imageUrl = imageSource
      }
      else if (imageSource instanceof Uint8Array) {
        const blob = new Blob([imageSource.buffer.slice(imageSource.byteOffset, imageSource.byteOffset + imageSource.byteLength) as ArrayBuffer], { type: 'image/png' })
        imageUrl = URL.createObjectURL(blob)
      }
      else if (imageSource instanceof File) {
        imageUrl = URL.createObjectURL(imageSource)
      }
      else {
        reject(new Error('Unsupported image source type'))
        return
      }

      const img = new Image()

      img.onload = () => {
        try {
          clear()
          ctx.drawImage(img, 0, 0, width, height)
          isLoading.value = false
          resolve()
        }
        catch (err) {
          error.value = `Failed to draw image: ${err}`
          isLoading.value = false
          reject(err)
        }
        finally {
          if (typeof imageSource !== 'string') {
            URL.revokeObjectURL(imageUrl)
          }
        }
      }

      img.onerror = () => {
        const errorMsg = 'Failed to load image'
        error.value = errorMsg
        isLoading.value = false

        if (typeof imageSource !== 'string') {
          URL.revokeObjectURL(imageUrl)
        }

        reject(new Error(errorMsg))
      }

      img.src = imageUrl
    })
  }

  const renderImageGrid = async (
    images: (string | Uint8Array | File)[],
    cols: number,
    rows: number,
    cellWidth: number = 16,
    cellHeight: number = 16,
  ): Promise<void> => {
    const ctx = getContext()
    if (!ctx)
      throw new Error('Canvas context not available')

    isLoading.value = true
    error.value = undefined

    try {
      clear()

      const promises = images.map(async (imageSource, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols

        if (row >= rows)
          return

        const x = col * cellWidth
        const y = row * cellHeight

        let imageUrl: string

        if (typeof imageSource === 'string') {
          imageUrl = imageSource
        }
        else if (imageSource instanceof Uint8Array) {
          const blob = new Blob([imageSource.buffer.slice(imageSource.byteOffset, imageSource.byteOffset + imageSource.byteLength) as ArrayBuffer], { type: 'image/png' })
          imageUrl = URL.createObjectURL(blob)
        }
        else if (imageSource instanceof File) {
          imageUrl = URL.createObjectURL(imageSource)
        }
        else {
          return
        }

        return new Promise<void>((resolve, reject) => {
          const img = new Image()

          img.onload = () => {
            try {
              ctx.drawImage(img, x, y, cellWidth, cellHeight)
              resolve()
            }
            catch (err) {
              reject(err)
            }
            finally {
              if (typeof imageSource !== 'string') {
                URL.revokeObjectURL(imageUrl)
              }
            }
          }

          img.onerror = () => {
            if (typeof imageSource !== 'string') {
              URL.revokeObjectURL(imageUrl)
            }
            reject(new Error(`Failed to load image at index ${index}`))
          }

          img.src = imageUrl
        })
      })

      await Promise.allSettled(promises)
      isLoading.value = false
    }
    catch (err) {
      error.value = `Failed to render image grid: ${err}`
      isLoading.value = false
      throw err
    }
  }

  const toBlob = async (type: string = 'image/png', quality?: number): Promise<Blob | null> => {
    if (!canvasRef.value)
      return null

    return new Promise((resolve) => {
      canvasRef.value!.toBlob(resolve, type, quality)
    })
  }

  const toDataURL = (type: string = 'image/png', quality?: number): string => {
    if (!canvasRef.value)
      return ''
    return canvasRef.value.toDataURL(type, quality)
  }

  return {
    canvasRef,
    isLoading: readonly(isLoading),
    error: readonly(error),
    clear,
    renderImage,
    renderImageGrid,
    toBlob,
    toDataURL,
  }
}
