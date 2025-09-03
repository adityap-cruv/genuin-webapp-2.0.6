export class CallbackQueueManager {
  private queue: (() => void)[] = []

  /**
   * Adds a callback to the queue.
   * @param callback - The function to be executed later.
   */
  enqueue(callback: () => void): void {
    this.queue.push(callback)
  }

  /**
   * Executes all callbacks in the queue and clears the queue.
   */
  executeAllCallbacks(): void {
    this.queue.forEach((callback) => {
      try {
        callback()
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
