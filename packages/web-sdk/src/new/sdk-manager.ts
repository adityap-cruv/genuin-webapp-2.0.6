type InitConfigs = {
  /**
   * The unique identifier for the embedded SDK instance.
   */
  embed_id?: string
  /**
   * The API key for authenticating requests to the SDK.
   */
  api_key?: string
  /**
   * The token for authenticating requests to the SDK.
   */
  token?: string
}

class SDKManager {
  private static instance: SDKManager
  private initialized: boolean = false
  private sdkElements: HTMLElement[] = []

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): SDKManager {
    if (!SDKManager.instance) {
      SDKManager.instance = new SDKManager()
    }
    return SDKManager.instance
  }

  public init(config?: InitConfigs, ...otherOptions: any[]): void {
    if (this.initialized) {
      console.warn('SDKManager is already initialized')
      return
    }

    console.log('config:', config)

    this.getAndSetDivs()

    this.setDataForDifferentEmbeds()

    this.loadSdkOneByOne()

    this.initialized = true
  }

  public isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get and set elements with id "gen-sdk", starting with "gen-sdk-", or having gen-sdk-class, and dedupe them.
   */
  private getAndSetDivs() {
    // Get elements with ID exactly "gen-sdk", starting with "gen-sdk-", or class "gen-sdk-class"
    const elements = document.querySelectorAll(
      '[id="gen-sdk"], [id^="gen-sdk-"], .gen-sdk-class',
    )

    console.log('Elements found:', elements)
    // Deduplicate using a Set to track element references
    const uniqueElements = new Set<HTMLElement>()
    elements.forEach((element) => {
      uniqueElements.add(element as HTMLElement)
    })

    this.sdkElements = Array.from(uniqueElements)
  }

  /**
   * Set data for different embed instances.
   */
  private setDataForDifferentEmbeds() {}

  private loadSdkOneByOne() {}
}

// Export the singleton instance
export const sdkManager = SDKManager.getInstance()
