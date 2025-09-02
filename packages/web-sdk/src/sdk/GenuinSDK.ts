import { EmbedConfig } from '../types/embed'
import {
  ConfigManager,
  type LegacySDKConfig,
  EventManager,
  SDKEventType,
  type EventListener,
  ErrorHandler,
  ErrorType,
  APIService,
  type BrandDetailsResponse,
  TokenManager,
  ThemeManager,
} from '../core'
import { loadEmbedView, loadRudderStack } from '../views/loader'
import loadIframeIntoDiv from '../iframeLoader'
import {
  generateConfiguredUrl,
  generatePathFromConfig,
  getRandomNumber,
  parsePlacementToEmbedData,
} from '../utils'
import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { BrandDetailsManager } from '@/core/brand-details-manager'
import { loadErrorView } from './react-utils'
import { EmbedDetailsManager } from '@/core/embed-details-manager'

export type ActionType =
  | 'spark'
  | 'comment-spark'
  | 'repost'
  | 'comment'
  | 'report'
  | 'join-community'
  | 'join-group'
  | 'subscribe-group'

/**
 * These are the config when user can pass while genuin.init or genuin.initialize.
 */
type ConfigByUser = {
  embed_id?: string
  api_key?: string
  token?: string
  contextualParams?: {
    page_context?: string
    geo?: {
      lat?: number
      long?: number
    }
    url?: string
  }
  startVideoSlug?: string
  action?: ActionType
}

type SingleEmbedDataConfig = {
  embedId: string
  apiKey: string
  token?: string
  contextualParams?: {
    page_context?: string
    geo?: {
      lat?: number
      long?: number
    }
    url?: string
  }
  brand_ids?: number[]
  startVideoSlug?: string
  action?: ActionType
}

export class GenuinSDK {
  private brandDetailsManager: BrandDetailsManager
  private static instance: GenuinSDK
  private configManager: ConfigManager
  private eventManager: EventManager
  private errorHandler: ErrorHandler
  private apiService: APIService
  private tokenManager: TokenManager
  private themeManager: ThemeManager
  private isInitialized = false
  private embedInstances = new Map<string, any>()
  private embedDetailsManager: EmbedDetailsManager
  private sdkElements: Record<
    string,
    {
      element: HTMLElement
      config: Partial<SingleEmbedDataConfig>
      isInitialzed: boolean
    }
  > = {}

  private constructor() {
    this.configManager = ConfigManager.getInstance()
    this.eventManager = EventManager.getInstance()
    this.errorHandler = ErrorHandler.getInstance()
    this.apiService = APIService.getInstance()
    this.tokenManager = TokenManager.getInstance()
    this.themeManager = ThemeManager.getInstance()
    this.brandDetailsManager = BrandDetailsManager.getInstance()
    this.embedDetailsManager = EmbedDetailsManager.getInstance()
  }

  static getInstance(): GenuinSDK {
    if (!GenuinSDK.instance) {
      GenuinSDK.instance = new GenuinSDK()
    }
    return GenuinSDK.instance
  }

  async newInit(config?: ConfigByUser) {
    console.log('config by user.', config)
    this.getAndSetDivs(config)

    this.initializeAllEmbeds()
  }

  private async initializeAllEmbeds() {
    const sdkElements = this.sdkElements

    if (Object.keys(sdkElements).length === 0) {
      console.warn('No valid SDK elements found for initialization.')
      return
    }

    for (const instanceId in sdkElements) {
      const elementObject = sdkElements[instanceId]
      if (elementObject) {
        const isSdkLoaded = await this.initializeSingleEmbedById(
          elementObject.element,
          elementObject.config,
        )

        if (isSdkLoaded) {
          elementObject.element.setAttribute('data-initialized', 'true')
          elementObject.isInitialzed = true
        } else {
          elementObject.element.setAttribute('data-initialized', 'false')
          elementObject.isInitialzed = false
        }
      } else {
        console.log('No valid object found for element:', instanceId)
      }
    }
  }

