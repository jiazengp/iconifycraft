interface BrowserCapabilities {
  canvas: boolean
  imageSmoothing: boolean
  blob: boolean
  toDataURL: boolean
  webgl: boolean
}

interface CompatibilityIssue {
  type: 'warning' | 'error'
  message: string
  suggestion?: string
}

export class BrowserCompatibilityChecker {
  static checkCapabilities(): BrowserCapabilities {
    return {
      canvas: this.checkCanvasSupport(),
      imageSmoothing: this.checkImageSmoothingSupport(),
      blob: this.checkBlobSupport(),
      toDataURL: this.checkToDataURLSupport(),
      webgl: this.checkWebGLSupport(),
    }
  }

  static checkIssues(): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = []
    const capabilities = this.checkCapabilities()

    if (!capabilities.canvas) {
      issues.push({
        type: 'error',
        message: 'Canvas not supported',
        suggestion: 'Please use a modern browser that supports HTML5 Canvas',
      })
    }

    if (!capabilities.blob) {
      issues.push({
        type: 'error',
        message: 'Blob API not supported',
        suggestion: 'Please update your browser to support Blob API',
      })
    }

    if (!capabilities.imageSmoothing) {
      issues.push({
        type: 'warning',
        message: 'Image smoothing control not supported',
        suggestion: 'Textures may appear blurred in older browsers',
      })
    }

    if (!capabilities.toDataURL) {
      issues.push({
        type: 'error',
        message: 'Canvas toDataURL not supported',
        suggestion: 'Cannot export atlas images in this browser',
      })
    }

    return issues
  }

  static getBrowserInfo(): string {
    const ua = navigator.userAgent
    if (ua.includes('Chrome'))
      return 'Chrome'
    if (ua.includes('Firefox'))
      return 'Firefox'
    if (ua.includes('Safari') && !ua.includes('Chrome'))
      return 'Safari'
    if (ua.includes('Edge'))
      return 'Edge'
    if (ua.includes('Opera'))
      return 'Opera'
    return 'Unknown'
  }

  private static checkCanvasSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext && canvas.getContext('2d'))
    }
    catch {
      return false
    }
  }

  private static checkImageSmoothingSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      return ctx ? 'imageSmoothingEnabled' in ctx : false
    }
    catch {
      return false
    }
  }

  private static checkBlobSupport(): boolean {
    try {
      return 'Blob' in window && 'URL' in window && 'createObjectURL' in URL
    }
    catch {
      return false
    }
  }

  private static checkToDataURLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return typeof canvas.toDataURL === 'function'
    }
    catch {
      return false
    }
  }

  private static checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    }
    catch {
      return false
    }
  }
}
