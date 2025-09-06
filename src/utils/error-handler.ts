import { logger } from './logger'

export interface RetryOptions {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  shouldRetry?: (error: Error) => boolean
}

export interface ErrorContext {
  operation: string
  blockId?: string
  attempt: number
  totalAttempts: number
  error: Error
}

export type ErrorHandler = (context: ErrorContext) => void

export class RenderErrorHandler {
  private errorHandlers: ErrorHandler[] = []
  private retryHistory = new Map<string, number>()

  addErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.push(handler)
  }

  removeErrorHandler(handler: ErrorHandler): void {
    const index = this.errorHandlers.indexOf(handler)
    if (index > -1) {
      this.errorHandlers.splice(index, 1)
    }
  }

  private notifyErrorHandlers(context: ErrorContext): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(context)
      }
      catch (error) {
        logger.error('Error handler failed:', error)
      }
    }
  }

  async retryAsync<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    operationName = 'unknown',
  ): Promise<T> {
    const config: RetryOptions = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      ...options,
    }

    let lastError: Error

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation()

        // 成功时重置重试历史
        this.retryHistory.delete(operationName)
        return result
      }
      catch (error) {
        lastError = error as Error

        // 记录重试次数
        this.retryHistory.set(operationName, attempt)

        const context: ErrorContext = {
          operation: operationName,
          attempt,
          totalAttempts: config.maxAttempts,
          error: lastError,
        }

        this.notifyErrorHandlers(context)

        // 检查是否应该重试
        if (attempt >= config.maxAttempts) {
          break
        }

        if (config.shouldRetry && !config.shouldRetry(lastError)) {
          break
        }

        // 计算延迟时间
        const delay = Math.min(
          config.baseDelay * config.backoffFactor ** (attempt - 1),
          config.maxDelay,
        )

        logger.warn(`Operation "${operationName}" failed (attempt ${attempt}/${config.maxAttempts}), retrying in ${delay}ms:`, lastError.message)

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // eslint-disable-next-line no-throw-literal
    throw lastError!
  }

  isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'WebGL context lost',
      'Canvas allocation failed',
      'Texture load failed',
      'Out of memory',
      'Network error',
      'Timeout',
    ]

    return retryableErrors.some(pattern =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    )
  }

  getRetryCount(operation: string): number {
    return this.retryHistory.get(operation) || 0
  }

  clearRetryHistory(): void {
    this.retryHistory.clear()
  }

  /**
   * 批量错误处理
   */
  async safeBatchOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    options: {
      concurrency?: number
      continueOnError?: boolean
      onItemError?: (item: T, error: Error) => void
    } = {},
  ): Promise<{ results: R[], errors: Array<{ item: T, error: Error }> }> {
    const { concurrency = 10, continueOnError = true, onItemError } = options
    const results: R[] = []
    const errors: Array<{ item: T, error: Error }> = []

    // 分批处理
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency)

      const batchPromises = batch.map(async (item, index) => {
        try {
          const result = await operation(item)
          return { success: true, result, item, index: i + index }
        }
        catch (error) {
          const err = error as Error
          errors.push({ item, error: err })

          if (onItemError) {
            onItemError(item, err)
          }

          if (!continueOnError) {
            throw error
          }

          return { success: false, error: err, item, index: i + index }
        }
      })

      const batchResults = await Promise.all(batchPromises)

      // 收集成功的结果
      for (const batchResult of batchResults) {
        if (batchResult.success && 'result' in batchResult) {
          results[batchResult.index] = batchResult.result as R
        }
      }
    }

    return { results: results.filter(r => r !== undefined), errors }
  }

  /**
   * 创建错误报告
   */
  generateErrorReport(): string {
    let report = '=== 错误报告 ===\n\n'

    if (this.retryHistory.size === 0) {
      report += '无错误记录\n'
    }
    else {
      report += '重试历史:\n'
      for (const [operation, attempts] of this.retryHistory.entries()) {
        report += `- ${operation}: ${attempts} 次重试\n`
      }
    }

    return report
  }
}
