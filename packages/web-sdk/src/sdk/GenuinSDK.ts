import { EmbedConfig } from '../types/embed'
import {
  ConfigManager,
  EventManager,
  SDKEventType,
  type EventListener,
  ErrorHandler,
  ErrorType,
  TokenManager,
  ThemeManager,
} from '../core'
import { getRandomNumber } from '../utils'
import { BrandDetailsManager } from '@/core/brand-details-manager'
import { loadErrorView, loadNewEmbed } from './react-utils'
import { EmbedDetailsManager } from '@/core/embed-details-manager'
import { AuthUser } from '@genuin/components/types/auth'
import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { CallbackQueueManager } from '@/core/callback-queue-manager'
import { PlacementManager } from '@/core/placement-manager'
import { ActionType } from '@genuin/components/context/embed/embed.types'
import {
  ConfigByUser,
  ContextualParamsType,
  InitializationStatus,
  SDKElementsType,
  SingleEmbedDataConfig,
  UpdateConfigByUserType,
} from '@/type'

export class GenuinSDK {
  private brandDetailsManager: BrandDetailsManager
  private static instance: GenuinSDK
  private configManager: ConfigManager
  private eventManager: EventManager
  private errorHandler: ErrorHandler
  private tokenManager: TokenManager
  private themeManager: ThemeManager
  /**
   * This variable is used to track if the SDK has been initialized.
   */
  private isInitialized = false
  private embedDetailsManager: EmbedDetailsManager
  private sdkElements: SDKElementsType = {}
  private callbackQueueManager: CallbackQueueManager
  private placementManager: PlacementManager

  private constructor() {
    this.configManager = ConfigManager.getInstance()
    this.eventManager = EventManager.getInstance()
    this.errorHandler = ErrorHandler.getInstance()
    this.tokenManager = TokenManager.getInstance()
    this.themeManager = ThemeManager.getInstance()
    this.brandDetailsManager = BrandDetailsManager.getInstance()
    this.embedDetailsManager = EmbedDetailsManager.getInstance()
    this.callbackQueueManager = new CallbackQueueManager()
    this.placementManager = PlacementManager.getInstance()
  }

  static getInstance(): GenuinSDK {
    if (!GenuinSDK.instance) {
      GenuinSDK.instance = new GenuinSDK()
    }
    return GenuinSDK.instance
  }

  /**
   * Initialize div with callback (for window.onGenuinReady support)
   * @param div The div element to initialize.
   * @param callback The callback to execute once initialization is complete.
   * @deprecated
   */
  newInitWithCallback(div: HTMLElement, callback: (sdk: any) => void): void {
    if (!callback || !div) {
      console.error('Invalid callback or div for instance')
      return
    }

    callback({
      initialize: (sdkconfig: ConfigByUser) => {
        this.newInit(sdkconfig)
      },
    })
  }

  /**
   * This function is used for backward compatibility.
   * @param config
   * @deprecated
   */
  initialize(config?: ConfigByUser): void {
    this.newInit(config)
  }

  /**
   * Initializes the SDK with the provided configuration.
   * This is new init method which will replace legacyInit.
   * @param config User-provided configuration for the SDK.
   */
  async newInit(config?: ConfigByUser) {
    this.getAndSetDivs(config)

    await this.initializeAllEmbeds()

    this.isInitialized = true
    this.callbackQueueManager.executeAllCallbacks()
  }

  async newUpdate(config?: UpdateConfigByUserType) {
    // if sdk is not initialized then queue the update call.
    if (!this.isInitialized) {
      this.callbackQueueManager.enqueue(
        () => this._performUpdate(config),
        config,
      )
      return
    }
    await this._performUpdate(config)
  }

