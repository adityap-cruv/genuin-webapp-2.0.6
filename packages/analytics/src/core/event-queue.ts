/**
 * Event Queue System
 * Manages queuing of events before providers are ready
 */

import type { QueuedEvent, AnalyticsEvent } from '../types/events'
import type { QueueConfig } from '../types/config'

/**
 * Default queue configuration
 */
const DEFAULT_QUEUE_CONFIG: Required<QueueConfig> = {
  maxSize: 100,
  maxAge: 300000, // 5 minutes
  strategy: 'fifo',
  persist: false,
  persistKey: 'genuin-analytics-queue',
  persistDebounce: 1000,
}

/**
 * EventQueue manages a queue of analytics events with support for:
 * - Size limits
 * - Event expiry (TTL)
 * - Different queue strategies (FIFO, LIFO, Priority)
 * - Optional localStorage persistence
 */
export class EventQueue {
  private queue: QueuedEvent[] = []
  private config: Required<QueueConfig>
  private persistTimeout: NodeJS.Timeout | null = null
  private metrics = {
    totalQueued: 0,
    totalDropped: 0,
    totalExpired: 0,
    totalFlushed: 0,
  }

  constructor(config: QueueConfig = {}) {
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...config }

    // Load from storage if persistence is enabled
    if (this.config.persist) {
      this.loadFromStorage()
    }
  }

  /**
   * Add an event to the queue
   * Returns true if successful, false if queue is full
   */
  enqueue(event: AnalyticsEvent): boolean {
    // Remove expired events first
    this.removeExpired()

    // Check if queue is full
    if (this.isFull()) {
      // If using priority strategy, check if new event should replace lowest priority
      if (this.config.strategy === 'priority' && event.priority) {
        this.evictLowestPriority()
      } else {
        // Queue is full, drop the event
        this.metrics.totalDropped++
        console.warn(
          `[EventQueue] Queue is full (${this.config.maxSize}). Event dropped:`,
          event.name
        )
        return false
      }
    }

    const queuedEvent: QueuedEvent = {
      ...event,
      queuedAt: Date.now(),
      retryCount: 0,
    }

    this.queue.push(queuedEvent)
    this.metrics.totalQueued++

    // Sort by priority if using priority strategy
    if (this.config.strategy === 'priority') {
      this.sortByPriority()
    }

    // Persist to storage
    if (this.config.persist) {
      this.debouncedSaveToStorage()
    }

    return true
  }

  /**
   * Remove and return the next event from the queue
   */
  dequeue(): QueuedEvent | null {
    if (this.isEmpty()) {
      return null
    }

    let event: QueuedEvent | undefined

    switch (this.config.strategy) {
      case 'lifo':
        event = this.queue.pop()
        break
      case 'fifo':
      case 'priority':
      default:
        event = this.queue.shift()
        break
    }

    if (event && this.config.persist) {
      this.debouncedSaveToStorage()
    }

    return event || null
  }

  /**
   * Peek at the next event without removing it
   */
  peek(): QueuedEvent | null {
    if (this.isEmpty()) {
      return null
    }

    const event = this.config.strategy === 'lifo'
      ? this.queue[this.queue.length - 1]
      : this.queue[0]

    return event || null
  }

  /**
   * Flush all events through a callback
   * Returns number of events successfully flushed
   */
  async flush(callback: (event: QueuedEvent) => Promise<void>): Promise<number> {
    let flushedCount = 0
    const failedEvents: QueuedEvent[] = []

    while (!this.isEmpty()) {
      const event = this.dequeue()
      if (!event) break

      try {
        await callback(event)
        flushedCount++
        this.metrics.totalFlushed++
      } catch (error) {
        console.error('[EventQueue] Failed to flush event:', error)

        // Track retry count
        event.retryCount = (event.retryCount || 0) + 1

        // Re-queue if not too many retries
        if (event.retryCount < 3) {
          failedEvents.push(event)
        }
      }
    }

    // Re-add failed events to queue
    if (failedEvents.length > 0) {
      this.queue.unshift(...failedEvents)

      if (this.config.persist) {
        this.debouncedSaveToStorage()
      }
    }

    return flushedCount
  }

  /**
   * Clear all events from the queue
   */
  clear(): void {
    this.queue = []

    if (this.config.persist) {
      this.clearStorage()
    }
  }

  /**
   * Get the number of events in the queue
   */
  size(): number {
    return this.queue.length
  }

  /**
   * Check if the queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0
  }

  /**
   * Check if the queue is full
   */
  isFull(): boolean {
    return this.queue.length >= this.config.maxSize
  }

  /**
   * Remove expired events from the queue
   * Returns number of events removed
   */
  removeExpired(): number {
    const now = Date.now()
    const originalSize = this.queue.length

    this.queue = this.queue.filter((event) => {
      const age = now - event.queuedAt
      const isExpired = age > this.config.maxAge

      if (isExpired) {
        this.metrics.totalExpired++
      }

      return !isExpired
    })

    const removedCount = originalSize - this.queue.length

    if (removedCount > 0 && this.config.persist) {
      this.debouncedSaveToStorage()
    }

    return removedCount
  }

  /**
   * Remove oldest events to make room
   * Used when queue is full
   */
  prune(count: number = 1): void {
    if (count <= 0) return

    for (let i = 0; i < count && !this.isEmpty(); i++) {
      if (this.config.strategy === 'lifo') {
        this.queue.shift() // Remove oldest (at front)
      } else {
        this.queue.pop() // Remove oldest (at end)
      }
      this.metrics.totalDropped++
    }

    if (this.config.persist) {
      this.debouncedSaveToStorage()
    }
  }

  /**
   * Get queue metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      currentSize: this.queue.length,
      maxSize: this.config.maxSize,
    }
  }

  /**
   * Get all events in the queue (for debugging)
   */
  getAll(): QueuedEvent[] {
    return [...this.queue]
  }

  /**
   * Sort queue by priority (high to low)
   */
  private sortByPriority(): void {
    this.queue.sort((a, b) => {
      const priorityA = a.priority || 3
      const priorityB = b.priority || 3
      return priorityB - priorityA // Higher priority first
    })
  }

  /**
   * Evict lowest priority event to make room
   */
  private evictLowestPriority(): void {
    if (this.isEmpty()) return

    // Find event with lowest priority
    let lowestPriorityIndex = 0
    const firstEvent = this.queue[0]
    if (!firstEvent) return

    let lowestPriority = firstEvent.priority || 3

    for (let i = 1; i < this.queue.length; i++) {
      const event = this.queue[i]
      if (!event) continue

      const priority = event.priority || 3
      if (priority < lowestPriority) {
        lowestPriority = priority
        lowestPriorityIndex = i
      }
    }

    this.queue.splice(lowestPriorityIndex, 1)
    this.metrics.totalDropped++
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    try {
      const data = JSON.stringify({
        queue: this.queue,
        metrics: this.metrics,
        savedAt: Date.now(),
      })
      localStorage.setItem(this.config.persistKey, data)
    } catch (error) {
      console.error('[EventQueue] Failed to save to localStorage:', error)
    }
  }

  /**
   * Debounced save to storage
   */
  private debouncedSaveToStorage(): void {
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout)
    }

    this.persistTimeout = setTimeout(() => {
      this.saveToStorage()
      this.persistTimeout = null
    }, this.config.persistDebounce)
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    try {
      const data = localStorage.getItem(this.config.persistKey)
      if (!data) return

      const parsed = JSON.parse(data)

      // Validate data structure
      if (!parsed.queue || !Array.isArray(parsed.queue)) {
        return
      }

      // Only load events that haven't expired
      const now = Date.now()
      this.queue = parsed.queue.filter((event: QueuedEvent) => {
        const age = now - event.queuedAt
        return age <= this.config.maxAge
      })

      // Restore metrics if available
      if (parsed.metrics) {
        this.metrics = { ...this.metrics, ...parsed.metrics }
      }

      console.log(
        `[EventQueue] Loaded ${this.queue.length} events from localStorage`
      )
    } catch (error) {
      console.error('[EventQueue] Failed to load from localStorage:', error)
    }
  }

  /**
   * Clear queue from localStorage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(this.config.persistKey)
    } catch (error) {
      console.error('[EventQueue] Failed to clear localStorage:', error)
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout)
      this.persistTimeout = null
    }

    // Save final state before destroying
    if (this.config.persist && !this.isEmpty()) {
      this.saveToStorage()
    }
  }
}
