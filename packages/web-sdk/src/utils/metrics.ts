/**
 * Performance Metrics Collection Utility
 *
 * Tracks bundle sizes, chunk loading, and performance metrics for SDK optimization
 */

export interface ChunkLoadInfo {
  name: string
  url: string
  size: number
  loadTime: number
  timestamp: number
}

export interface PerformanceMetrics {
  // Initial load metrics
  sdkLoadStart: number
  sdkLoadEnd: number
  sdkLoadDuration: number

  // Init metrics
  initStart: number
  initEnd: number
  initDuration: number

  // Embed render metrics
  embedRenderStart: number
  embedRenderEnd: number
  embedRenderDuration: number

  // Chunk metrics
  chunksLoaded: ChunkLoadInfo[]
  totalChunks: number
  totalBytesTransferred: number

  // Time to interactive
  timeToInteractive: number

  // Chunk loading timeline
  chunkTimeline: Array<{
    chunk: string
    timestamp: number
    size: number
  }>
}

class MetricsCollector {
  private metrics: Partial<PerformanceMetrics> = {}
  private chunkMap = new Map<string, ChunkLoadInfo>()
  private performanceMarkers: Map<string, number> = new Map()

  /**
   * Mark the start of SDK loading
   */
  markSDKLoadStart(): void {
    const timestamp = performance.now()
    this.metrics.sdkLoadStart = timestamp
    this.performanceMarkers.set('sdk-load-start', timestamp)

    if (typeof performance.mark === 'function') {
      performance.mark('genuin-sdk-load-start')
    }
  }

  /**
   * Mark the end of SDK loading
   */
  markSDKLoadEnd(): void {
    const timestamp = performance.now()
    this.metrics.sdkLoadEnd = timestamp
    this.metrics.sdkLoadDuration = timestamp - (this.metrics.sdkLoadStart || 0)
    this.performanceMarkers.set('sdk-load-end', timestamp)

    if (typeof performance.mark === 'function') {
      performance.mark('genuin-sdk-load-end')
    }

    if (typeof performance.measure === 'function') {
      performance.measure('genuin-sdk-load', 'genuin-sdk-load-start', 'genuin-sdk-load-end')
    }
  }

  /**
   * Mark the start of SDK initialization
   */
  markInitStart(): void {
    const timestamp = performance.now()
    this.metrics.initStart = timestamp
    this.performanceMarkers.set('init-start', timestamp)

    if (typeof performance.mark === 'function') {
      performance.mark('genuin-init-start')
    }
  }

  /**
   * Mark the end of SDK initialization
   */
  markInitEnd(): void {
    const timestamp = performance.now()
    this.metrics.initEnd = timestamp
    this.metrics.initDuration = timestamp - (this.metrics.initStart || 0)
    this.performanceMarkers.set('init-end', timestamp)

    if (typeof performance.mark === 'function') {
      performance.mark('genuin-init-end')
    }

    if (typeof performance.measure === 'function') {
      performance.measure('genuin-init', 'genuin-init-start', 'genuin-init-end')
    }
  }

  /**
   * Mark the start of embed rendering
   */
  markEmbedRenderStart(embedId?: string): void {
    const timestamp = performance.now()
    const key = embedId ? `embed-render-start-${embedId}` : 'embed-render-start'
    this.performanceMarkers.set(key, timestamp)

    if (!this.metrics.embedRenderStart) {
      this.metrics.embedRenderStart = timestamp
    }

    if (typeof performance.mark === 'function') {
      performance.mark(`genuin-embed-render-start${embedId ? `-${embedId}` : ''}`)
    }
  }

  /**
   * Mark the end of embed rendering
   */
  markEmbedRenderEnd(embedId?: string): void {
    const timestamp = performance.now()
    const key = embedId ? `embed-render-end-${embedId}` : 'embed-render-end'
    const startKey = embedId ? `embed-render-start-${embedId}` : 'embed-render-start'
    const startTime = this.performanceMarkers.get(startKey) || this.metrics.embedRenderStart || 0

    this.performanceMarkers.set(key, timestamp)

    if (!this.metrics.embedRenderEnd) {
      this.metrics.embedRenderEnd = timestamp
      this.metrics.embedRenderDuration = timestamp - startTime
    }

    if (typeof performance.mark === 'function') {
      performance.mark(`genuin-embed-render-end${embedId ? `-${embedId}` : ''}`)
    }

    if (typeof performance.measure === 'function') {
      performance.measure(
        `genuin-embed-render${embedId ? `-${embedId}` : ''}`,
        `genuin-embed-render-start${embedId ? `-${embedId}` : ''}`,
        `genuin-embed-render-end${embedId ? `-${embedId}` : ''}`
      )
    }
  }