  async initializeSingleEmbedById(
    element: HTMLElement,
    config: Partial<SingleEmbedDataConfig>,
  ) {
    if (!config.apiKey || !config.embedId) {
      console.warn('Missing required config properties: embedId or apiKey')
      loadErrorView(element)
      return false
    }

    const brandDetails = await this.brandDetailsManager.getBrandDetails(
      config.apiKey,
    )

    const embedDetails = await this.embedDetailsManager.getEmbedDetails(
      config.embedId,
      brandDetails,
    )

    console.log('embedDetails :>> ', embedDetails, brandDetails)

    return true
  }

  /**
   * Get and set elements with id "gen-sdk", starting with "gen-sdk-", or having gen-sdk-class, and dedupe them.
   */
  private getAndSetDivs(configByUser?: ConfigByUser) {
    // Get elements with ID exactly "gen-sdk", starting with "gen-sdk-", or class "gen-sdk-class"
    const elements = document.querySelectorAll(
      '[id="gen-sdk"], [id^="gen-sdk-"], .gen-sdk-class',
    )

    // Deduplicate using a Set to track element references
    const uniqueElements = new Set<HTMLElement>()
    elements.forEach((element) => {
      uniqueElements.add(element as HTMLElement)
    })

    this.sdkElements = {}

    Array.from(uniqueElements).forEach((element) => {
      const instanceId = this.setInstanceId(element)
      const extractedData = this.extractDataFromSingleDiv(element, configByUser)
      this.sdkElements[instanceId] = {
        element,
        config: extractedData,
        isInitialzed: false,
      }
    })

    return this.sdkElements
  }

  /**
   * Extracts data from a single embed element.
   * @param singleElement The HTML element to extract data from.
   * @param configByUser User-provided configuration.
   * @returns The extracted data.
   */
  private extractDataFromSingleDiv(
    singleElement: HTMLElement,
    configByUser?: ConfigByUser,
  ): Partial<SingleEmbedDataConfig> {
    const possibleAttributeNames = [
      'data-embed-id',
      'data-api-key',
      'data-token',
      'data-lat',
      'data-long',
      'data-url',
      'data-page-context',
      'data-brand-ids',
      'data-video-id',
      'data-action',
    ]
    const answerToReturn: Partial<SingleEmbedDataConfig> = {}

    // extract one by one all data config for embed.
    for (const attr of possibleAttributeNames) {
      const value = singleElement.getAttribute(attr)
      if (value) {
        switch (attr) {
          case 'data-embed-id':
            answerToReturn.embedId = value ?? configByUser?.embed_id
            continue
          case 'data-api-key':
            answerToReturn.apiKey = value ?? configByUser?.api_key
            continue
          case 'data-token':
            answerToReturn.token = value ?? configByUser?.token
            continue
          case 'data-lat':
            answerToReturn.contextualParams =
              answerToReturn.contextualParams || {}
            answerToReturn.contextualParams.geo =
              answerToReturn.contextualParams.geo || {}
            answerToReturn.contextualParams.geo.lat = parseFloat(
              value ?? configByUser?.contextualParams?.geo?.lat,
            )
            continue
          case 'data-long':
            answerToReturn.contextualParams =
              answerToReturn.contextualParams || {}
            answerToReturn.contextualParams.geo =
              answerToReturn.contextualParams.geo || {}
            answerToReturn.contextualParams.geo.long = parseFloat(
              value ?? configByUser?.contextualParams?.geo?.long,
            )
            continue
          case 'data-url':
            answerToReturn.contextualParams =
              answerToReturn.contextualParams || {}
            answerToReturn.contextualParams.url =
              value ?? configByUser?.contextualParams?.url
            continue
          case 'data-page-context':
            answerToReturn.contextualParams =
              answerToReturn.contextualParams || {}
            answerToReturn.contextualParams.page_context =
              value ?? configByUser?.contextualParams?.page_context
            continue
          case 'data-brand-ids':
            answerToReturn.brand_ids = value
              .split(' ')
              .map((item) => parseInt(item))
            continue
          case 'data-video-id':
            answerToReturn.startVideoSlug =
              value ?? configByUser?.startVideoSlug
            continue
          case 'data-action':
            answerToReturn.action = (value ?? configByUser?.action) as
              | ActionType
              | undefined
            continue
        }
      }
    }

    return answerToReturn
  }

