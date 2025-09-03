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
import { BrandDetailsManager } from '@/core/brand-details-manager'
import { loadErrorView, loadNewEmbed } from './react-utils'
import { EmbedDetailsManager } from '@/core/embed-details-manager'
import { AuthUser } from '@genuin/components/types/auth'
import {
  BrandDetailsConfigType,
  EmbedDataType,
} from '@genuin/components/context/embed/embed.types'

export type ActionType =
  | 'spark'
  | 'comment-spark'
  | 'repost'
  | 'comment'
  | 'report'
  | 'join-community'
  | 'join-group'
  | 'subscribe-group'

type AuthUserParams = {
  name?: string | null
  mobile?: string | null
  email?: string | null
  nickname?: string | null
  profileImage?: string | null
  brandUserIdentity?: string | null
}

type AuthInfoType = {
  signInUrl: string
  signUpUrl: string
}

type InitializationStatus = 'pending' | 'loading' | 'done'

type ContextualParamsType = {
  page_context?: string
  geo?: {
    lat?: number
    long?: number
  }
  url?: string
}

/**
 * These are the config when user can pass while genuin.init or genuin.initialize.
 */
type ConfigByUser = {
  embed_id?: string
  api_key?: string
  token?: string
  contextualParams?: ContextualParamsType
  startVideoSlug?: string
  action?: ActionType
  params?: AuthUserParams
  authInfo: AuthInfoType
}

type UpdateConfigByUserType = {
  token: string
  userParams: Record<string, any>
  contextualParams?: ContextualParamsType
  embedId: string
}

type SDKElementsType = Record<
  string,
  {
    element: HTMLElement
    config: Partial<SingleEmbedDataConfig>
    status: InitializationStatus
  }
>

export type SingleEmbedDataConfig = {
  embedId: string
  apiKey: string
  /**
   * Brand id of the embed.
   */
  token?: string
  contextualParams?: {
    page_context?: string
    geo?: {
      lat?: number
      long?: number
    }
    url?: string
  }
  brandIds?: number[]
  startVideoSlug?: string
  action?: ActionType
  params?: AuthUserParams
  authInfo?: AuthInfoType
  embedDetails?: EmbedDataType
  brandDetails?: BrandDetailsConfigType
}

export class GenuinSDK {
  private brandDetailsManager: BrandDetailsManager
  private static instance: GenuinSDK
  private configManager: ConfigManager
  private eventManager: EventManager
  private errorHandler: ErrorHandler
  // private apiService: APIService
  private tokenManager: TokenManager
  // private themeManager: ThemeManager
  private isInitialized = false
  // private embedInstances = new Map<string, any>()
  private embedDetailsManager: EmbedDetailsManager
  private sdkElements: SDKElementsType = {}

  private constructor() {
    this.configManager = ConfigManager.getInstance()
    this.eventManager = EventManager.getInstance()
    this.errorHandler = ErrorHandler.getInstance()
    // this.apiService = APIService.getInstance()
    this.tokenManager = TokenManager.getInstance()
    // this.themeManager = ThemeManager.getInstance()
    this.brandDetailsManager = BrandDetailsManager.getInstance()
    this.embedDetailsManager = EmbedDetailsManager.getInstance()
  }

  static getInstance(): GenuinSDK {
    if (!GenuinSDK.instance) {
      GenuinSDK.instance = new GenuinSDK()
    }
    return GenuinSDK.instance
  }

  /**
   * Initializes the SDK with the provided configuration.
   * This is new init method which will replace legacyInit.
   * @param config User-provided configuration for the SDK.
   */
  async newInit(config?: ConfigByUser) {
    this.getAndSetDivs(config)

    this.initializeAllEmbeds()
  }

  async newUpdate(config?: UpdateConfigByUserType) {
    // In case of token comes authenticateUser, this function will authenticate user in all the embeds.
    if (config?.token) {
      await this.authenticateUser({
        token: config.token,
        userParams: config.userParams,
      })
    }

    // Update contextual params in the embed, if embedId is passed then only in that embed otherwise in all the embeds.
    if (config?.contextualParams) {
      this.updateContextualParamsInEmbed({
        contextualParams: config.contextualParams,
        embedId: config.embedId,
      })
    }
  }