  /**
   * Track a chunk being loaded
   */
  trackChunkLoad(name: string, url: string, size: number): void {
    const timestamp = performance.now()
    const loadTime = timestamp - (this.metrics.sdkLoadStart || 0)

    const chunkInfo: ChunkLoadInfo = {
      name,
      url,
      size,
      loadTime,
      timestamp,
    }

    this.chunkMap.set(name, chunkInfo)

    if (!this.metrics.chunksLoaded) {
      this.metrics.chunksLoaded = []
    }
    this.metrics.chunksLoaded.push(chunkInfo)

    if (!this.metrics.chunkTimeline) {
      this.metrics.chunkTimeline = []
    }
    this.metrics.chunkTimeline.push({
      chunk: name,
      timestamp,
      size,
    })

    // Update totals
    this.metrics.totalChunks = this.chunkMap.size
    this.metrics.totalBytesTransferred = Array.from(this.chunkMap.values()).reduce(
      (sum, chunk) => sum + chunk.size,
      0
    )
  }

  /**
   * Calculate time to interactive
   */
  calculateTTI(): number {
    if (!this.metrics.initEnd) {
      return 0
    }

    // TTI is the time from page load to when init completes
    // For SDK, we use SDK load start as baseline
    const tti = this.metrics.initEnd - (this.metrics.sdkLoadStart || 0)
    this.metrics.timeToInteractive = tti
    return tti
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics {
    // Calculate TTI if not already calculated
    if (!this.metrics.timeToInteractive) {
      this.calculateTTI()
    }

    return {
      sdkLoadStart: this.metrics.sdkLoadStart || 0,
      sdkLoadEnd: this.metrics.sdkLoadEnd || 0,
      sdkLoadDuration: this.metrics.sdkLoadDuration || 0,
      initStart: this.metrics.initStart || 0,
      initEnd: this.metrics.initEnd || 0,
      initDuration: this.metrics.initDuration || 0,
      embedRenderStart: this.metrics.embedRenderStart || 0,
      embedRenderEnd: this.metrics.embedRenderEnd || 0,
      embedRenderDuration: this.metrics.embedRenderDuration || 0,
      chunksLoaded: this.metrics.chunksLoaded || [],
      totalChunks: this.metrics.totalChunks || 0,
      totalBytesTransferred: this.metrics.totalBytesTransferred || 0,
      timeToInteractive: this.metrics.timeToInteractive || 0,
      chunkTimeline: this.metrics.chunkTimeline || [],
    }
  }

  /**
   * Log metrics to console (for debugging)
   */
  logMetrics(): void {
    const metrics = this.getMetrics()

    console.group('📊 Genuin SDK Performance Metrics')
    console.log('SDK Load Duration:', `${metrics.sdkLoadDuration.toFixed(2)}ms`)
    console.log('Init Duration:', `${metrics.initDuration.toFixed(2)}ms`)
    console.log('Embed Render Duration:', `${metrics.embedRenderDuration.toFixed(2)}ms`)
    console.log('Time to Interactive:', `${metrics.timeToInteractive.toFixed(2)}ms`)
    console.log('Total Chunks Loaded:', metrics.totalChunks)
    console.log('Total Bytes Transferred:', `${(metrics.totalBytesTransferred / 1024).toFixed(2)}KB`)
    console.log('Chunk Timeline:', metrics.chunkTimeline)
    console.groupEnd()
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.metrics = {}
    this.chunkMap.clear()
    this.performanceMarkers.clear()
  }
}

// Singleton instance
let metricsInstance: MetricsCollector | null = null

export function getMetricsCollector(): MetricsCollector {
  if (!metricsInstance) {
    metricsInstance = new MetricsCollector()
  }
  return metricsInstance
}

// Export convenience functions
export const metrics = {
  markSDKLoadStart: () => getMetricsCollector().markSDKLoadStart(),
  markSDKLoadEnd: () => getMetricsCollector().markSDKLoadEnd(),
  markInitStart: () => getMetricsCollector().markInitStart(),
  markInitEnd: () => getMetricsCollector().markInitEnd(),
  markEmbedRenderStart: (embedId?: string) => getMetricsCollector().markEmbedRenderStart(embedId),
  markEmbedRenderEnd: (embedId?: string) => getMetricsCollector().markEmbedRenderEnd(embedId),
  trackChunkLoad: (name: string, url: string, size: number) =>
    getMetricsCollector().trackChunkLoad(name, url, size),
  getMetrics: () => getMetricsCollector().getMetrics(),
  logMetrics: () => getMetricsCollector().logMetrics(),
  reset: () => getMetricsCollector().reset(),
}

// Make metrics available globally for debugging
if (typeof window !== 'undefined') {
  ;(window as any).__GENUIN_METRICS__ = metrics
}

