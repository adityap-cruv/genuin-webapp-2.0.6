import {
  EventManager,
  SDKEventType,
  type EventListener,
  ErrorHandler,
  TokenManager,
  ThemeManager,
} from '../core'
import { getRandomNumber, parsePlacementToEmbedData } from '../utils'
import { BrandDetailsManager } from '@/core/brand-details-manager'
import {
  loadErrorView,
  loadExpandView,
  loadLoadingView,
  loadNewEmbed,
} from './react-utils'
import { EmbedDetailsManager } from '@/core/embed-details-manager'
import { AuthUser } from '@genuin/components/types/auth'
import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { CallbackQueueManager } from '@/core/callback-queue-manager'
import { PlacementManager } from '@/core/placement-manager'
import { ActionType } from '@genuin/components/context/embed/embed.types'
import { ContextualParamsType } from '@genuin/components/context/embed/embed.types'
import {
  ConfigByUser,
  InitializationStatus,
  SDKElementsType,
  SingleEmbedDataConfig,
  UpdateConfigByUserType,
} from '@/type'

export class GenuinSDK {
  private brandDetailsManager: BrandDetailsManager
  private static instance: GenuinSDK
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
    try {
      this.getAndSetDivs(config)
      this.setupEmbedProviderReadyHandler()

      await this.initializeAllEmbeds()

      this.isInitialized = true
    } catch (error) {
      console.error(
        'Error during SDK initialization please contact admin:',
        error,
      )
    }
  }

  /**
   * Sets up event handlers to track when embed providers are ready and execute queued callbacks
   * @private
   */
  private setupEmbedProviderReadyHandler(): void {
    //TODO: Think about the placement feature.
    // Set up a handler for the embedProviderReady event
    const readyEmbeds: Array<string> = []
    const totalEmbeds = Object.values(this.sdkElements).filter(
      (val) => !!val.config.embedId || !!val.config.placementId,
    ).length

    // Listen for ready signals from embed providers
    const handleProviderReady = (event: any) => {
      const { embedId, placementId } = event.payload || {}
      // Track which embeds are ready
      readyEmbeds.push(embedId || placementId)
      // Execute callbacks once all embed providers are ready
      if (readyEmbeds.length >= totalEmbeds) {
        this.callbackQueueManager.executeAllCallbacks()
        this.eventManager.off(
          SDKEventType.SDK_EMBED_PROVIDER_READY,
          handleProviderReady,
        )
      }
    }

    this.eventManager.on(
      SDKEventType.SDK_EMBED_PROVIDER_READY,
      handleProviderReady,
    )

    // If no embeds found, execute callbacks immediately
    if (totalEmbeds === 0) {
      this.callbackQueueManager.executeAllCallbacks()
    }
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
    const contextualParams: ContextualParamsType | undefined =
      config?.contextual_params ?? config?.contextualParams
    if (contextualParams && config) {
      await this.updateContextualParamsInEmbed({
        contextualParams: contextualParams,
        embedId: config.embed_id,
        placementId: config.placement_id,
      })
    }

    //! start video slug update is only supported in embed not in placement
    if (config?.start_video_slug && config.embed_id) {
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
    try {
      // Handle live embed initialization
      if (config.live) {
        await this.initializeLiveEmbed(element, config)
        return
      }

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
      loadNewEmbed({
        container: element,
        embedData: embedDetails,
        brandDetails,
        config,
        user,
      })
    } catch (error) {
      console.error('Error initializing embed:', error)
      console.log('[gen-sdk]: Calling user error handler with:')
      this.eventManager.emit(SDKEventType.SDK_EMBED_ERROR, {
        isError: true,
        isNoContent: false,
      })
      loadErrorView(element)
    }

    return true
  }

  /**
   * Initializes a live embed by fetching brand details, embed details if available, applying brand colors, and loading the embed.
   * @param element The HTML element to initialize the embed in.
   * @param config The configuration for the embed.
   * @private
   */
  private async initializeLiveEmbed(
    element: HTMLElement,
    config: Partial<SingleEmbedDataConfig>,
  ): Promise<void> {
    const brandDetails = await this.brandDetailsManager.getBrandDetails(
      config.apiKey,
    )

    if (config.embedId) {
      let embedDetails = { customization: {} } as EmbedDataType
      if (config.embedId !== 'preview') {
        embedDetails = await this.embedDetailsManager.getEmbedDetails(
          config.embedId,
          brandDetails as any,
        )
      }

      embedDetails = { ...embedDetails, ...config.live }

      Object.assign(
        embedDetails.customization,
        config.live.live_customization_data || {},
      )

      config.embedDetails = embedDetails
    }

    if (config.placementId && config.styleId) {
      let embedDetails = parsePlacementToEmbedData(
        config.live.live_customization_data,
        config.styleId,
      )
      config.embedDetails = embedDetails
    }

    this.themeManager.applyBrandColors(element, brandDetails.brand_colors)

    // if embedDetails is not found then we can't load the embed.
    if (!config.embedDetails) {
      console.warn(
        'No embed details or placement details found for live embed configuration.',
      )
      return
    }

    loadNewEmbed({
      container: element,
      embedData: config.embedDetails,
      brandDetails,
      config,
    })
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
      embedDetails.commentId = config.commentId
      if (config.contextualParams)
        embedDetails.contextualParams = config.contextualParams

      // Use brandDetails layout IDs as fallback if not present in embedDetails
      if (!embedDetails.card_layout_id && brandDetails.card_layout_id) {
        embedDetails.card_layout_id = brandDetails.card_layout_id
      }
      if (!embedDetails.video_layout_id && brandDetails.video_layout_id) {
        embedDetails.video_layout_id = brandDetails.video_layout_id
      }

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
    placementId,
  }: {
    contextualParams: ContextualParamsType
    embedId?: string
    placementId?: string
  }) {
    const isSingleEmbed = Object.keys(this.sdkElements).length === 1
    // in case of single embed no need of the the embedId so find that embed_id and trigger the emit.
    if (isSingleEmbed) {
      const firstEmbedId = Object.keys(this.sdkElements)[0]
      if (firstEmbedId) {
        embedId = this.sdkElements[firstEmbedId]?.config.embedDetails?.embed_id
        placementId =
          this.sdkElements[firstEmbedId]?.config.embedDetails?.placement_id

        // Deep merge old contextual params into new contextual params
        contextualParams = this.deepMergeObjects(
          this.sdkElements[firstEmbedId]?.config.contextualParams || {},
          contextualParams || {},
        )
      }

      this.eventManager.emit(SDKEventType.SDK_UPDATE_CONTEXTUAL_PARAMS, {
        embedId,
        placementId,
        contextualParams,
      })

      return
    }

    if (!embedId && !placementId) {
      console.warn(
        'Embed id or placement id is not provided to update the contextual params',
      )
      return
    }

    const oldContextualParams =
      Object.values(this.sdkElements).find(
        (element) =>
          element.config.embedDetails?.embed_id === embedId ||
          element.config.embedDetails?.placement_id === placementId,
      )?.config.contextualParams || {}

    contextualParams = this.deepMergeObjects(
      oldContextualParams,
      contextualParams || {},
    )

    if (embedId || placementId)
      console.log('Emitting event with::', embedId, placementId)
    this.eventManager.emit(SDKEventType.SDK_UPDATE_CONTEXTUAL_PARAMS, {
      embedId,
      placementId,
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
        if (user) {
          this.eventManager.emit(SDKEventType.SDK_AUTHENTICATE_USER, user)
          return user
        }

        return null
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
      // Show loading view immediately
      loadLoadingView(element)
      const extractedData = this.extractDataFromSingleDiv(element, configByUser)
      if (extractedData.startVideoSlug) {
        loadExpandView(element)
      }
      console.log('[gen-sdk]: element Initialization', element)
      console.log('[gen-sdk]: sdk embed id:', extractedData.embedId)
      console.log('[gen-sdk]: sdk api key:', extractedData.apiKey)
      console.log(
        '[gen-sdk]: Initialization with start video slug:',
        extractedData.startVideoSlug,
      )
      console.log(
        '[gen-sdk]: Initialization with actions',
        extractedData.action,
      )
      if (extractedData) {
        this.sdkElements[instanceId] = {
          element,
          config: extractedData,
          status: 'pending',
        }
      }
    })

    const userErrorHandler =
      configByUser?.error_handler || configByUser?.errorHandler
    if (userErrorHandler) {
      this.eventManager.on(SDKEventType.SDK_EMBED_ERROR, ({ payload }) => {
        console.log('[gen-sdk]: Calling user error handler with:', payload)
        userErrorHandler(payload)
      })
      this.eventManager.on(SDKEventType.SDK_EMBED_NO_CONTENT, ({ payload }) => {
        console.log('[gen-sdk]: Calling user error handler with:', payload)
        userErrorHandler(payload)
      })
    }

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
    const answerToReturn: Partial<SingleEmbedDataConfig> = {}

    // In case of live embed, we don't need to check for any other attribute.
    if (configByUser?.live) {
      return this.extractLiveEmbedData(answerToReturn, configByUser)
    }

    const possibleAttributeNames = [
      'data-embed-id',
      'data-api-key',
      'data-style-id',
      'data-placement-id',
      'data-token',
      'data-lat',
      'data-comment-id',
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

    // This code is for backward compatibility
    if (configByUser && !configByUser?.contextual_params) {
      configByUser.contextual_params = configByUser?.contextualParams
    }

    // This code is for backward compatibility
    if (configByUser && !configByUser?.auth_info) {
      configByUser.auth_info = configByUser?.authInfo
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
        case 'data-comment-id':
          answerToReturn.commentId = value ?? configByUser?.comment_id
          break
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
          console.log('page context value::', value)
          answerToReturn.contextualParams.page_context =
            value ?? configByUser?.contextual_params?.page_context
          console.log(
            'page context set to::',
            answerToReturn.contextualParams.page_context,
            configByUser?.contextual_params?.page_context,
          )
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
   * Extracts and configures data for live embed scenarios.
   * Handles both embed_id and placement_id/style_id configurations.
   * @param answerToReturn The partial configuration object to update.
   * @param configByUser The user-provided configuration containing live data.
   * @returns The updated configuration object with live embed data.
   * @private
   */
  private extractLiveEmbedData(
    answerToReturn: Partial<SingleEmbedDataConfig>,
    configByUser: ConfigByUser,
  ): Partial<SingleEmbedDataConfig> {
    const liveData = configByUser.live

    if (liveData?.embed_id) {
      answerToReturn.embedId = liveData.embed_id
    }

    if (liveData.placement_id && liveData.style_id) {
      answerToReturn.placementId = liveData.placement_id
      answerToReturn.styleId = liveData.style_id
      answerToReturn.embedId = undefined
      answerToReturn.apiKey = undefined

      // Parse the placement to get embed details
      if (answerToReturn.styleId) {
        answerToReturn.embedDetails = parsePlacementToEmbedData(
          liveData,
          answerToReturn.styleId,
        )
      }
    }

    answerToReturn.apiKey = liveData.api_key
    answerToReturn.live = liveData

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
   * Deep merges two objects by recursively merging all nested properties
   * @param target The target object to merge into
   * @param source The source object to merge from
   * @returns A new object with merged properties
   * @private
   */
  private deepMergeObjects<T extends Record<string, any>>(
    target?: T,
    source?: Record<string, any>,
  ): T {
    if (!target) return source as T
    if (!source) return target as T
    // Create a new object to avoid mutating either input
    const result = { ...target } as Record<string, any>

    Object.keys(source).forEach((key) => {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        // For nested objects, recursively merge
        if (
          key in result &&
          typeof result[key] === 'object' &&
          !Array.isArray(result[key])
        ) {
          result[key] = this.deepMergeObjects(result[key], source[key])
        } else {
          // If the key doesn't exist in target or isn't an object, create/overwrite it
          result[key] = { ...source[key] }
        }
      } else {
        // For non-objects (including arrays), directly assign the value
        result[key] = source[key]
      }
    })

    return result as T
  }

  /**
   * Emits an event to the SDK event system
   * @param eventType The type of the event to emit
   * @param payload The data to include with the event
   */
  emit(eventType: SDKEventType, payload?: any): void {
    this.eventManager.emit(eventType, payload)
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
    this.isInitialized = false

    this.eventManager.emit(SDKEventType.EMBED_LOADED, { destroyed: true })
  }
}

// Export singleton instance
export const Genuin = GenuinSDK.getInstance()
