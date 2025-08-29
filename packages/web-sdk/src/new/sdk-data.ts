import { EmbedDataType } from '../type'

/**
 * Singleton class for managing embed data across the SDK.
 * This class allows appending data from different embed instances
 * and provides immutable access once the data is locked.
 */
export class EmbedDataManager {
  private static instance: EmbedDataManager | null = null
  private embedData: Map<string, EmbedDataType> = new Map()
  private isLocked: boolean = false

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance of EmbedDataManager
   */
  public static getInstance(): EmbedDataManager {
    if (!EmbedDataManager.instance) {
      EmbedDataManager.instance = new EmbedDataManager()
    }
    return EmbedDataManager.instance
  }

  /**
   * Append embed data to the collection.
   * This method can only be called before the data is locked.
   *
   * @param embedId - Unique identifier for the embed
   * @param data - The embed data to store
   * @throws Error if data is already locked
   */
  public appendEmbedData(embedId: string, data: EmbedDataType): void {
    if (this.isLocked) {
      throw new Error(
        'EmbedDataManager is locked. Cannot modify data after locking.',
      )
    }

    if (!embedId || typeof embedId !== 'string') {
      throw new Error('Invalid embedId: must be a non-empty string')
    }

    this.embedData.set(embedId, { ...data }) // Store a copy to prevent external mutations
  }

  /**
   * Lock the data manager to prevent any further modifications.
   * Once locked, no more data can be appended.
   */
  public lock(): void {
    this.isLocked = true
  }

  /**
   * Check if the data manager is locked
   */
  public isDataLocked(): boolean {
    return this.isLocked
  }

  /**
   * Get embed data by ID
   *
   * @param embedId - The embed ID to retrieve
   * @returns A copy of the embed data or undefined if not found
   */
  public getEmbedData(embedId: string): EmbedDataType | undefined {
    const data = this.embedData.get(embedId)
    return data ? { ...data } : undefined // Return a copy to prevent mutations
  }

  /**
   * Get all embed data as a read-only map
   *
   * @returns A new Map containing copies of all embed data
   */
  public getAllEmbedData(): ReadonlyMap<string, EmbedDataType> {
    const copy = new Map<string, EmbedDataType>()
    for (const [key, value] of this.embedData) {
      copy.set(key, { ...value })
    }
    return copy
  }

  /**
   * Get all embed IDs
   *
   * @returns Array of all embed IDs
   */
  public getAllEmbedIds(): string[] {
    return Array.from(this.embedData.keys())
  }

  /**
   * Check if an embed exists
   *
   * @param embedId - The embed ID to check
   * @returns true if the embed exists, false otherwise
   */
  public hasEmbed(embedId: string): boolean {
    return this.embedData.has(embedId)
  }

  /**
   * Get the total number of embeds stored
   *
   * @returns The number of embeds
   */
  public getEmbedCount(): number {
    return this.embedData.size
  }

  /**
   * Reset the manager (only for testing purposes).
   * This method is protected and should only be used in test environments.
   */
  protected static resetInstance(): void {
    EmbedDataManager.instance = null
  }
}

// Export a convenience function to get the singleton instance
export const getEmbedDataManager = (): EmbedDataManager => {
  return EmbedDataManager.getInstance()
}
