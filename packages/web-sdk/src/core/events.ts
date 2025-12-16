export enum SDKEventType {
  EMBED_LOADED = 'embed:loaded',
  EMBED_ERROR = 'embed:error',
  EMBED_RESIZE = 'embed:resize',
  USER_INTERACTION = 'user:interaction',
  CONTENT_UPDATED = 'content:updated',
  AUTHENTICATION_REQUIRED = 'auth:required',
  AUTHENTICATION_SUCCESS = 'auth:success',
  AUTHENTICATION_REFRESH_FAILED = 'auth:refresh_failed',
  AUTHENTICATION_CACHED_USER_UPDATE = 'auth:cached_user_update',
  NAVIGATION = 'navigation',
  SDK_AUTHENTICATE_USER = 'sdk:authenticateUser',
  SDK_UPDATE_CONTEXTUAL_PARAMS = 'sdk:updateContextualParams',
  SDK_UPDATE_START_VIDEO_SLUG = 'sdk:updateStartVideoSlug',
  SDK_EMBED_PROVIDER_READY = 'sdk:embedProviderReady',
  SDK_EMBED_ERROR = 'sdk:error',
  SDK_EMBED_NO_CONTENT = 'sdk:noContent',
  SDK_EXPAND_VIEW_CHANGED = 'onExpandViewChanged',
  SDK_EXPAND_EMBED = 'sdk:expandEmbed',
  SDK_COLLAPSE_EMBED = 'sdk:collapseEmbed',
}

export interface SDKEvent {
  type: SDKEventType
  payload?: any
  timestamp: number
  embedId?: string
}

export type EventListener = (event: SDKEvent) => void

export class EventManager {
  private static instance: EventManager
  private listeners: Map<SDKEventType, Set<EventListener>> = new Map()
  private eventHistory: SDKEvent[] = []
  private maxHistorySize = 100

  private constructor() {}

  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager()
    }
    return EventManager.instance
  }

  // Subscribe to events
  on(eventType: SDKEventType, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    this.listeners.get(eventType)!.add(listener)

    // Return unsubscribe function
    return () => {
      this.off(eventType, listener)
    }
  }

  // Unsubscribe from events
  off(eventType: SDKEventType, listener: EventListener): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  // Emit events
  emit(eventType: SDKEventType, payload?: any, embedId?: string): void {
    const event: SDKEvent = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      embedId,
    }

    // Add to history
    this.addToHistory(event)

    // Notify listeners
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event)
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error)
        }
      })
    }
  }

  // Subscribe to all events
  onAll(listener: EventListener): () => void {
    const unsubscribeFunctions: (() => void)[] = []

    // Subscribe to all current event types
    Object.values(SDKEventType).forEach((eventType) => {
      unsubscribeFunctions.push(this.on(eventType, listener))
    })

    // Return function to unsubscribe from all
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe())
    }
  }

  // Get event history
  getHistory(eventType?: SDKEventType): SDKEvent[] {
    if (eventType) {
      return this.eventHistory.filter((event) => event.type === eventType)
    }
    return [...this.eventHistory]
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory = []
  }

  // Remove all listeners
  removeAllListeners(eventType?: SDKEventType): void {
    if (eventType) {
      this.listeners.delete(eventType)
    } else {
      this.listeners.clear()
    }
  }

  private addToHistory(event: SDKEvent): void {
    this.eventHistory.push(event)

    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize)
    }
  }

  // Utility methods for common event patterns
  once(eventType: SDKEventType, listener: EventListener): void {
    const onceWrapper = (event: SDKEvent) => {
      listener(event)
      this.off(eventType, onceWrapper)
    }
    this.on(eventType, onceWrapper)
  }

  // Wait for a specific event (Promise-based)
  waitFor(eventType: SDKEventType, timeout?: number): Promise<SDKEvent> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const listener = (event: SDKEvent) => {
        if (timeoutId) clearTimeout(timeoutId)
        resolve(event)
      }

      this.once(eventType, listener)

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(eventType, listener)
          reject(new Error(`Timeout waiting for event: ${eventType}`))
        }, timeout)
      }
    })
  }
}
