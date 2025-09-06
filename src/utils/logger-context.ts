/**
 * @fileoverview 日志上下文管理系统
 * 提供日志分组、实例标识、模块分类等上下文信息
 */

export interface LogContext {
  /** 实例ID，用于区分不同实例的日志 */
  instanceId?: string
  /** 实例名称，用于显示 */
  instanceName?: string
  /** 模块名称，用于分组 */
  module: LogModule
  /** 操作名称，用于细分日志 */
  operation?: string
  /** 会话ID，用于跟踪单次操作流程 */
  sessionId?: string
  /** 额外的上下文数据 */
  metadata?: Record<string, unknown>
}

export type LogModule
  = | 'Instance' // 实例管理
    | 'Atlas' // 图集生成
    | 'ResourcePack' // 资源包处理
    | 'Export' // 导出操作
    | 'Settings' // 设置管理
    | 'System' // 系统级操作

export interface LogGroup {
  id: string
  title: string
  module: LogModule
  instanceId?: string
  sessionId?: string
  startTime: Date
  endTime?: Date
  collapsed?: boolean
  entries: LogEntry[]
}

export interface LogEntry {
  id: string
  timestamp: Date
  level: number
  message: string
  context: LogContext
  args?: unknown[]
  error?: Error
  duration?: number
}

/**
 * 日志上下文管理器
 */
class LogContextManager {
  private currentContext: LogContext | null = null
  private contextStack: LogContext[] = []
  private activeGroups = new Map<string, LogGroup>()
  private sessionCounter = 0

  /**
   * 设置当前日志上下文
   */
  setContext(context: Partial<LogContext>): void {
    this.currentContext = {
      module: 'System',
      ...this.currentContext,
      ...context,
    }
  }

  /**
   * 获取当前日志上下文
   */
  getCurrentContext(): LogContext | null {
    return this.currentContext
  }

  /**
   * 推入新的上下文（用于嵌套操作）
   */
  pushContext(context: Partial<LogContext>): void {
    if (this.currentContext) {
      this.contextStack.push({ ...this.currentContext })
    }

    this.setContext({
      ...this.currentContext,
      ...context,
      sessionId: context.sessionId ?? this.generateSessionId(),
    })
  }

  /**
   * 弹出上下文（结束嵌套操作）
   */
  popContext(): LogContext | null {
    const previous = this.contextStack.pop()
    if (previous) {
      this.currentContext = previous
    }
    else {
      this.currentContext = null
    }
    return this.currentContext
  }

  /**
   * 清除所有上下文
   */
  clearContext(): void {
    this.currentContext = null
    this.contextStack = []
  }

  /**
   * 创建新的日志分组
   */
  startGroup(title: string, context?: Partial<LogContext>): string {
    const fullContext = {
      ...this.currentContext,
      ...context,
    } as LogContext

    const groupId = this.generateGroupId(fullContext)

    const group: LogGroup = {
      id: groupId,
      title,
      module: fullContext.module,
      instanceId: fullContext.instanceId,
      sessionId: fullContext.sessionId,
      startTime: new Date(),
      entries: [],
    }

    this.activeGroups.set(groupId, group)
    return groupId
  }

  /**
   * 结束日志分组
   */
  endGroup(groupId: string): LogGroup | undefined {
    const group = this.activeGroups.get(groupId)
    if (group) {
      group.endTime = new Date()
      this.activeGroups.delete(groupId)
    }
    return group
  }

  /**
   * 获取活跃的日志分组
   */
  getActiveGroups(): LogGroup[] {
    return Array.from(this.activeGroups.values())
  }

  /**
   * 添加日志条目到分组
   */
  addLogEntry(entry: LogEntry): void {
    // 找到匹配的活跃分组
    const matchingGroup = Array.from(this.activeGroups.values())
      .find(group =>
        group.module === entry.context.module
        && group.instanceId === entry.context.instanceId
        && group.sessionId === entry.context.sessionId,
      )

    if (matchingGroup) {
      matchingGroup.entries.push(entry)
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    this.sessionCounter++
    return `session-${Date.now()}-${this.sessionCounter}`
  }

  /**
   * 生成分组ID
   */
  private generateGroupId(context: LogContext): string {
    const parts = [
      context.module,
      context.instanceId ?? 'global',
      context.sessionId ?? 'default',
      Date.now(),
    ]
    return parts.join('-')
  }

  /**
   * 格式化日志显示文本
   */
  formatLogPrefix(context: LogContext): string {
    const parts = []

    // 模块图标
    const moduleIcon = this.getModuleIcon(context.module)
    parts.push(moduleIcon)

    // 实例信息
    if (context.instanceId && context.instanceName) {
      parts.push(`[${context.instanceName}]`)
    }

    // 操作信息
    if (context.operation) {
      parts.push(`${context.operation}:`)
    }

    return parts.join(' ')
  }

  /**
   * 获取模块图标
   */
  private getModuleIcon(module: LogModule): string {
    const icons: Record<LogModule, string> = {
      Instance: '📱',
      Atlas: '🎨',
      ResourcePack: '📦',
      Export: '🚀',
      Settings: '⚙️',
      System: '🖥️',
    }
    return icons[module] || '📋'
  }
}

// 创建全局实例
export const logContext = new LogContextManager()

/**
 * 日志上下文装饰器工厂
 */
export function withLogContext<T extends any[], R>(
  context: Partial<LogContext>,
  fn: (...args: T) => R,
): (...args: T) => R {
  return (...args: T): R => {
    logContext.pushContext(context)
    try {
      return fn(...args)
    }
    finally {
      logContext.popContext()
    }
  }
}

/**
 * 异步日志上下文装饰器工厂
 */
export function withAsyncLogContext<T extends any[], R>(
  context: Partial<LogContext>,
  fn: (...args: T) => Promise<R>,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    logContext.pushContext(context)
    try {
      return await fn(...args)
    }
    finally {
      logContext.popContext()
    }
  }
}

/**
 * 创建带上下文的日志函数
 */
export function createContextualLogger(context: Partial<LogContext>) {
  return {
    setContext: (newContext: Partial<LogContext>) => {
      logContext.setContext({ ...context, ...newContext })
    },
    startGroup: (title: string) => {
      return logContext.startGroup(title, context)
    },
    endGroup: (groupId: string) => {
      return logContext.endGroup(groupId)
    },
  }
}