  /**
   * Sets a unique instance ID on the element.
   * @param element The HTML element to set the instance ID on.
   * @returns The generated instance ID.
   */
  private setInstanceId(element: HTMLElement) {
    const instanceId = `sdk-instance-${Date.now()}-${getRandomNumber(1, 1000000)}`
    element.setAttribute('data-instance-id', instanceId)
    return instanceId
  }

  /**
   * Legacy initialization method - handles both config objects and DOM-based initialization
   * Maintains full compatibility with existing SDK usage patterns
   */
  async legacyInit(configOrObject?: any): Promise<void> {
    try {
      // Handle callback-based initialization (window.onGenuinReady)
      if (typeof window !== 'undefined' && (window as any).onGenuinReady) {
        return // Legacy callback handler will manage this
      }
      const divs = document.getElementsByClassName('gen-sdk-class')
      const singleEmbed = divs.length === 1
      const firstDiv = divs[0] as HTMLElement | undefined
      if (singleEmbed && configOrObject) {
        console.group(configOrObject)
        if (!configOrObject.embed_id) {
          configOrObject.embed_id = firstDiv?.getAttribute('data-embed-id')
        }

        if (!configOrObject.api_key) {
          configOrObject.api_key = firstDiv?.getAttribute('data-api-key')
        }
        // Single embed initialization with config
        // await this.initializeSingleEmbed(configOrObject)
      } else {
        // Multi-embed initialization from DOM
        // await this.initializeFromDOM(configOrObject)
      }
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.INITIALIZATION_ERROR,
        `Legacy init failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error instanceof Error ? error : undefined },
      )
      console.error(sdkError.message)
      throw new Error(sdkError.message)
    }
  }

  /**
   * Initialize single embed with config object
   */
  // private async initializeSingleEmbed(
  //   configOrObject: { config: LegacySDKConfig } | LegacySDKConfig,
  // ): Promise<void> {
  //   const div = document.getElementById('gen-sdk')
  //   if (!div) {
  //     throw new Error('Div element with id "gen-sdk" is required')
  //   }

  //   if (this.configManager.isContainerInitialized(div)) {
  //     throw new Error(
  //       'SDK is already initialized. Multiple initializations are not allowed.',
  //     )
  //   }

  //   const config =
  //     'config' in configOrObject ? configOrObject.config : configOrObject
  //   const validation = this.configManager.validateLegacyConfig(config)

  //   if (!validation.isValid) {
  //     throw new Error(validation.errorMessage)
  //   }

  //   const instanceId = this.configManager.generateInstanceId()
  //   this.configManager.markContainerInitialized(div, instanceId)

  //   div.style.setProperty('display', 'block')
  //   await this.performLegacySDKInitiation(div, config, instanceId)
  // }

  /**
   * Initialize from DOM elements with data attributes
   */
  // private async initializeFromDOM(configOrObject?: any): Promise<void> {
  //   const embedDivs = document.querySelectorAll(
  //     '.gen-sdk-class:not([data-initialized])',
  //   )

  //   if (embedDivs.length === 0) {
  //     throw new Error('No embed divs found')
  //   }

  //   for (const div of embedDivs) {
  //     try {
  //       const validation = this.configManager.validateDivAttributes(div)
  //       if (!validation.isValid) {
  //         console.error(`Skipping div: ${validation.errorMessage}`)
  //         continue
  //       }

  //       const instanceId = this.configManager.generateInstanceId()
  //       this.configManager.markContainerInitialized(
  //         div as HTMLElement,
  //         instanceId,
  //       )

  //       // Extract config from DOM attributes
  //       const config = this.extractConfigFromDOM(div, configOrObject)
  //       await this.performLegacySDKInitiation(
  //         div as HTMLElement,
  //         config,
  //         instanceId,
  //       )
  //     } catch (error) {
  //       console.error(`Failed to initialize embed div:`, error)
  //     }
  //   }
  // }

  /**
   * Extract configuration from DOM element attributes
   */
  // private extractConfigFromDOM(
  //   div: Element,
  //   sourceConfig?: any,
  // ): LegacySDKConfig {
  //   const isConfigObject =
  //     typeof sourceConfig === 'object' &&
  //     sourceConfig !== null &&
  //     'config' in sourceConfig

  //   const source = isConfigObject ? sourceConfig.config : sourceConfig || {}

  //   return {
  //     placement_id: div.getAttribute('data-placement-id') ?? '',
  //     style_id: div.getAttribute('data-style-id') ?? '',
  //     embed_id: div.getAttribute('data-embed-id') ?? '',
  //     api_key: div.getAttribute('data-api-key') ?? '',
  //     token: source.token ?? '',
  //     contextualParams: {
  //       page_context: div.getAttribute('data-page-context') || null,
  //       geo: {
  //         lat: div.getAttribute('data-lat') || null,
  //         long: div.getAttribute('data-long') || null,
  //       },
  //       url: div.getAttribute('data-url') || null,
  //     },
  //     brand_ids:
  //       div
  //         .getAttribute('data-brand-ids')
  //         ?.split(' ')
  //         .map((item) => parseInt(item)) || [],
  //     params: source.params ?? '',
  //     video: source.video ?? '',
  //     action: source.action ?? '',
  //     authInfo: source.authInfo,
  //   }
  // }

  /**
   * Core SDK initiation logic - handles all the critical legacy functionality
   */
  private async performLegacySDKInitiation(
    container: HTMLElement,
    config: LegacySDKConfig,
    instanceId: string,
  ): Promise<void> {
    // Set legacy config for API compatibility
    this.configManager.setLegacyConfig(config)

    // Critical validation: API key required
    if (config.embed_id && !config.api_key) {
      console.log('API key is required for initializing the SDK')
      this.showApiKeyError(container)
      return
    }

    if (!config.api_key) {
      console.warn('Missing API key for', instanceId)
    }

    let brandData: BrandDetailsResponse | null = null

    // Fetch brand details if API key provided
    if (config.api_key) {
      try {
        brandData = await this.apiService.fetchBrandDetails(config.api_key)

        // Update config with brand data
        config.brand_id = brandData.brand_id
        config.subdomain = brandData.subdomain
        config.brand_colors = brandData.brand_colors
        config.name = brandData.name
      } catch (error) {
        console.error('Failed to fetch brand details:', error)
        loadErrorView(container)
        return
      }
    } else {
      config.subdomain = 'app'
    }

    config.embed = 1

    // Initialize analytics
    if (config.embed_id) {
      loadRudderStack()
    }

    // Fetch embed data
    let embedData: Partial<EmbedDataType> = {
      embed_id: config.embed_id,
      placement_id: config.placement_id,
      style_id: config.style_id,
    }

    if (config.placement_id) {
      try {
        const fetchedPlacementData = await this.apiService.fetchPlacementData(
          config.placement_id,
        )
        embedData = {
          ...embedData,
          ...parsePlacementToEmbedData(fetchedPlacementData),
        }
      } catch (error) {
        console.error('Failed to fetch placement data:', error)
        loadErrorView(container)
        return
      }
    } else if (config.embed_id && config.embed_id !== 'preview') {
      try {
        const fetchedEmbedData = await this.apiService.fetchEmbedData(
          config.embed_id,
        )
        embedData = { ...embedData, ...fetchedEmbedData }
      } catch (error) {
        console.error('Failed to fetch embed data:', error)
        loadErrorView(container)
        return
      }
    }

    // Override style and type if specified in config
    if (config.style) embedData.style = config.style
    if (config.type) embedData.type = config.type

    // Handle supported embed styles
    if (
      embedData.style === 'carousel' ||
      embedData.style === 'feed' ||
      embedData.style === 'standard_wall' ||
      embedData.style === 'grid' ||
      embedData.style === 'dynamic'
    ) {
      await this.setupEmbedView(
        container,
        config,
        embedData,
        brandData,
        instanceId,
      )
    } else {
      // Fallback to iframe mode for unsupported styles
      this.setupIframeMode(container, config)
    }
  }

  /**
   * Setup embed view with React components
   */
  private async setupEmbedView(
    container: HTMLElement,
    config: LegacySDKConfig,
    embedData: any,
    brandData: BrandDetailsResponse | null,
    instanceId: string,
  ): Promise<void> {
    // Apply live customization
    if (config.live_customization_data) {
      Object.assign(embedData.customization, config.live_customization_data)
    }

    // Apply special brand customizations
    if (config.brand_id) {
      embedData.customization =
        this.themeManager.applySpecialBrandCustomizations(
          config.brand_id,
          embedData.customization,
        )
    }

    // Apply brand colors and theme
    this.themeManager.applyBrandColors(container, config.brand_colors)
    this.themeManager.applyTheme(container, embedData.customization)

    // Handle authentication
    const user = await this.tokenManager.handleConfigAuth({
      token: config.token,
      brand_id: config.brand_id,
      params: config.params,
    })

    // Set additional embed data
    embedData.embed_id = config.embed_id
    embedData.brandDetails = brandData || {}
    embedData.startVideoSlug =
      container.getAttribute('data-video-id') ?? config.video
    embedData.action = container.getAttribute('data-action') ?? config.action

    if (config.authInfo) {
      embedData.authInfo = config.authInfo
    }

    // Store embed instance
    this.embedInstances.set(instanceId, {
      embedData,
      container,
      user,
      brandName: config.name,
    })

    // Load the embed view
    loadEmbedView(container, embedData, user ?? undefined, config.name)

    // Emit events
    this.eventManager.emit(SDKEventType.EMBED_LOADED, {
      embedId: config.embed_id,
      instanceId,
      config,
    })
  }

  /**
   * Setup iframe mode for unsupported embed styles
   */
  private setupIframeMode(
    container: HTMLElement,
    config: LegacySDKConfig,
  ): void {
    const path = '/'
    const params: Record<string, string | boolean | number> = {}

    for (const key in config) {
      const value = config[key as keyof LegacySDKConfig]
      if (value !== undefined) {
        params[key] = value
      }
    }

    loadIframeIntoDiv(
      container,
      generateConfiguredUrl(
        generatePathFromConfig(config as LegacySDKConfig, path),
        params,
        config.subdomain || '',
      ),
    )
  }

  /**
   * Show API key error message
   */
  private showApiKeyError(container: HTMLElement): void {
    const errorElement = document.createElement('div')
    errorElement.style.display = 'flex'
    errorElement.style.justifyContent = 'center'
    errorElement.style.alignItems = 'center'
    errorElement.style.height = '100%'
    errorElement.style.width = '100%'
    errorElement.textContent = 'API Key is Required'
    container.appendChild(errorElement)
  }

  /**
   * Update contextual parameters (legacy update method)
   */
  legacyUpdate(params: {
    contextualParams: LegacySDKConfig['contextualParams']
    id?: string | null
  }): void {
    try {
      // Find the target embed instance
      const instanceId = params.id || this.getLastElementId()
      const embed = this.embedInstances.get(instanceId)

      if (!embed) return
      if (!embed.container?.getAttribute('data-initialized')) return
      if (!embed.embedData) return

      // Validate that new contextual parameters are provided
      if (
        !params.contextualParams ||
        (!params.contextualParams.page_context &&
          !params.contextualParams.url &&
          !params.contextualParams.geo?.lat &&
          !params.contextualParams.geo?.long)
      ) {
        return
      }

      // Merge new contextual parameters
      embed.embedData.contextualParams = {
        ...embed.embedData.contextualParams,
        ...params.contextualParams,
      }

      // Reload the embed view
      loadEmbedView(
        embed.container,
        embed.embedData,
        embed.user,
        embed.brandName,
      )

      this.eventManager.emit(SDKEventType.CONTENT_UPDATED, {
        instanceId,
        contextualParams: params.contextualParams,
      })
    } catch (error) {
      console.error('Failed to update embed:', error)
    }
  }

  /**
   * Get the last element ID (for backwards compatibility)
   */
  private getLastElementId(): string {
    const instances = Array.from(this.embedInstances.keys())
    return instances[instances.length - 1] || ''
  }

  /**
   * Initialize div with callback (for window.onGenuinReady support)
   */
  initializeDivWithCallback(
    div: HTMLElement,
    callback: (sdk: any) => void,
  ): void {
    if (!callback || !div) {
      console.error('Invalid callback or div for instance')
      return
    }

    const instanceId = this.configManager.generateInstanceId()
    div.setAttribute('data-instance-id', instanceId)
    let gConfig: LegacySDKConfig

    callback({
      initialize: (sdkconfig: LegacySDKConfig) => {
        gConfig = {
          api_key: sdkconfig.api_key || '',
          embed_id: sdkconfig.embed_id || '',
          ...sdkconfig,
        }
        div.style.setProperty('display', 'block')
        this.performLegacySDKInitiation(div, gConfig, instanceId)
      },
      loadPage: (page: string) => {
        this.loadPageByPage(div, page, gConfig?.subdomain)
      },
      setUser: (user: any) => {
        console.log('user :>> ', user)
      },
    })
  }

  /**
   * Load a page into the container (legacy method)
   */
  private loadPageByPage(
    container: HTMLElement,
    page: string,
    subdomain?: string,
  ): void {
    const param = {
      embed: 1,
      subdomain: subdomain,
      hide_navbar: 0,
      api_key: '',
    }
    loadIframeIntoDiv(
      container,
      generateConfiguredUrl(page, param, subdomain ?? ''),
    )
  }

  /**
   * Initialize the SDK with configuration
   */
  init(config: EmbedConfig): void {
    try {
      this.configManager.setConfig(config)
      this.isInitialized = true
      this.eventManager.emit(SDKEventType.EMBED_LOADED, { config })
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.INITIALIZATION_ERROR,
        `Failed to initialize SDK: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error instanceof Error ? error : undefined },
      )
      throw new Error(sdkError.message)
    }
  }

  /**
   * Update embed configuration
   */
  updateConfig(updates: Partial<EmbedConfig>): void {
    try {
      this.configManager.updateConfig(updates)
      this.eventManager.emit(SDKEventType.CONTENT_UPDATED, { updates })
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.CONFIGURATION_ERROR,
        `Failed to update config: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error instanceof Error ? error : undefined },
      )
      throw new Error(sdkError.message)
    }
  }

  /**
   * Subscribe to SDK events
   */
  on(eventType: SDKEventType, listener: EventListener): () => void {
    return this.eventManager.on(eventType, listener)
  }

  /**
   * Unsubscribe from SDK events
   */
  off(eventType: SDKEventType, listener: EventListener): void {
    this.eventManager.off(eventType, listener)
  }

  /**
   * Subscribe to all SDK events
   */
  onAll(listener: EventListener): () => void {
    return this.eventManager.onAll(listener)
  }

  /**
   * Get current configuration
   */
  getConfig(): EmbedConfig {
    return this.configManager.getConfig()
  }

  /**
   * Check if SDK is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }

  /**
   * Get error history
   */
  getErrors(): any[] {
    return this.errorHandler.getErrors()
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errorHandler.clearErrors()
  }

  /**
   * Destroy all embeds and reset SDK
   */
  destroy(): void {
    // Remove all iframes
    const iframes = document.querySelectorAll('iframe[data-genuin-embed]')
    iframes.forEach((iframe) => iframe.remove())

    // Clear all listeners and state
    this.eventManager.removeAllListeners()
    this.errorHandler.clearErrors()
    this.configManager.reset()
    this.isInitialized = false

    this.eventManager.emit(SDKEventType.EMBED_LOADED, { destroyed: true })
  }
}

// Export singleton instance
export const Genuin = GenuinSDK.getInstance()