  private async _performUpdate(config?: UpdateConfigByUserType) {
    // In case of token comes authenticateUser, this function will authenticate user in all the embeds.
    if (config?.token) {
      await this.authenticateUser({
        token: config.token,
        userParams: config.user_params,
      })
    }

    // Update contextual params in the embed, if embedId is passed then only in that embed otherwise in all the embeds.
    if (config?.contextual_params) {
      await this.updateContextualParamsInEmbed({
        contextualParams: config.contextual_params,
        embedId: config.embed_id,
      })
    }

    if (config?.start_video_slug) {
      await this.updateStartVideoId({
        startVideoSlug: config.start_video_slug,
        embedId: config.embed_id,
        action: config.action,
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

    for await (const instanceId of Object.keys(sdkElements)) {
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
    // Handle error at single embed level so that other embeds doesn't get affected.
    try {
      // This is where we get the brand details
      const brandDetails = await this.brandDetailsManager.getBrandDetails(
        config.apiKey,
      )

      // Get embed details based on configuration
      await this.getEmbedDetails(config, brandDetails)

      const embedDetails = config.embedDetails!

      // set the brand-details and embed-details to the sdkElements for future reference.
      config.brandDetails = brandDetails

      // If there is user already then use that authed user.
      let user: AuthUser | undefined | null = this.tokenManager.getCachedUser()

      if (config.token) {
        user =
          (await this.authenticateUser({
            token: config.token,
            userParams: config.params,
          })) ?? undefined
      }

      // Apply brand colors to the element
      this.themeManager.applyBrandColors(element, brandDetails.brand_colors)
      console.log('onfig::', config)
      loadNewEmbed({
        container: element,
        embedData: embedDetails,
        brandDetails,
        config,
        user,
      })
    } catch (error) {
      console.error('Error initializing embed:', error)
      loadErrorView(element)
    }

    return true
  }

  /**
   * Retrieves embed details based on the provided configuration and configures them.
   * @param config The configuration for the embed.
   * @param brandDetails The brand details.
   */
  private async getEmbedDetails(
    config: Partial<SingleEmbedDataConfig>,
    brandDetails: any,
  ): Promise<void> {
    let embedDetails: EmbedDataType | null = null

    // If embedId is provided, fetch embed details directly
    if (config.embedId) {
      embedDetails = await this.embedDetailsManager.getEmbedDetails(
        config.embedId,
        brandDetails,
      )
    }

    // If placementId and styleId are provided, fetch placement data and configure it
    if (config.placementId && config.styleId) {
      embedDetails = await this.placementManager.getPlacementData(
        config.placementId,
        config.styleId,
      )

      if (!embedDetails)
        throw new Error('No embed details found for placement configuration.')
    } else if (!config.embedId) {
      // Neither embedId nor placementId/styleId provided - invalid configuration
      console.warn(
        'Placement ID or Style ID is missing, and no embed ID provided',
      )
      throw new Error(
        'Placement ID or Style ID is missing, and no embed ID provided',
      )
    }

    if (embedDetails) {
      // Add all the other params to embedDetails
      embedDetails.authInfo = config.authInfo
      embedDetails.startVideoSlug = config.startVideoSlug
      embedDetails.autoUserInteractionToPerform = config.action
      // Store the embed details in the config for later use
      config.embedDetails = embedDetails
    } else {
      console.warn('No embed details found for configuration.')
      throw new Error('No embed details found for configuration.')
    }
  }

  private async updateStartVideoId({
    startVideoSlug,
    embedId,
    action,
  }: {
    startVideoSlug: string
    embedId?: string
    action?: ActionType
  }) {
    if (!embedId && !this.isSingleEmbed()) {
      console.warn(
        'Embed id is required to update the start video slug in multi-embed scenario',
      )
      return
    }

    if (!embedId && this.isSingleEmbed()) {
      const firstEmbedId = Object.keys(this.sdkElements)[0]
      if (firstEmbedId)
        embedId = this.sdkElements[firstEmbedId]?.config.embedDetails?.embed_id
    }

    this.eventManager.emit(SDKEventType.SDK_UPDATE_START_VIDEO_SLUG, {
      embedId,
      startVideoSlug,
      action,
    })
  }

  /**
   * Updates the contextual parameters in the specified embed.
   * @param param0 The parameters for updating the embed.
   */
  private async updateContextualParamsInEmbed({
    contextualParams,
    embedId,
  }: {
    contextualParams: ContextualParamsType
    embedId?: string
  }) {
    const isSingleEmbed = Object.keys(this.sdkElements).length === 1

    // in case of single embed no need of the the embedId so find that embed_id and trigger the emit.
    if (isSingleEmbed) {
      const firstEmbedId = Object.keys(this.sdkElements)[0]
      if (firstEmbedId) {
        embedId = this.sdkElements[firstEmbedId]?.config.embedDetails?.embed_id
        // assign old contextual params to new contextual params.
        Object.assign(
          contextualParams,
          this.sdkElements[firstEmbedId]?.config.contextualParams,
        )
      }

      this.eventManager.emit(SDKEventType.SDK_UPDATE_CONTEXTUAL_PARAMS, {
        embedId,
        contextualParams,
      })
    }

    if (!embedId) {
      console.warn('Embed id is not provided to update the contextual params')
    }

    const oldContextualParams = Object.values(this.sdkElements).find(
      (element) => element.config.embedDetails?.embed_id === embedId,
    )?.config.contextualParams

    Object.assign(contextualParams, oldContextualParams)

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
   * Attempts to parse a JSON string, returns the parsed object or the original value if parsing fails.
   * @param value The string value to parse.
   * @returns The parsed JSON object or the original value.
   */
  private tryJsonParse(value: string | null): any {
    if (!value) return null
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
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
      'data-style-id',
      'data-placement-id',
      'data-token',
      'data-lat',
      'data-long',
      'data-url',
      'data-page-context',
      'data-brand-ids',
      'data-video-id',
      'data-action',
      'data-previous-page-context',
      'data-user-context',
      'data-geo',
      'data-place',
      'data-time',
      'data-user-segments',
      'data-brands-ids',
      'data-user-interests',
      'data-posted-by-user-ids',
      'data-community-ids',
      'data-loop-ids',
    ] as const
    const answerToReturn: Partial<SingleEmbedDataConfig> = {}

    // Extract core configuration attributes from the HTML element
    const dataEmbedId = singleElement.getAttribute('data-embed-id')
    const dataStyleId = singleElement.getAttribute('data-style-id')
    const dataPlacementId = singleElement.getAttribute('data-placement-id')

    // Priority 1: If both placement and style IDs are provided via data attributes,
    // use placement-based configuration (placement takes precedence over embed)
    if (dataPlacementId && dataStyleId) {
      answerToReturn.placementId = dataPlacementId
      answerToReturn.styleId = dataStyleId
      answerToReturn.embedId = undefined
      answerToReturn.apiKey = undefined
    }

    // Priority 2: If only embed ID is provided (and no placement/style),
    // use embed-based configuration
    if (dataEmbedId && !dataPlacementId && !dataStyleId) {
      answerToReturn.embedId = dataEmbedId
    }

    // Priority 3: If no configuration found from data attributes,
    // fall back to user-provided configuration
    if (
      !answerToReturn.embedId &&
      !answerToReturn.placementId &&
      !answerToReturn.styleId
    ) {
      if (configByUser?.placement_id && configByUser.style_id) {
        answerToReturn.placementId = configByUser.placement_id
        answerToReturn.styleId = configByUser.style_id
      } else {
        answerToReturn.embedId = configByUser?.embed_id
      }
    }

    // Extract additional configuration attributes from the element
    for (const attr of possibleAttributeNames) {
      let value = singleElement.getAttribute(attr)
      switch (attr) {
        // case 'data-embed-id':
        //   answerToReturn.embedId = value ?? configByUser?.embed_id
        //   continue
        //   continue
        case 'data-api-key':
          answerToReturn.apiKey = value ?? configByUser?.api_key
          break
        // case 'data-placement-id':
        //   answerToReturn.placementId = value ?? configByUser?.placement_id
        //   continue
        // case 'data-style-id':
        //   answerToReturn.styleId = value ?? configByUser?.style_id
        //   continue
        case 'data-token':
          answerToReturn.token = value ?? configByUser?.token
          break
        case 'data-video-id':
          answerToReturn.startVideoSlug =
            value ?? configByUser?.start_video_slug
          break
        case 'data-action':
          answerToReturn.action = (value ?? configByUser?.action) as
            | ActionType
            | undefined
          break
        case 'data-lat':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          answerToReturn.contextualParams.geo =
            answerToReturn.contextualParams.geo || {}
          value =
            typeof value === 'string'
              ? value
              : typeof configByUser?.contextual_params?.geo?.lat === 'string'
                ? configByUser?.contextual_params?.geo?.lat
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
          break
        case 'data-long':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          answerToReturn.contextualParams.geo =
            answerToReturn.contextualParams.geo || {}
          const longValue = value ?? configByUser?.contextual_params?.geo?.long
          if (typeof longValue === 'string') {
            const parsedLong = parseFloat(longValue)
            if (!isNaN(parsedLong)) {
              answerToReturn.contextualParams.geo.long = parsedLong
            }
          } else if (typeof longValue === 'number') {
            answerToReturn.contextualParams.geo.long = longValue
          }
          break
        case 'data-url':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          answerToReturn.contextualParams.url =
            value ?? configByUser?.contextual_params?.url
          break
        case 'data-page-context':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          answerToReturn.contextualParams.page_context =
            value ?? configByUser?.contextual_params?.page_context
          break
        case 'data-previous-page-context':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          answerToReturn.contextualParams.previous_page_context =
            value ?? configByUser?.contextual_params?.previous_page_context
          break
        case 'data-user-context':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          answerToReturn.contextualParams.user_context =
            value ?? configByUser?.contextual_params?.user_context
          break
        case 'data-geo':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          answerToReturn.contextualParams.geo =
            answerToReturn.contextualParams.geo || {}
          const geoParsed = this.tryJsonParse(value)
          if (geoParsed && typeof geoParsed === 'object') {
            answerToReturn.contextualParams.geo = {
              ...answerToReturn.contextualParams.geo,
              ...geoParsed,
            }
          } else {
            answerToReturn.contextualParams.geo = {
              ...answerToReturn.contextualParams.geo,
              ...configByUser?.contextual_params?.geo,
            }
          }
          break
        case 'data-place':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          const placeParsed = this.tryJsonParse(value)
          answerToReturn.contextualParams.place =
            placeParsed && typeof placeParsed === 'object'
              ? placeParsed
              : configByUser?.contextual_params?.place
          break
        case 'data-time':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          if (value) {
            const parsedTime = parseFloat(value)
            answerToReturn.contextualParams.time = isNaN(parsedTime)
              ? value
              : parsedTime
          } else {
            answerToReturn.contextualParams.time =
              configByUser?.contextual_params?.time
          }
          break
        case 'data-user-segments':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          const userSegmentsParsed = this.tryJsonParse(value)
          answerToReturn.contextualParams.user_segments =
            userSegmentsParsed && typeof userSegmentsParsed === 'object'
              ? userSegmentsParsed
              : configByUser?.contextual_params?.user_segments
          break
        case 'data-brands-ids':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          const brandsIdsParsed = this.tryJsonParse(value)
          answerToReturn.contextualParams.brands_ids = Array.isArray(
            brandsIdsParsed,
          )
            ? brandsIdsParsed
            : configByUser?.contextual_params?.brands_ids
          break
        case 'data-user-interests':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          const userInterestsParsed = this.tryJsonParse(value)
          answerToReturn.contextualParams.user_interests = Array.isArray(
            userInterestsParsed,
          )
            ? userInterestsParsed
            : configByUser?.contextual_params?.user_interests
          break
        case 'data-posted-by-user-ids':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          const postedByUserIdsParsed = this.tryJsonParse(value)
          answerToReturn.contextualParams.posted_by_user_ids = Array.isArray(
            postedByUserIdsParsed,
          )
            ? postedByUserIdsParsed
            : configByUser?.contextual_params?.posted_by_user_ids
          break
        case 'data-community-ids':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          const communityIdsParsed = this.tryJsonParse(value)
          answerToReturn.contextualParams.community_ids = Array.isArray(
            communityIdsParsed,
          )
            ? communityIdsParsed
            : configByUser?.contextual_params?.community_ids
          break
        case 'data-loop-ids':
          answerToReturn.contextualParams =
            answerToReturn.contextualParams || {}
          const loopIdsParsed = this.tryJsonParse(value)
          answerToReturn.contextualParams.loop_ids = Array.isArray(
            loopIdsParsed,
          )
            ? loopIdsParsed
            : configByUser?.contextual_params?.loop_ids
          break
        default:
          break
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
   * Checks if the current embed is a single instance.
   * @returns True if it's a single embed, false otherwise.
   */
  private isSingleEmbed() {
    return Object.keys(this.sdkElements).length === 1
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
