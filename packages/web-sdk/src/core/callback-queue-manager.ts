export class CallbackQueueManager {
  private queue: { callback: () => void; config: any }[] = []

  /**
   * Adds a callback to the queue if its config is unique.
   * @param callback - The function to be executed later.
   * @param config - The configuration associated with the callback for uniqueness check.
   */
  enqueue(callback: () => void, config?: any): void {
    const configString = JSON.stringify(config || {})
    const isUnique = !this.queue.some(
      (item) => JSON.stringify(item.config || {}) === configString,
    )
    if (isUnique) {
      this.queue.push({ callback, config })
    } else {
      console.log('Duplicate config found, skipping enqueue:', config)
    }
  }

  /**
   * Executes all callbacks in the queue and clears the queue.
   */
  executeAllCallbacks(): void {
    this.queue.forEach((item) => {
      try {
        item.callback()
      } catch (error) {
        console.error('Error executing callback:', error)
      }
    })
    this.queue = []
  }

  /**
   * Destroys the callback queue by clearing all queued callbacks without executing them.
   */
  destroy(): void {
    this.queue = []
  }
}