  /**
   * To initialize all embeds found on the page.
   */
  private async initializeAllEmbeds() {
    const sdkElements = this.sdkElements

    if (Object.keys(sdkElements).length === 0) {
      console.warn('No valid SDK elements found for initialization.')
      return
    }

    for (const instanceId in sdkElements) {
      const elementObject = sdkElements[instanceId]
      if (
        elementObject &&
        this.getInitializationStatus(elementObject.element) === 'pending'
      ) {
        this.setInitializationStatus(elementObject.element, 'loading')
        elementObject.status = 'loading'
        const isSdkLoaded = await this.initializeSingleEmbedById(
          elementObject.element,
          elementObject.config,
        )

        if (isSdkLoaded) {
          this.setInitializationStatus(elementObject.element, 'done')
          elementObject.status = 'done'
        } else {
          this.setInitializationStatus(elementObject.element, 'pending')
          elementObject.status = 'pending'
        }
      } else {
        console.log(
          'No valid object found for element or already initialized::',
          instanceId,
        )
      }
    }
  }

  /**
   * Initializes a single embed instance.
   * @param element The HTML element to initialize.
   * @param config The configuration for the embed.
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  async initializeSingleEmbedById(
    element: HTMLElement,
    config: Partial<SingleEmbedDataConfig>,
  ) {
    if (!config.apiKey || !config.embedId) {
      console.warn('Missing required config properties: embedId or apiKey')
      loadErrorView(element)
      return false
    }

    // Handle error at single embed level so that other embeds doesn't get affected.
    try {
      // This is where we get the brand details
      const brandDetails = await this.brandDetailsManager.getBrandDetails(
        config.apiKey,
      )

      const embedDetails = await this.embedDetailsManager.getEmbedDetails(
        config.embedId,
        brandDetails,
      )

      // set the brand-details and embed-details to the sdkElements for future reference.
      config.brandDetails = brandDetails
      config.embedDetails = embedDetails

      let user: AuthUser | undefined

      if (config.token) {
        user =
          (await this.authenticateUser({
            token: config.token,
            userParams: config.params,
          })) ?? undefined
      }

      loadNewEmbed({
        container: element,
        embedData: embedDetails,
        brandDetails,
        config,
        user,
      })
    } catch (errpr) {
      loadErrorView(element)
    }

    return true
  }

  private async updateContextualParamsInEmbed({
    contextualParams,
    embedId,
  }: {
    contextualParams: ContextualParamsType
    embedId?: string
  }) {
    const isSingleEmbed = Object.keys(this.sdkElements).length === 1

    if (isSingleEmbed) {
      const firstEmbedId = Object.keys(this.sdkElements)[0]
      if (firstEmbedId) {
        const embedId =
          this.sdkElements[firstEmbedId]?.config.embedDetails?.embed_id
      }
    }

    if (!embedId) {
      console.warn('Embed id is not provided to update the contextual params')
    }

    this.eventManager.emit(SDKEventType.SDK_UPDATE_CONTEXTUAL_PARAMS, {
      embedId,
      contextualParams,
    })
  }

  /**
   * Authenticates a user with the provided token and user parameters.
   * @param token The authentication token.
   * @param userParams Additional user parameters.
   * @returns The authenticated user or null if authentication fails.
   */
  private async authenticateUser({
    token,
    userParams,
  }: {
    token: string
    userParams?: Record<string, any>
  }) {
    try {
      const brandId = Object.values(this.sdkElements)[0]?.config?.brandDetails
        ?.brand_id

      let user: AuthUser | null
      // without brandId we can't authenticate the user.
      if (brandId) {
        user = await this.tokenManager.getCurrentUser({
          token,
          params: userParams,
          // There won't be multiple brands embeds on one page So by default taking first embed's brandId.
          brandId,
        })
        this.eventManager.emit(SDKEventType.SDK_AUTHENTICATE_USER, user)
        return user
      }
    } catch (error) {
      console.error('Failed to authenticate user:', error)
    }

    return
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
      if (this.getInitializationStatus(element as HTMLElement) === 'pending') {
        uniqueElements.add(element as HTMLElement)
      } else {
        console.log('Embed already initialized in element:', element)
      }
    })

    Array.from(uniqueElements).forEach((element) => {
      const instanceId = this.setInstanceId(element)
      const extractedData = this.extractDataFromSingleDiv(element, configByUser)
      this.sdkElements[instanceId] = {
        element,
        config: extractedData,
        status: 'pending',
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
      let value = singleElement.getAttribute(attr)
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
          value =
            typeof value === 'string'
              ? value
              : typeof configByUser?.contextualParams?.geo?.lat === 'string'
                ? configByUser?.contextualParams?.geo?.lat
                : value !== undefined
                  ? String(value)
                  : null
          if (typeof value === 'string') {
            const parsedValue = parseFloat(value)
            if (!isNaN(parsedValue)) {
              answerToReturn.contextualParams.geo.lat = parsedValue
            }
          } else if (typeof value === 'number') {
            answerToReturn.contextualParams.geo.lat = value
          }
          continue
        case 'data-long':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          answerToReturn.contextualParams.geo =
            answerToReturn.contextualParams.geo || {}
          const longValue = value ?? configByUser?.contextualParams?.geo?.long
          if (typeof longValue === 'string') {
            const parsedLong = parseFloat(longValue)
            if (!isNaN(parsedLong)) {
              answerToReturn.contextualParams.geo.long = parsedLong
            }
          } else if (typeof longValue === 'number') {
            answerToReturn.contextualParams.geo.long = longValue
          }
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
          if (value) {
            answerToReturn.brandIds = value
              .split(' ')
              .map((item) => parseInt(item))
          }
          continue
        case 'data-video-id':
          answerToReturn.startVideoSlug = value ?? configByUser?.startVideoSlug
          continue
        case 'data-action':
          answerToReturn.action = (value ?? configByUser?.action) as
            | ActionType
            | undefined
          continue
      }
    }

    // extras needed to set explicitly from user config.
    answerToReturn.params = configByUser?.params
    answerToReturn.authInfo = configByUser?.authInfo

    return answerToReturn
  }

  /**
   * Checks the initialization status of the element.
   * @param element The HTML element to check.
   * @returns The initialization status: 'pending', 'loading', or 'done'.
   */
  private getInitializationStatus(element: HTMLElement): InitializationStatus {
    const status = element.getAttribute('data-status')
    if (status === 'pending' || status === 'loading' || status === 'done') {
      return status
    }
    return 'pending' // Default to pending if not set or invalid
  }

  /**
   * Sets the initialization status of the element.
   * @param element The HTML element to set the status on.
   * @param status The initialization status to set: 'pending', 'loading', or 'done'.
   */
  private setInitializationStatus(
    element: HTMLElement,
    status: InitializationStatus,
  ): void {
    element.setAttribute('data-status', status)
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
   * Core SDK initiation logic - handles all the critical legacy functionality
   */
  // private async performLegacySDKInitiation(
  //   container: HTMLElement,
  //   config: LegacySDKConfig,
  //   instanceId: string,
  // ): Promise<void> {
  //   // Set legacy config for API compatibility
  //   this.configManager.setLegacyConfig(config)

  //   // Critical validation: API key required
  //   if (config.embed_id && !config.api_key) {
  //     console.log('API key is required for initializing the SDK')
  //     this.showApiKeyError(container)
  //     return
  //   }

  //   if (!config.api_key) {
  //     console.warn('Missing API key for', instanceId)
  //   }

  //   let brandData: BrandDetailsResponse | null = null

  //   // Fetch brand details if API key provided
  //   if (config.api_key) {
  //     try {
  //       brandData = await this.apiService.fetchBrandDetails(config.api_key)

  //       // Update config with brand data
  //       config.brand_id = brandData.brand_id
  //       config.subdomain = brandData.subdomain
  //       config.brand_colors = brandData.brand_colors
  //       config.name = brandData.name
  //     } catch (error) {
  //       console.error('Failed to fetch brand details:', error)
  //       loadErrorView(container)
  //       return
  //     }
  //   } else {
  //     config.subdomain = 'app'
  //   }

  //   config.embed = 1

  //   // Initialize analytics
  //   if (config.embed_id) {
  //     loadRudderStack()
  //   }

  //   // Fetch embed data
  //   let embedData: Partial<EmbedDataType> = {
  //     embed_id: config.embed_id,
  //     placement_id: config.placement_id,
  //     style_id: config.style_id,
  //   }

  //   if (config.placement_id) {
  //     try {
  //       const fetchedPlacementData = await this.apiService.fetchPlacementData(
  //         config.placement_id,
  //       )
  //       embedData = {
  //         ...embedData,
  //         ...parsePlacementToEmbedData(fetchedPlacementData),
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch placement data:', error)
  //       loadErrorView(container)
  //       return
  //     }
  //   } else if (config.embed_id && config.embed_id !== 'preview') {
  //     try {
  //       const fetchedEmbedData = await this.apiService.fetchEmbedData(
  //         config.embed_id,
  //       )
  //       embedData = { ...embedData, ...fetchedEmbedData }
  //     } catch (error) {
  //       console.error('Failed to fetch embed data:', error)
  //       loadErrorView(container)
  //       return
  //     }
  //   }

  //   // Override style and type if specified in config
  //   if (config.style) embedData.style = config.style
  //   if (config.type) embedData.type = config.type

  //   // Handle supported embed styles
  //   if (
  //     embedData.style === 'carousel' ||
  //     embedData.style === 'feed' ||
  //     embedData.style === 'standard_wall' ||
  //     embedData.style === 'grid' ||
  //     embedData.style === 'dynamic'
  //   ) {
  //     await this.setupEmbedView(
  //       container,
  //       config,
  //       embedData,
  //       brandData,
  //       instanceId,
  //     )
  //   } else {
  //     // Fallback to iframe mode for unsupported styles
  //     this.setupIframeMode(container, config)
  //   }
  // }

  /**
   * Setup embed view with React components
   */
  // private async setupEmbedView(
  //   container: HTMLElement,
  //   config: LegacySDKConfig,
  //   embedData: any,
  //   brandData: BrandDetailsResponse | null,
  //   instanceId: string,
  // ): Promise<void> {
  //   // Apply live customization
  //   if (config.live_customization_data) {
  //     Object.assign(embedData.customization, config.live_customization_data)
  //   }

  //   // Apply special brand customizations
  //   if (config.brand_id) {
  //     embedData.customization =
  //       this.themeManager.applySpecialBrandCustomizations(
  //         config.brand_id,
  //         embedData.customization,
  //       )
  //   }

  //   // Apply brand colors and theme
  //   this.themeManager.applyBrandColors(container, config.brand_colors)
  //   this.themeManager.applyTheme(container, embedData.customization)

  //   // Handle authentication
  //   const user = await this.tokenManager.handleConfigAuth({
  //     token: config.token,
  //     brand_id: config.brand_id,
  //     params: config.params,
  //   })

  //   // Set additional embed data
  //   embedData.embed_id = config.embed_id
  //   embedData.brandDetails = brandData || {}
  //   embedData.startVideoSlug =
  //     container.getAttribute('data-video-id') ?? config.video
  //   embedData.action = container.getAttribute('data-action') ?? config.action

  //   if (config.authInfo) {
  //     embedData.authInfo = config.authInfo
  //   }

  //   // Store embed instance
  //   this.embedInstances.set(instanceId, {
  //     embedData,
  //     container,
  //     user,
  //     brandName: config.name,
  //   })

  //   // Load the embed view
  //   loadEmbedView(container, embedData, user ?? undefined, config.name)

  //   // Emit events
  //   this.eventManager.emit(SDKEventType.EMBED_LOADED, {
  //     embedId: config.embed_id,
  //     instanceId,
  //     config,
  //   })
  // }

  /**
   * Setup iframe mode for unsupported embed styles
   */
  // private setupIframeMode(
  //   container: HTMLElement,
  //   config: LegacySDKConfig,
  // ): void {
  //   const path = '/'
  //   const params: Record<string, string | boolean | number> = {}

  //   for (const key in config) {
  //     const value = config[key as keyof LegacySDKConfig]
  //     if (value !== undefined) {
  //       params[key] = value
  //     }
  //   }

  //   loadIframeIntoDiv(
  //     container,
  //     generateConfiguredUrl(
  //       generatePathFromConfig(config as LegacySDKConfig, path),
  //       params,
  //       config.subdomain || '',
  //     ),
  //   )
  // }

  /**
   * Show API key error message
   */
  // private showApiKeyError(container: HTMLElement): void {
  //   const errorElement = document.createElement('div')
  //   errorElement.style.display = 'flex'
  //   errorElement.style.justifyContent = 'center'
  //   errorElement.style.alignItems = 'center'
  //   errorElement.style.height = '100%'
  //   errorElement.style.width = '100%'
  //   errorElement.textContent = 'API Key is Required'
  //   container.appendChild(errorElement)
  // }

  /**
   * Update contextual parameters (legacy update method)
   */
  // legacyUpdate(params: {
  //   contextualParams: LegacySDKConfig['contextualParams']
  //   id?: string | null
  // }): void {
  //   try {
  //     // Find the target embed instance
  //     const instanceId = params.id || this.getLastElementId()
  //     const embed = this.embedInstances.get(instanceId)

  //     if (!embed) return
  //     if (!embed.container?.getAttribute('data-initialized')) return
  //     if (!embed.embedData) return

  //     // Validate that new contextual parameters are provided
  //     if (
  //       !params.contextualParams ||
  //       (!params.contextualParams.page_context &&
  //         !params.contextualParams.url &&
  //         !params.contextualParams.geo?.lat &&
  //         !params.contextualParams.geo?.long)
  //     ) {
  //       return
  //     }

  //     // Merge new contextual parameters
  //     embed.embedData.contextualParams = {
  //       ...embed.embedData.contextualParams,
  //       ...params.contextualParams,
  //     }

  //     // Reload the embed view
  //     loadEmbedView(
  //       embed.container,
  //       embed.embedData,
  //       embed.user,
  //       embed.brandName,
  //     )

  //     this.eventManager.emit(SDKEventType.CONTENT_UPDATED, {
  //       instanceId,
  //       contextualParams: params.contextualParams,
  //     })
  //   } catch (error) {
  //     console.error('Failed to update embed:', error)
  //   }
  // }

  /**
   * Get the last element ID (for backwards compatibility)
   */
  // private getLastElementId(): string {
  //   const instances = Array.from(this.embedInstances.keys())
  //   return instances[instances.length - 1] || ''
  // }

  /**
   * Initialize div with callback (for window.onGenuinReady support)
   */
  // initializeDivWithCallback(
  //   div: HTMLElement,
  //   callback: (sdk: any) => void,
  // ): void {
  //   if (!callback || !div) {
  //     console.error('Invalid callback or div for instance')
  //     return
  //   }

  //   const instanceId = this.configManager.generateInstanceId()
  //   div.setAttribute('data-instance-id', instanceId)
  //   let gConfig: LegacySDKConfig

  //   callback({
  //     initialize: (sdkconfig: LegacySDKConfig) => {
  //       gConfig = {
  //         api_key: sdkconfig.api_key || '',
  //         embed_id: sdkconfig.embed_id || '',
  //         ...sdkconfig,
  //       }
  //       div.style.setProperty('display', 'block')
  //       this.performLegacySDKInitiation(div, gConfig, instanceId)
  //     },
  //     loadPage: (page: string) => {
  //       this.loadPageByPage(div, page, gConfig?.subdomain)
  //     },
  //     setUser: (user: any) => {
  //       console.log('user :>> ', user)
  //     },
  //   })
  // }

  /**
   * Load a page into the container (legacy method)
   */
  // private loadPageByPage(
  //   container: HTMLElement,
  //   page: string,
  //   subdomain?: string,
  // ): void {
  //   const param = {
  //     embed: 1,
  //     subdomain: subdomain,
  //     hide_navbar: 0,
  //     api_key: '',
  //   }
  //   loadIframeIntoDiv(
  //     container,
  //     generateConfiguredUrl(page, param, subdomain ?? ''),
  //   )
  // }

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
