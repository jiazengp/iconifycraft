import { ref } from 'vue'

interface UseFileDragDropOptions {
  accept?: string | string[]
  multiple?: boolean
  onDrop?: (files: FileList) => void
  onDragEnter?: () => void
  onDragLeave?: () => void
}

export function useFileDragDrop(options: UseFileDragDropOptions = {}) {
  const {
    accept,
    multiple = false,
    onDrop,
    onDragEnter,
    onDragLeave,
  } = options

  const isDragOver = ref(false)
  const fileInput = ref<HTMLInputElement>()

  const isAcceptedFile = (file: File): boolean => {
    if (!accept)
      return true

    const acceptArray = Array.isArray(accept) ? accept : [accept]

    return acceptArray.some((acceptType) => {
      if (acceptType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(acceptType.toLowerCase())
      }

      if (acceptType.includes('/')) {
        const [type, subtype] = acceptType.split('/')
        const [fileType] = file.type.split('/')

        if (subtype === '*') {
          return fileType === type
        }
        return file.type === acceptType
      }

      return false
    })
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (!isDragOver.value) {
      isDragOver.value = true
      onDragEnter?.()
    }
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      isDragOver.value = false
      onDragLeave?.()
    }
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false

    const files = event.dataTransfer?.files
    if (!files || files.length === 0)
      return

    const validFiles: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (isAcceptedFile(file)) {
        validFiles.push(file)
        if (!multiple)
          break
      }
    }

    if (validFiles.length > 0) {
      const fileList = new DataTransfer()
      validFiles.forEach(file => fileList.items.add(file))
      onDrop?.(fileList.files)
    }
  }

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    const files = input.files

    if (files && files.length > 0) {
      onDrop?.(files)
    }
  }

  const openFileDialog = () => {
    fileInput.value?.click()
  }

  const clearFiles = () => {
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  return {
    isDragOver: readonly(isDragOver),
    fileInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    openFileDialog,
    clearFiles,
  }
}
