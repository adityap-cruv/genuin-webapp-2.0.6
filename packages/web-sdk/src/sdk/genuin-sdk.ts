import { FeedContextManager } from "@genuin/components/context/base/feed-context-manager";
import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import type { ActionType } from "@genuin/components/context/embed/embed.types";
import type { ContextualParamsType } from "@genuin/components/context/embed/embed.types";
import { getPendingAction, clearPendingAction } from "@genuin/components/lib/utils/pending-action-storage";
import { loadGenAdScript } from "@genuin/components/molecules/feed-player/gen-ad-container";
import { setupMainShadowDOM } from "@genuin/components/molecules/root-portal/shadow-root/shadow-dom.utils";
import type { AuthUser } from "@genuin/components/types/auth";

import { BrandDetailsManager } from "@/core/brand-details-manager";
import { CallbackQueueManager } from "@/core/callback-queue-manager";
import { EmbedDetailsManager } from "@/core/embed-details-manager";
import { PlacementManager } from "@/core/placement-manager";
import type {
  ConfigByUser,
  InitializationStatus,
  SDKElementsType,
  SingleEmbedDataConfig,
  UpdateConfigByUserType,
} from "@/type";
import { queryUtils } from "@/utils/query-utils";

import {
  EventManager,
  SDKEventType,
  type EventListener,
  ErrorHandler,
  TokenManager,
  ThemeManager,
  ErrorType,
} from "../core";
import { getRandomNumber, parsePlacementToEmbedData } from "../utils";

import { loadErrorView, renderEmbedSkeleton as loadLoadingView } from "./dom-utils";
import { loadExpandView } from "./react-utils";

// Allowed events list - only these events can be listened to
const ALLOWED_EVENTS = [
  "onPlay",
  "onPause",
  "onMuteChange",
  "onVideoNotFound",
  "onSwipedForward",
  "onSwipedBackward",
  "onExpandViewChanged",
  "onAnalyticsTrack",
  "onFeedLoaded",
  "onFollowChanged",
  "onCaughtOverlay",
  "checkFollowingStatus",
  "playIHeartContent",
  "onShare",
  "onVideoClicked",
];

const ALLOWED_EMIT_EVENTS = [
  "player:play",
  "player:pause",
  "player:mute",
  "player:unmute",
  "player:onFollowChanged",
  "player:onMiniPlayerPlayChange",
  "sdk:themeChange",
  "sdk:clearLoginAction",

  // 'sdk:expandEmbed',
  // 'sdk:collapseEmbed',
];

export class GenuinSDK {
  private brandDetailsManager: BrandDetailsManager;
  private static instance: GenuinSDK;
  private eventManager: EventManager;
  private errorHandler: ErrorHandler;
  private tokenManager: TokenManager;
  private themeManager: ThemeManager;
  /**
   * This variable is used to track if the SDK has been initialized.
   */
  private isInitialized = false;
  private sdkInitTime: number;
  private embedDetailsManager: EmbedDetailsManager;
  private sdkElements: SDKElementsType = {};
  private callbackQueueManager: CallbackQueueManager;
  private placementManager: PlacementManager;
  private videoManager = FeedContextManager;

  /**
   * Validates if a token value is valid (not null, undefined, empty, or string 'undefined'/'null')
   * @param token The token value to validate
   * @returns true if token is valid, false otherwise
   */
  private isValidToken(token: string | null | undefined): token is string {
    if (!token) return false;
    if (typeof token !== "string") return false;
    const trimmedToken = token.trim();
    if (trimmedToken === "") return false;
    if (trimmedToken.toLowerCase() === "undefined") return false;
    if (trimmedToken.toLowerCase() === "null") return false;
    return true;
  }

  private constructor() {
    this.eventManager = EventManager.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    this.tokenManager = TokenManager.getInstance();
    this.themeManager = ThemeManager.getInstance();
    this.brandDetailsManager = BrandDetailsManager.getInstance();
    this.embedDetailsManager = EmbedDetailsManager.getInstance();
    this.callbackQueueManager = new CallbackQueueManager();
    this.placementManager = PlacementManager.getInstance();
    this.setupInternalEventHandlers();
    this.sdkInitTime = 0;
  }

  static getInstance(): GenuinSDK {
    if (!GenuinSDK.instance) {
      GenuinSDK.instance = new GenuinSDK();
    }
    return GenuinSDK.instance;
  }

  /**
   * Store the cleanup function for an embed element
   * @param element The HTML element to store cleanup for
   * @param cleanup The cleanup function to store
   * @private
   */
  private storeCleanupFunction(element: HTMLElement, cleanup: () => void): void {
    const instanceId = element.getAttribute("data-instance-id");
    if (instanceId && this.sdkElements[instanceId]) {
      this.sdkElements[instanceId].cleanup = cleanup;
    }
  }

  /**
   * Initialize div with callback (for window.onGenuinReady support)
   * @param div The div element to initialize.
   * @param callback The callback to execute once initialization is complete.
   * @deprecated
   */
  newInitWithCallback(div: HTMLElement, callback: (sdk: any) => void): void {
    if (!callback || !div) {
      console.error("Invalid callback or div for instance");
      return;
    }

    callback({
      initialize: (sdkconfig: ConfigByUser) => {
        this.newInit(sdkconfig);
      },
    });
  }

  /**
   * This function is used for backward compatibility.
   * @param config
   * @deprecated
   */
  initialize(config?: ConfigByUser): void {
    this.newInit(config);
  }

  getSDKInitTime(): number {
    return this.sdkInitTime;
  }

  /**
   * Initializes the SDK with the provided configuration.
   * This is new init method which will replace legacyInit.
   * @param config User-provided configuration for the SDK.
   */
  async newInit(config?: ConfigByUser) {
    console.log("[web-sdk], init called multiple times");
    // Check if sdk initialization is disabled via URL parameter
    if (this.shouldDisableSdkInitialization()) {
      console.warn("SDK initialization is disabled via URL parameter.");
      return;
    }
    // Performance marker: Init start
    try {
      const { metrics } = await import("../utils/metrics");
      metrics.markInitStart();
    } catch (_e) {
      // Metrics not available, continue without tracking
    }

    try {
      // Store in sdk Init Time
      this.sdkInitTime = performance.now();

      await this.getAndSetDivs(config);
      this.setupEmbedProviderReadyHandler();

      await this.initializeAllEmbeds();

      this.isInitialized = true;

      // Performance marker: Init end
      try {
        const { metrics } = await import("../utils/metrics");
        metrics.markInitEnd();
      } catch (_e) {
        // Metrics not available, continue
      }
    } catch (error) {
      console.error("Error during SDK initialization please contact admin:", error);
      // Still mark init end even on error
      try {
        const { metrics } = await import("../utils/metrics");
        metrics.markInitEnd();
      } catch (_e) {
        // Metrics not available, continue
      }
    }
  }

  /**
   * Checks if SDK initialization should be disabled based on URL parameter.
   * Works for both regular pages and iframes by checking the top-most window URL (browser address bar).
   * Falls back to current window if cross-origin restrictions prevent access.
   *
   * @returns {boolean} True if SDK initialization is disabled via URL parameter
   */
  private shouldDisableSdkInitialization(): boolean {
    // Check if we're running inside an iframe
    const isEmbeddedInIframe = window.self !== window.top;
    let searchParams: URLSearchParams;
    if (!isEmbeddedInIframe) {
      // Not in iframe - use current window's URL
      searchParams = new URLSearchParams(window.location.search);
    } else {
      try {
        // In iframe - try to access parent/top window URL (browser address bar)
        // This may fail due to cross-origin restrictions
        searchParams = new URLSearchParams(
          window.top?.location.search || window.parent?.location.search || window.location.search
        );
      } catch (error) {
        // Cross-origin access blocked - fall back to current window
        console.warn("Unable to access parent window URL, falling back to iframe URL:", error);
        searchParams = new URLSearchParams(window.location.search);
      }
    }
    // Check if the disable parameter is set to 'true'
    return searchParams.get("disableGenSdk") === "true";
  }

  /**
   * Sets up internal SDK event handlers
   * @private
   */
  private setupInternalEventHandlers(): void {
    // Set up event listener for clearing pending actions
    this.eventManager.on(SDKEventType.SDK_CLEAR_LOGIN_ACTION, () => {
      clearPendingAction();
    });
  }

  /**
   * Sets up event handlers to track when embed providers are ready and execute queued callbacks
   * @private
   */
  private setupEmbedProviderReadyHandler(): void {
    //TODO: Think about the placement feature.
    // Set up a handler for the embedProviderReady event
    const readyEmbeds: Array<string> = [];
    const totalEmbeds = Object.values(this.sdkElements).filter(
      (val) => !!val.config.embedId || !!val.config.placementId
    ).length;

    // Listen for ready signals from embed providers
    const handleProviderReady = (event: any) => {
      const { embedId, placementId } = event.payload || {};
      // Track which embeds are ready
      readyEmbeds.push(embedId || placementId);
      // Execute callbacks once all embed providers are ready
      if (readyEmbeds.length >= totalEmbeds) {
        this.callbackQueueManager.executeAllCallbacks();
        this.eventManager.off(SDKEventType.SDK_EMBED_PROVIDER_READY, handleProviderReady);
      }
    };

    this.eventManager.on(SDKEventType.SDK_EMBED_PROVIDER_READY, handleProviderReady);

    // If no embeds found, execute callbacks immediately
    if (totalEmbeds === 0) {
      this.callbackQueueManager.executeAllCallbacks();
    }
  }

  async newUpdate(config?: UpdateConfigByUserType) {
    console.log("[gen-update-loader] newUpdate called with config:", config);
    // if sdk is not initialized then queue the update call.
    if (!this.isInitialized) {
      console.log("[gen-update-loader] SDK not initialized, queuing update call");
      this.callbackQueueManager.enqueue(() => this._performUpdate(config), config);
      return;
    }
    console.log("[gen-update-loader] SDK initialized, calling _performUpdate");
    await this._performUpdate(config);
    console.log("[gen-update-loader] newUpdate completed");
  }

  private async _performUpdate(config?: UpdateConfigByUserType) {
    console.log("[gen-update-loader] _performUpdate started with config:", config);
    // In case of token comes authenticateUser, this function will authenticate user in all the embeds.
    if (this.isValidToken(config?.token)) {
      console.log("[gen-update-loader] Valid token found, authenticating user");
      await this.authenticateUser({
        token: config.token,
        userParams: config.user_params,
      });
      console.log("[gen-update-loader] User authentication completed");
    } else {
      console.log("[gen-update-loader] No valid token in config, skipping authentication");
    }

    // Update contextual params in the embed where the instance id matches.
    const contextualParams: ContextualParamsType | undefined = config?.contextual_params ?? config?.contextualParams;
    if (contextualParams && config && config.container_id) {
      console.log(
        "[gen-update-loader] Updating contextual params for container:",
        config.container_id,
        "params:",
        contextualParams
      );
      await this.updateContextualParamsInEmbed({
        contextualParams: contextualParams,
        containerId: config.container_id,
      });
      console.log("[gen-update-loader] Contextual params update completed");
    } else {
      console.log(
        "[gen-update-loader] Skipping contextual params update — contextualParams:",
        contextualParams,
        "container_id:",
        config?.container_id
      );
    }
    // Update start video slug in the embed/placement where the instance id matches.
    if (config?.start_video_slug && config.container_id) {
      // User-provided data takes priority
      console.log(
        "[gen-update-loader] start_video_slug provided, updating start video:",
        config.start_video_slug,
        "container:",
        config.container_id
      );
      await this.updateStartVideoId({
        startVideoSlug: config.start_video_slug,
        containerId: config.container_id,
        action: config.action,
        commentId: config.comment_id,
        sourceInstanceId: config.source_instance_id,
      });
      console.log("[gen-update-loader] Start video slug update completed");
    } else {
      // No start_video_slug from user — check localStorage for a pending action
      console.log("[gen-update-loader] No start_video_slug in config, checking localStorage for pending action");
      const pendingAction = getPendingAction();
      console.log("[gen-update-loader] Pending action from localStorage:", pendingAction);
      if (pendingAction?.videoSlug) {
        // Use container_id from config if available, otherwise fall back to the divId stored in the pending action
        const containerId = config?.container_id ?? pendingAction.divId;
        console.log(
          "[gen-update-loader] Found pending action videoSlug:",
          pendingAction.videoSlug,
          "resolved containerId:",
          containerId
        );
        if (containerId) {
          await this.updateStartVideoId({
            startVideoSlug: pendingAction.videoSlug,
            containerId,
            action: pendingAction.action as ActionType | undefined,
            commentId: pendingAction.commentId,
          });
          clearPendingAction();
          console.log("[gen-update-loader] Pending action applied and cleared");
        } else {
          console.log("[gen-update-loader] No containerId resolved, skipping pending action");
        }
      } else {
        console.log("[gen-update-loader] No pending action found in localStorage");
      }
    }
    console.log("[gen-update-loader] _performUpdate completed");
  }

  /**
   * To initialize all embeds found on the page.
   */
  private async initializeAllEmbeds() {
    const sdkElements = this.sdkElements;

    if (Object.keys(sdkElements).length === 0) {
      console.warn("No valid SDK elements found for initialization.");
      return;
    }

    for await (const instanceId of Object.keys(sdkElements)) {
      const elementObject = sdkElements[instanceId];
      if (elementObject && this.getInitializationStatus(elementObject.element) === "pending") {
        this.setInitializationStatus(elementObject.element, "loading");
        elementObject.status = "loading";

        const isSdkLoaded = await this.initializeSingleEmbedById(elementObject.element, elementObject.config);

        if (isSdkLoaded) {
          this.setInitializationStatus(elementObject.element, "done");
          elementObject.status = "done";
        } else {
          this.setInitializationStatus(elementObject.element, "pending");
          elementObject.status = "pending";
        }
      } else {
        console.log("No valid object found for element or already initialized::", instanceId);
      }
    }
  }

  /**
   * Initializes a single embed instance.
   * @param element The HTML element to initialize.
   * @param config The configuration for the embed.
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  async initializeSingleEmbedById(element: HTMLElement, config: Partial<SingleEmbedDataConfig>) {
    try {
      // Handle live embed initialization
      if (config.live) {
        await this.initializeLiveEmbed(element, config);
        return;
      }

      // This is where we get the brand details
      const brandDetails = await this.brandDetailsManager.getBrandDetails(config.apiKey);

      const AD_INJECT_BRAND_IDS = [3283, 2249, 2910];
      if (AD_INJECT_BRAND_IDS.includes(Number(brandDetails.brand_id))) {
        loadGenAdScript();
      }

      // Get embed details based on configuration
      await this.getEmbedDetails(config, brandDetails);

      const embedDetails = config.embedDetails!;

      // Load expand view if expandOnLoad is true, or startVideoSlug is set and expandOnLoad is not explicitly false
      if (
        embedDetails.expandOnLoad === true ||
        (config.startVideoSlug && config.expandOnLoad !== false) ||
        (embedDetails.startVideoSlug && embedDetails.expandOnLoad !== false)
      ) {
        const instanceId = element.getAttribute("data-instance-id");
        if (instanceId && this.sdkElements[instanceId]) {
          const { loadExpandView } = await import("./react-utils");
          loadExpandView(element, this.sdkElements[instanceId].config.theme, element.shadowRoot);
        }
      }

      // override style of embed if provided by user.
      if (config.embedStyle) {
        embedDetails.style = config.embedStyle;
      }

      // set the brand-details and embed-details to the sdkElements for future reference.
      config.brandDetails = brandDetails;

      // If there is user already then use that authed user.
      let user: AuthUser | undefined | null = this.tokenManager.getCachedUser();

      if (this.isValidToken(config.token)) {
        user =
          (await this.authenticateUser({
            token: config.token,
            userParams: config.params,
          })) ?? undefined;
      } else {
        // Remove user data from local storage if no token is provided
        this.tokenManager.removeUserData();
        user = null;
      }

      // Handle pending actions from localStorage
      this.handlePendingAction(embedDetails, element, user, brandDetails.brand_id);

      // Apply brand colors to the element
      this.themeManager.applyBrandColors(element, brandDetails.brand_colors);

      // Render skeleton immediately (already handled in getAndSetDivs but good to ensure)
      // loadLoadingView(element, config.theme)

      // Function to perform the actual render
      const renderEmbed = async (wasLazilyLoaded = false, isOnlyForExpand: boolean) => {
        const { loadNewEmbed } = await import("./react-utils");
        const instanceId = element.getAttribute("data-instance-id");
        const shadowTarget: HTMLElement =
          (instanceId ? this.sdkElements[instanceId]?.shadowTarget : undefined) ?? element;
        const cleanup = await loadNewEmbed({
          container: element,
          shadowTarget,
          embedData: embedDetails,
          brandDetails,
          config,
          user,
          wasLazilyLoaded,
          isOnlyForExpand,
        });
        // Store the cleanup function in sdkElements
        this.storeCleanupFunction(element, cleanup);
      };

      // Register a resize listener for this element so the host container height
      // tracks the embed's internally calculated height. The listener filters by
      // containerId so multiple embeds on the same page each resize only their own
      // container. No fixed height is required on the host element.
      const handleEmbedResize = (event: {
        payload?: {
          height?: number;
          width?: number;
          containerId?: string | null;
        };
      }) => {
        const { height, containerId } = event.payload ?? {};
        if (typeof height !== "number" || height <= 0) return;
        // Match this listener to the correct container element. When containerId is
        // present, use it for an exact match. Otherwise update unconditionally
        // (single-embed fallback).
        if (containerId !== undefined && containerId !== null && containerId !== element.id) return;
        element.style.height = `${height}px`;
      };
      // 'onResize' is the SDKEventName.RESIZE value emitted by embed.tsx
      this.eventManager.on("onResize" as SDKEventType, handleEmbedResize as EventListener);

      // A flag to check if the component is only for expand view based on the initial size check, if true we will not lazy load this component as it might cause issues in loading the expand view.
      const ifComponentIsOnlyForExpand = this.checkIfEmbedIsOnlyForExpand(element);
      // const ifComponentIsOnlyForExpand = true

      // Check for IntersectionObserver support for lazy loading
      // We can also add a config flag to disable this if needed
      const canLazyLoad =
        "IntersectionObserver" in window &&
        !config.startVideoSlug && // Don't lazy load if deep linking
        !config.expandOnLoad && // Don't lazy load if expand on load is true
        !ifComponentIsOnlyForExpand; // Don't lazy load if the component is only for expand view (based on initial size check)

      if (canLazyLoad) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                renderEmbed(true, ifComponentIsOnlyForExpand); // Pass true for wasLazilyLoaded
                observer.disconnect();
              }
            });
          },
          {
            rootMargin: "200px", // Start loading 200px before viewport
            threshold: 0.01,
          }
        );
        observer.observe(element);

        // Store observer cleanup in case element is removed before loading
        this.storeCleanupFunction(element, () => observer.disconnect());
      } else {
        // Fallback to eager release
        await renderEmbed(false, !!ifComponentIsOnlyForExpand);
      }
    } catch (error) {
      console.error("Error initializing embed:", error);
      this.eventManager.emit(SDKEventType.SDK_EMBED_ERROR, {
        isError: true,
        isNoContent: false,
      });
      // Write the error view into the shadow root target so it is visible.
      // Falling back to element (the shadow host) would write into its light DOM,
      // which is hidden behind the shadow root and would never be shown.
      const instanceId = element.getAttribute("data-instance-id");
      const errorTarget = (instanceId ? this.sdkElements[instanceId]?.shadowTarget : undefined) ?? element;
      loadErrorView(errorTarget);
    }

    return true;
  }

  /**
   * Initializes a live embed by fetching brand details, embed details if available, applying brand colors, and loading the embed.
   * @param element The HTML element to initialize the embed in.
   * @param config The configuration for the embed.
   * @private
   */
  private async initializeLiveEmbed(element: HTMLElement, config: Partial<SingleEmbedDataConfig>): Promise<void> {
    // Check if this is a nested instance and disable shadow DOM if so
    if (config.live?.is_nested || config.parentInstanceId) {
      config.useShadowDOM = false;
    }

    const brandDetails = await this.brandDetailsManager.getBrandDetails(config.apiKey);

    if (config.embedId) {
      let embedDetails = { customization: {} } as EmbedDataType;
      if (config.embedId !== "preview") {
        embedDetails = await this.embedDetailsManager.getEmbedDetails(config.embedId, brandDetails as any);
      }

      embedDetails = { ...embedDetails, ...config.live };

      Object.assign(embedDetails.customization, config.live?.live_customization_data || {});

      config.embedDetails = embedDetails;
    }

    if (config.placementId && config.styleId) {
      // Only parse placement if live_customization_data exists
      // For nested instances, this might not be present
      if (config.live?.live_customization_data && config.styleId) {
        config.embedDetails = parsePlacementToEmbedData(config.live.live_customization_data, config.styleId);
      }
    }

    if (config.live?.live_customization_data && config.embedDetails) {
      config.embedDetails.customization = this.deepMergeObjects(
        config.embedDetails.customization ?? {},
        config.live.live_customization_data
      );
    }

    this.themeManager.applyBrandColors(element, brandDetails.brand_colors);

    // if embedDetails is not found then we can't load the embed.
    if (!config.embedDetails) {
      console.warn("No embed details or placement details found for live embed configuration.");
      return;
    }

    const { loadNewEmbed } = await import("./react-utils");
    const liveInstanceId = element.getAttribute("data-instance-id");
    const liveShadowTarget: HTMLElement =
      (liveInstanceId ? this.sdkElements[liveInstanceId]?.shadowTarget : undefined) ?? element;
    const cleanup = await loadNewEmbed({
      container: element,
      shadowTarget: liveShadowTarget,
      embedData: config.embedDetails,
      brandDetails,
      config,
    });

    // Store the cleanup function in sdkElements
    this.storeCleanupFunction(element, cleanup);
  }

  /**
   * Handles pending actions stored in localStorage and applies them to the embed if user is authenticated
   * @param embedDetails The embed details to potentially update
   * @param element The HTML element for loading expand view if needed
   * @param user The authenticated user (if any)
   * @param brandId The brand ID for the current embed
   * @private
   */
  private handlePendingAction(
    embedDetails: EmbedDataType,
    element: HTMLElement,
    user: AuthUser | null | undefined,
    brandId?: number
  ): void {
    // brandId 2801 is for bargainhunter, 2476 is for usmagazine & 2808 is for lifeandstylemag.
    const ignoreExpiry = brandId === 2801 || brandId === 2476 || brandId === 2808 || brandId === 3219;
    const pendingAction = getPendingAction(ignoreExpiry);
    if (!pendingAction) return;
    if (ignoreExpiry) {
      if (user) {
        clearPendingAction();
      }
      return;
    }

    // When pending action data is present in the query params, it should override any data stored in localStorage, as query params have higher priority.
    const hasActionParam = queryUtils.has("action");
    if (hasActionParam) {
      clearPendingAction();
      return;
    }

    // Only apply pending action if the divId matches the current element's ID
    // This ensures the action is applied to the correct embed when multiple embeds exist
    if (pendingAction.divId && pendingAction.divId !== element.id) {
      // This pending action is for a different div, don't process it or clear it
      return;
    }

    if (user) {
      // User config takes priority over pending action data
      if (!embedDetails.startVideoSlug && pendingAction.videoId) {
        embedDetails.startVideoSlug = pendingAction.videoId;
        // Load expand view when startVideoSlug is set from pending action, only if expandOnLoad is not explicitly false
        if (embedDetails.expandOnLoad !== false && !embedDetails.disable_expand_view) {
          const instanceId = element.getAttribute("data-instance-id");
          if (instanceId && this.sdkElements[instanceId]) {
            loadExpandView(element, this.sdkElements[instanceId].config.theme, element.shadowRoot);
          }
        }
      }

      if (!embedDetails.autoUserInteractionToPerform && pendingAction.action) {
        embedDetails.autoUserInteractionToPerform = pendingAction.action as ActionType;
      }

      if (!embedDetails.commentId && pendingAction.commentId) {
        embedDetails.commentId = pendingAction.commentId;
      }

      // Add follow-specific fields for iheart-follow actions only if not already set
      if (pendingAction.action === "iheart-follow") {
        if (!embedDetails.followId && pendingAction.followId) {
          embedDetails.followId = pendingAction.followId;
        }
        if (!embedDetails.followType && pendingAction.followType) {
          embedDetails.followType = pendingAction.followType;
        }
      }
    }

    // Clear pending action only if divId matches (we've successfully applied it to the correct div)
    clearPendingAction();
  }

  /**
   * Retrieves embed details based on the provided configuration and configures them.
   * @param config The configuration for the embed.
   * @param brandDetails The brand details.
   */
  private async getEmbedDetails(config: Partial<SingleEmbedDataConfig>, brandDetails: any): Promise<void> {
    let embedDetails: EmbedDataType | null = null;

    // If embedId is provided, fetch embed details directly
    if (config.embedId) {
      embedDetails = await this.embedDetailsManager.getEmbedDetails(config.embedId, brandDetails);
    }

    // If placementId and styleId are provided, fetch placement data and configure it
    if (config.placementId && config.styleId) {
      embedDetails = await this.placementManager.getPlacementData(config.placementId, config.styleId);

      if (!embedDetails) throw new Error("No embed details found for placement configuration.");
    } else if (!config.embedId) {
      // Neither embedId nor placementId/styleId provided - invalid configuration
      console.warn("Placement ID or Style ID is missing, and no embed ID provided");
      throw new Error("Placement ID or Style ID is missing, and no embed ID provided");
    }

    if (embedDetails) {
      // Add all the other params to embedDetails
      embedDetails.authInfo = config.authInfo;
      embedDetails.startVideoSlug = config.startVideoSlug;
      embedDetails.brand_context = config.brandContext;
      embedDetails.autoUserInteractionToPerform = config.action;
      embedDetails.commentId = config.commentId;
      embedDetails.expandOnLoad = config.expandOnLoad;
      if (config.contextualParams) embedDetails.contextualParams = config.contextualParams;

      // Use brandDetails layout IDs as fallback if not present in embedDetails
      if (!embedDetails.card_layout_id && brandDetails.card_layout_id) {
        embedDetails.card_layout_id = brandDetails.card_layout_id;
      }
      if (!embedDetails.video_layout_id && brandDetails.video_layout_id) {
        embedDetails.video_layout_id = brandDetails.video_layout_id;
      }

      // Store the embed details in the config for later use
      config.embedDetails = embedDetails;
    } else {
      console.warn("No embed details found for configuration.");
      throw new Error("No embed details found for configuration.");
    }
  }

  /**
   * A function to check if the embed is only for expand view based on the configuration.
   */
  private checkIfEmbedIsOnlyForExpand(container: HTMLElement) {
    // Treat elements with zero dimensions or hidden visibility as expand-only
    // (these should not be lazy-loaded since they may be shown via an expand action)
    try {
      const clientWidth = container.clientWidth;
      const clientHeight = container.clientHeight;
      const style = window.getComputedStyle(container);
      const isVisibilityHidden = style.visibility === "hidden" || style.visibility === "collapse" || container.hidden;

      return clientWidth === 0 || clientHeight === 0 || isVisibilityHidden;
    } catch (_e) {
      // Fallback to size-based detection if computed style access fails
      return container.clientWidth === 0 || container.clientHeight === 0;
    }
  }

  private async updateStartVideoId({
    startVideoSlug,
    containerId,
    action,
    commentId,
    sourceInstanceId,
  }: {
    startVideoSlug: string;
    containerId?: string;
    action?: ActionType;
    commentId?: string;
    sourceInstanceId?: string;
  }) {
    if (!containerId) {
      console.warn("Container id is required to update the start video slug scenario");
      return;
    }
    let embedId: string | undefined = undefined;
    let placementId: string | undefined = undefined;
    const targetUpdateElement = Object.values(this.sdkElements).find((element) => element.element.id === containerId);
    if (!targetUpdateElement) return;
    embedId = targetUpdateElement.config.embedDetails?.embed_id;
    placementId = targetUpdateElement.config.embedDetails?.placement_id;
    const targetParentInstanceId = targetUpdateElement.element.getAttribute("data-instance-id");
    const isNestedOctoUpdate = typeof sourceInstanceId === "string";
    const shouldHandleExpandView = !targetUpdateElement?.config?.disableExpandView && !isNestedOctoUpdate;

    if (shouldHandleExpandView && targetUpdateElement?.element)
      loadExpandView(
        targetUpdateElement.element,
        targetUpdateElement.config.theme,
        targetUpdateElement.element.shadowRoot
      );

    this.eventManager.emit(SDKEventType.SDK_UPDATE_START_VIDEO_SLUG, {
      embedId,
      startVideoSlug,
      action,
      placementId,
      commentId,
      sourceInstanceId,
      instanceId: targetParentInstanceId ?? undefined,
    });
    if (shouldHandleExpandView && targetUpdateElement?.element) {
      this.eventManager.emit(SDKEventType.SDK_EXPAND_EMBED, {
        embedId: embedId,
        placementId: placementId,
        instanceId: targetParentInstanceId ?? undefined,
      });
    }
  }

  /**
   * Updates the contextual parameters in the specified embed.
   * @param param0 The parameters for updating the embed.
   */
  private async updateContextualParamsInEmbed({
    contextualParams,
    containerId,
  }: {
    contextualParams: ContextualParamsType;
    containerId?: string;
  }) {
    if (!containerId) {
      console.warn("Container id is not provided to update the contextual params");
      return;
    }
    let embedId = undefined,
      placementId = undefined;
    const updateTargetElement = Object.values(this.sdkElements).find((element) => element.element.id === containerId);
    if (!updateTargetElement) return;
    const oldContextualParams = updateTargetElement.config.contextualParams || {};

    contextualParams = this.deepMergeObjects(oldContextualParams, contextualParams || {});
    embedId = updateTargetElement.config.embedDetails?.embed_id;
    placementId = updateTargetElement.config.embedDetails?.placement_id;
    if (embedId || placementId) console.log("Emitting event with::", embedId, placementId);
    this.eventManager.emit(SDKEventType.SDK_UPDATE_CONTEXTUAL_PARAMS, {
      embedId,
      placementId,
      contextualParams,
    });
  }

  /**
   * Authenticates a user with the provided token and user parameters.
   * @param token The authentication token.
   * @param userParams Additional user parameters.
   * @returns The authenticated user or null if authentication fails.
   */
  private async authenticateUser({ token, userParams }: { token: string; userParams?: Record<string, any> }) {
    try {
      const brandId = Object.values(this.sdkElements)[0]?.config?.brandDetails?.brand_id;

      let user: AuthUser | null;
      // without brandId we can't authenticate the user.
      if (brandId) {
        user = await this.tokenManager.getCurrentUser({
          token,
          params: userParams,
          // There won't be multiple brands embeds on one page So by default taking first embed's brandId.
          brandId,
        });
        if (user) {
          this.eventManager.emit(SDKEventType.SDK_AUTHENTICATE_USER, user);
          return user;
        }

        return null;
      }
    } catch (error) {
      console.error("Failed to authenticate user:", error);
    }

    return;
  }

  /** * Ensures the SDK-specific class is present on the given element.
        This is used to reliably identify and target elements managed by the SDK.
        If the required class does not already exist on the element,
        it will be explicitly added to avoid duplicate checks elsewhere in the codebase.
        @param element - The DOM element to validate and update */
  private validateHTML(element: HTMLElement): void {
    if (!element.classList.contains("gen-sdk-class")) {
      element.classList.add("gen-sdk-class");
    }
  }

  /**
   * Get and set elements with id "gen-sdk", starting with "gen-sdk-", or having gen-sdk-class, and dedupe them.
   * Sets up the Shadow DOM for each element before rendering any loaders so all content
   * (skeletons included) lives inside the shadow root from the very first paint.
   */
  private async getAndSetDivs(configByUser?: ConfigByUser) {
    const selector =
      '[id="gen-sdk"]:not(.gen-sdk-root-portal):not([data-portal-container]), [id^="gen-sdk-"]:not(.gen-sdk-root-portal):not([data-portal-container]), .gen-sdk-class:not(.gen-sdk-root-portal):not([data-portal-container])';

    const elements: HTMLElement[] = Array.from(document.querySelectorAll(selector)).filter(
      (el): el is HTMLElement => el instanceof HTMLElement
    );

    const shadowHosts = Array.from(document.querySelectorAll("[data-genuin-host], [data-genuin-overlay-host]")).filter(
      (el): el is HTMLElement => el instanceof HTMLElement
    );

    shadowHosts.forEach((host) => {
      const { shadowRoot } = host;
      if (!shadowRoot) return;
      shadowRoot.querySelectorAll(selector).forEach((el) => {
        if (el instanceof HTMLElement) {
          elements.push(el);
        }
      });
    });

    // Check for duplicate IDs and warn the user
    const idMap = new Map<string, number>();
    elements.forEach((element) => {
      const elementId = element.id;
      // Ignore gen-sdk-toaster-root
      if (elementId && elementId !== "gen-sdk-toaster-root") {
        const count = idMap.get(elementId) || 0;
        idMap.set(elementId, count + 1);
      }
    });

    // Warn about duplicate IDs
    idMap.forEach((count, id) => {
      if (count > 1) {
        console.warn(
          `[Genuin SDK Warning]: Found ${count} elements with the same ID "${id}". ` +
            `Each embed container must have a unique ID. Please change the duplicate IDs to ensure proper initialization. ` +
            `Example: <div id="gen-sdk-1">, <div id="gen-sdk-2">, etc.`
        );
      }
    });

    // Deduplicate using a Set to track element references
    const uniqueElements = new Set<HTMLElement>();
    console.log(
      "[SDK Init] Found elements:",
      elements.length,
      "with parent_instance_id:",
      configByUser?.parent_instance_id
    );

    elements.forEach((element) => {
      // Ignore gen-sdk-toaster-root
      if ((element as HTMLElement).id === "gen-sdk-toaster-root") {
        return;
      }
      if (this.getInitializationStatus(element as HTMLElement) === "pending") {
        uniqueElements.add(element as HTMLElement);
      } else {
        console.log("Embed already initialized in element:", element);
      }
    });

    console.log("uniqueElements", uniqueElements);

    for (const element of Array.from(uniqueElements)) {
      // If this init call has parent_instance_id, it's a nested SDK initialization
      // Skip any container that's already been initialized (the parent)
      if (configByUser?.parent_instance_id) {
        const existingInstanceId = element.getAttribute("data-instance-id");

        if (existingInstanceId && this.sdkElements[existingInstanceId]) {
          // This is the parent container, skip it
          return;
        }
      }

      const instanceId = this.setInstanceId(element);
      this.validateHTML(element);
      const extractedData = this.extractDataFromSingleDiv(element, configByUser);

      // Override container height to 500px for specific placement ID
      if (extractedData.placementId === "69c2812fd98484cf6b83a5ba") {
        element.style.height = "560px";
      }

      // Hide embed on mobile for specific embed ID
      if (
        extractedData.embedId === "69c38273686a088a80a25ea2" &&
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      ) {
        element.style.height = "0px";
        element.style.width = "0px";
        const parent = element.parentElement;
        if (parent) {
          const headingTitle = parent.querySelector(".heading-title");
          if (headingTitle instanceof HTMLElement) {
            headingTitle.hidden = true;
          }
        }
        continue;
      }

      // Shadow DOM is enabled by default (useShadowDOM !== false).
      // Set up the Shadow DOM before any rendering so every subsequent write
      // (skeleton, expand loader, React root) targets the shadow root from the
      // very first paint — eliminating the blink caused by late attachment.
      const useShadowDOM = extractedData.useShadowDOM !== false;
      const shadowTarget = useShadowDOM ? await setupMainShadowDOM(element) : element;

      // Propagate the resolved flag so downstream consumers (loadNewEmbed, EmbedRoot)
      // see the same value without re-computing it.
      extractedData.useShadowDOM = useShadowDOM;

      // Show loading skeleton immediately (inside shadow root when enabled)
      loadLoadingView(shadowTarget, extractedData.theme);

      // Load expand view if expandOnLoad is set
      if (
        extractedData.expandOnLoad === true ||
        (extractedData.startVideoSlug && extractedData.expandOnLoad !== false)
      ) {
        loadExpandView(element, extractedData.theme, useShadowDOM ? element.shadowRoot : null);
      }

      if (extractedData) {
        console.log("extractedData", extractedData);

        this.sdkElements[instanceId] = {
          element,
          shadowTarget,
          config: extractedData,
          status: "pending",
        };
      }
    }

    const userErrorHandler = configByUser?.error_handler || configByUser?.errorHandler;
    if (userErrorHandler) {
      this.eventManager.on(SDKEventType.SDK_EMBED_ERROR, ({ payload }) => {
        console.log("[gen-sdk]: Calling user error handler with:", payload);
        userErrorHandler(payload);
      });
      this.eventManager.on(SDKEventType.SDK_EMBED_NO_CONTENT, ({ payload }) => {
        console.log("[gen-sdk]: Calling user error handler with:", payload);
        userErrorHandler(payload);
      });
    }

    return this.sdkElements;
  }

  /**
   * Attempts to parse a JSON string, returns the parsed object or the original value if parsing fails.
   * @param value The string value to parse.
   * @returns The parsed JSON object or the original value.
   */
  private tryJsonParse(value: string | null): any {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
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
    configByUser?: ConfigByUser
  ): Partial<SingleEmbedDataConfig> {
    const answerToReturn: Partial<SingleEmbedDataConfig> = {};

    // In case of live embed, we don't need to check for any other attribute.
    if (configByUser?.live) {
      return this.extractLiveEmbedData(answerToReturn, configByUser);
    }

    const possibleAttributeNames = [
      "data-embed-id",
      "data-api-key",
      "data-style-id",
      "data-placement-id",
      "data-token",
      "data-lat",
      "data-comment-id",
      "data-long",
      "data-url",
      "data-page-context",
      "data-brand-ids",
      /**
       * @deprecated use data-video-ids instead
       */
      "data-video-id",
      "data-action",
      "data-previous-page-context",
      "data-user-context",
      "data-geo",
      "data-place",
      "data-time",
      "data-user-segments",
      "data-brands-ids",
      "data-user-interests",
      "data-posted-by-user-ids",
      "data-community-ids",
      "data-loop-ids",
      "data-theme",
      "data-website-type",
      "data-player-playing",
      "data-episode-id",
      "data-embed-style",
      "data-video-ids",
      "data-start-video-slug",
      "data-initial-video-ids",
      "data-expand-on-load",
      "data-allow-gesture-scroll",
    ] as const;

    // Extract core configuration attributes from the HTML element
    const dataEmbedId = singleElement.getAttribute("data-embed-id");
    const dataStyleId = singleElement.getAttribute("data-style-id");
    const dataPlacementId = singleElement.getAttribute("data-placement-id");

    // Priority 1: If both placement and style IDs are provided via data attributes,
    // use placement-based configuration (placement takes precedence over embed)
    if (dataPlacementId && dataStyleId) {
      answerToReturn.placementId = dataPlacementId;
      answerToReturn.styleId = dataStyleId;
      answerToReturn.embedId = undefined;
      answerToReturn.apiKey = undefined;
    }

    // Priority 2: If only embed ID is provided (and no placement/style),
    // use embed-based configuration
    if (dataEmbedId && !dataPlacementId && !dataStyleId) {
      answerToReturn.embedId = dataEmbedId;
    }

    // Priority 3: If no configuration found from data attributes,
    // fall back to user-provided configuration
    if (!answerToReturn.embedId && !answerToReturn.placementId && !answerToReturn.styleId) {
      if (configByUser?.placement_id && configByUser.style_id) {
        answerToReturn.placementId = configByUser.placement_id;
        answerToReturn.styleId = configByUser.style_id;
      } else {
        answerToReturn.embedId = configByUser?.embed_id;
      }
    }

    // This code is for backward compatibility
    if (configByUser && !configByUser?.contextual_params) {
      configByUser.contextual_params = configByUser?.contextualParams;
    }

    // This code is for backward compatibility
    if (configByUser && !configByUser?.auth_info) {
      configByUser.auth_info = configByUser?.authInfo;
    }

    // Extract additional configuration attributes from the element
    for (const attr of possibleAttributeNames) {
      let value = singleElement.getAttribute(attr);
      switch (attr) {
        // case 'data-embed-id':
        //   answerToReturn.embedId = value ?? configByUser?.embed_id
        //   continue
        //   continue
        case "data-api-key":
          answerToReturn.apiKey = value ?? configByUser?.api_key;
          break;
        // case 'data-placement-id':
        //   answerToReturn.placementId = value ?? configByUser?.placement_id
        //   continue
        // case 'data-style-id':
        //   answerToReturn.styleId = value ?? configByUser?.style_id
        //   continue
        case "data-comment-id":
          answerToReturn.commentId = value ?? configByUser?.comment_id;
          break;
        case "data-token": {
          // Use token only if it's a valid value (not null, undefined, empty, or 'undefined'/'null' strings)
          const tokenValue = value ?? configByUser?.token;
          answerToReturn.token = this.isValidToken(tokenValue) ? tokenValue : undefined;
          break;
        }
        case "data-video-id":
          if (value || configByUser?.start_video_slug) {
            answerToReturn.startVideoSlug = value ?? configByUser?.start_video_slug;
          }
          break;
        case "data-start-video-slug":
          if (value || configByUser?.start_video_slug) {
            answerToReturn.startVideoSlug = value ?? configByUser?.start_video_slug;
          }
          break;
        case "data-action":
          answerToReturn.action = (value ?? configByUser?.action) as ActionType | undefined;
          break;
        case "data-lat":
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          answerToReturn.contextualParams.geo = answerToReturn.contextualParams.geo || {};
          value =
            typeof value === "string"
              ? value
              : typeof configByUser?.contextual_params?.geo?.lat === "string"
                ? configByUser?.contextual_params?.geo?.lat
                : value !== undefined
                  ? String(value)
                  : null;
          if (typeof value === "string") {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
              answerToReturn.contextualParams.geo.lat = parsedValue;
            }
          } else if (typeof value === "number") {
            answerToReturn.contextualParams.geo.lat = value;
          }
          break;
        case "data-long": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          answerToReturn.contextualParams.geo = answerToReturn.contextualParams.geo || {};
          const longValue = value ?? configByUser?.contextual_params?.geo?.long;
          if (typeof longValue === "string") {
            const parsedLong = parseFloat(longValue);
            if (!isNaN(parsedLong)) {
              answerToReturn.contextualParams.geo.long = parsedLong;
            }
          } else if (typeof longValue === "number") {
            answerToReturn.contextualParams.geo.long = longValue;
          }
          break;
        }
        case "data-url":
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          answerToReturn.contextualParams.url = value ?? configByUser?.contextual_params?.url;
          break;
        case "data-page-context":
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          answerToReturn.contextualParams.page_context = value ?? configByUser?.contextual_params?.page_context;
          break;
        case "data-previous-page-context":
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          answerToReturn.contextualParams.previous_page_context =
            value ?? configByUser?.contextual_params?.previous_page_context;
          break;
        case "data-user-context":
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          answerToReturn.contextualParams.user_context = value ?? configByUser?.contextual_params?.user_context;
          break;
        case "data-geo": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          answerToReturn.contextualParams.geo = answerToReturn.contextualParams.geo || {};
          const geoParsed = this.tryJsonParse(value);
          if (geoParsed && typeof geoParsed === "object") {
            answerToReturn.contextualParams.geo = {
              ...answerToReturn.contextualParams.geo,
              ...geoParsed,
            };
          } else {
            answerToReturn.contextualParams.geo = {
              ...answerToReturn.contextualParams.geo,
              ...configByUser?.contextual_params?.geo,
            };
          }
          break;
        }
        case "data-place": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          const placeParsed = this.tryJsonParse(value);
          answerToReturn.contextualParams.place =
            placeParsed && typeof placeParsed === "object" ? placeParsed : configByUser?.contextual_params?.place;
          break;
        }
        case "data-time":
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          if (value) {
            const parsedTime = parseFloat(value);
            answerToReturn.contextualParams.time = isNaN(parsedTime) ? value : parsedTime;
          } else {
            answerToReturn.contextualParams.time = configByUser?.contextual_params?.time;
          }
          break;
        case "data-user-segments": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          const userSegmentsParsed = this.tryJsonParse(value);
          answerToReturn.contextualParams.user_segments =
            userSegmentsParsed && typeof userSegmentsParsed === "object"
              ? userSegmentsParsed
              : configByUser?.contextual_params?.user_segments;
          break;
        }
        case "data-brands-ids": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          const brandsIdsParsed = this.tryJsonParse(value);
          answerToReturn.contextualParams.brands_ids = Array.isArray(brandsIdsParsed)
            ? brandsIdsParsed
            : configByUser?.contextual_params?.brands_ids;
          break;
        }
        case "data-user-interests": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          const userInterestsParsed = this.tryJsonParse(value);
          answerToReturn.contextualParams.user_interests = Array.isArray(userInterestsParsed)
            ? userInterestsParsed
            : configByUser?.contextual_params?.user_interests;
          break;
        }
        case "data-posted-by-user-ids": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          const postedByUserIdsParsed = this.tryJsonParse(value);
          answerToReturn.contextualParams.posted_by_user_ids = Array.isArray(postedByUserIdsParsed)
            ? postedByUserIdsParsed
            : configByUser?.contextual_params?.posted_by_user_ids;
          break;
        }
        case "data-community-ids": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          const communityIdsParsed = this.tryJsonParse(value);
          answerToReturn.contextualParams.community_ids = Array.isArray(communityIdsParsed)
            ? communityIdsParsed
            : configByUser?.contextual_params?.community_ids;
          break;
        }
        case "data-loop-ids": {
          answerToReturn.contextualParams = answerToReturn.contextualParams || {};
          const loopIdsParsed = this.tryJsonParse(value);
          answerToReturn.contextualParams.loop_ids = Array.isArray(loopIdsParsed)
            ? loopIdsParsed
            : configByUser?.contextual_params?.loop_ids;
          break;
        }
        case "data-theme": {
          const themeValue = value ?? configByUser?.theme;
          if (themeValue === "dark" || themeValue === "light") {
            answerToReturn.theme = themeValue;
          }
          break;
        }
        case "data-website-type": {
          const websiteType = value ?? configByUser?.website_type;
          if (websiteType === "legacy" || websiteType === "polaris") {
            answerToReturn.websiteType = websiteType;
          }
          break;
        }
        case "data-player-playing": {
          const brand = configByUser?.brand_context?.[0];
          if (!brand) break;
          brand.isPlaying = value === "true";
          break;
        }
        case "data-episode-id": {
          const brand_context = configByUser?.brand_context?.[0];
          if (!brand_context) break;
          brand_context.episodeId = value ?? brand_context.episodeId;
          break;
        }
        case "data-embed-style":
          if (value && value === "expand_only") {
            answerToReturn.embedStyle = value;
          }
          break;
        case "data-video-ids":
          if (value) {
            answerToReturn.videoIds = value.split(",");
          } else {
            answerToReturn.videoIds = configByUser?.video_ids?.split(",");
          }
          break;
        case "data-initial-video-ids":
          if (value) {
            answerToReturn.initialVideoIds = value.split(",");
          } else {
            answerToReturn.initialVideoIds = configByUser?.initial_video_ids?.split(",");
          }
          break;
        case "data-expand-on-load":
          // Only set expandOnLoad if the attribute is explicitly provided
          if (value !== null) {
            answerToReturn.expandOnLoad = value === "true";
          }
          break;
        case "data-allow-gesture-scroll": {
          if (value !== null) {
            answerToReturn.allowGestureScroll = value !== "false";
          } else if (configByUser?.allow_gesture_scroll !== undefined) {
            answerToReturn.allowGestureScroll = configByUser.allow_gesture_scroll;
          }
          break;
        }
        default:
          break;
      }
    }

    // If startVideoSlug is set and expandOnLoad was not explicitly provided,
    // default expandOnLoad to true
    if (answerToReturn.startVideoSlug && answerToReturn.expandOnLoad === undefined) {
      answerToReturn.expandOnLoad = true;
    }

    // extras needed to set explicitly from user config.
    answerToReturn.params = configByUser?.params;
    answerToReturn.authInfo = configByUser?.authInfo;
    answerToReturn.brandContext = configByUser?.brand_context;
    answerToReturn.useShadowDOM = configByUser?.useShadowDOM;
    answerToReturn.parentInstanceId = configByUser?.parent_instance_id;

    let currentElement: HTMLElement | null = singleElement;
    let isNested = false;

    while (currentElement) {
      if (currentElement.getAttribute("data-web-sdk-nested") === "true") {
        isNested = true;
        console.log("[Web-SDK] Detected nested rendering - expand view will be disabled");
        break;
      }
      currentElement = currentElement.parentElement;
    }

    answerToReturn.disableExpandView = isNested;

    return answerToReturn;
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
    configByUser: ConfigByUser
  ): Partial<SingleEmbedDataConfig> {
    const liveData = configByUser.live;

    // Guard: this function is only called when configByUser.live is defined (see call site).
    if (!liveData) {
      return answerToReturn;
    }

    if (liveData.embed_id) {
      answerToReturn.embedId = liveData.embed_id;
    }

    if (liveData.placement_id && liveData.style_id) {
      answerToReturn.placementId = liveData.placement_id;
      answerToReturn.styleId = liveData.style_id;
      answerToReturn.embedId = undefined;

      // Parse the placement to get embed details
      // if (answerToReturn.styleId) {
      //   answerToReturn.embedDetails = parsePlacementToEmbedData(
      //     liveData,
      //     answerToReturn.styleId,
      //   )
      // }
    }

    answerToReturn.apiKey = liveData.api_key;
    answerToReturn.live = liveData;

    return answerToReturn;
  }

  /**
   * Checks the initialization status of the element.
   * @param element The HTML element to check.
   * @returns The initialization status: 'pending', 'loading', or 'done'.
   */
  private getInitializationStatus(element: HTMLElement): InitializationStatus {
    const status = element.getAttribute("data-status");
    if (status === "pending" || status === "loading" || status === "done") {
      return status;
    }
    return "pending"; // Default to pending if not set or invalid
  }

  /**
   * Sets the initialization status of the element.
   * @param element The HTML element to set the status on.
   * @param status The initialization status to set: 'pending', 'loading', or 'done'.
   */
  private setInitializationStatus(element: HTMLElement, status: InitializationStatus): void {
    element.setAttribute("data-status", status);
  }

  /**
   * Sets a unique instance ID on the element.
   * @param element The HTML element to set the instance ID on.
   * @returns The generated instance ID.
   */
  private setInstanceId(element: HTMLElement) {
    const instanceId = `sdk-instance-${Date.now()}-${getRandomNumber(1, 1000000)}`;
    element.setAttribute("data-instance-id", instanceId);
    return instanceId;
  }

  /**
   * Checks if the current embed is a single instance.
   * @returns True if it's a single embed, false otherwise.
   */
  private isSingleEmbed() {
    return Object.keys(this.sdkElements).length === 1;
  }

  /**
   * Subscribe to SDK events
   */
  on(eventType: SDKEventType, listener: EventListener): () => void {
    if (!ALLOWED_EVENTS.includes(eventType)) {
      console.warn(`Event "${eventType}" is not in the allowed events list. Allowed events:`, ALLOWED_EVENTS);
      return () => {};
    }
    return this.eventManager.on(eventType, listener);
  }

  onInternal(eventType: SDKEventType, listener: EventListener): () => void {
    return this.eventManager.on(eventType, listener);
  }

  /**
   * Unsubscribe from SDK events
   */
  off(eventType: SDKEventType, listener: EventListener): void {
    if (!ALLOWED_EVENTS.includes(eventType)) {
      console.warn(`Event "${eventType}" is not in the allowed events list. Allowed events:`, ALLOWED_EVENTS);
      return;
    }
    this.eventManager.off(eventType, listener);
  }

  /**
   * Unsubscribe from SDK events
   */
  offInternal(eventType: SDKEventType, listener: EventListener): void {
    this.eventManager.off(eventType, listener);
  }

  /**
   * Subscribe to all SDK events
   */
  onAll(listener: EventListener): () => void {
    return this.eventManager.onAll(listener);
  }

  /**
   * Deep merges two objects by recursively merging all nested properties
   * @param target The target object to merge into
   * @param source The source object to merge from
   * @returns A new object with merged properties
   * @private
   */
  private deepMergeObjects<T extends Record<string, any>>(target?: T, source?: Record<string, any>): T {
    if (!target) return source as T;
    if (!source) return target as T;
    // Create a new object to avoid mutating either input
    const result = { ...target } as Record<string, any>;

    Object.keys(source).forEach((key) => {
      if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
        // For nested objects, recursively merge
        if (key in result && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMergeObjects(result[key], source[key]);
        } else {
          // If the key doesn't exist in target or isn't an object, create/overwrite it
          result[key] = { ...source[key] };
        }
      } else {
        // For non-objects (including arrays), directly assign the value
        result[key] = source[key];
      }
    });

    return result as T;
  }

  /**
   * Emits an event to the SDK event system
   * @param eventType The type of the event to emit
   * @param payload The data to include with the event
   */
  emit(eventType: SDKEventType, payload?: any): void {
    if (!ALLOWED_EMIT_EVENTS.includes(eventType)) {
      console.warn(`Event "${eventType}" is not in the allowed events list. Allowed events:`, ALLOWED_EMIT_EVENTS);
      return;
    }
    this.eventManager.emit(eventType, payload);
  }

  emitInternal(eventType: SDKEventType, payload?: any): void {
    this.eventManager.emit(eventType, payload);
  }

  /**
   * Check if SDK is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get error history
   */
  getErrors(): any[] {
    return this.errorHandler.getErrors();
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errorHandler.clearErrors();
  }

  /**
   * Expands (opens) the expand view for a specific embed.
   * @param id - The div element ID to target (required; if multiple elements with same ID exist, the first one will be used)
   */
  expand(id: string): void {
    // Check if SDK is initialized
    if (!this.isInitialized) {
      console.error("SDK is not initialized. Please call genuin.init({}) first to use genuin.expand().");
      return;
    }

    // Validate that id is provided and not empty
    if (!id || id.trim() === "") {
      console.error("ID parameter is required for expand() method.");
      return;
    }

    // Find target embed based on id
    let targetEmbedId: string | undefined;
    let targetPlacementId: string | undefined;

    // Find by div element ID (use first element if multiple exist)
    const element = document.getElementById(id);

    const instanceId = element?.getAttribute("data-instance-id");
    if (element && instanceId) {
      if (this.sdkElements[instanceId]) {
        targetEmbedId = this.sdkElements[instanceId].config.embedDetails?.embed_id;
        targetPlacementId = this.sdkElements[instanceId].config.embedDetails?.placement_id;
      }
    }

    if (!targetEmbedId && !targetPlacementId) {
      console.warn("Could not find embed with id:", id);
      return;
    }

    this.eventManager.emit(SDKEventType.SDK_EXPAND_EMBED, {
      embedId: targetEmbedId,
      placementId: targetPlacementId,
      instanceId,
    });
  }

  /**
   * Collapses (closes) the expand view for a specific embed.
   * @param id - The div element ID to target (required; if multiple elements with same ID exist, the first one will be used)
   */
  collapse(id: string): void {
    // Check if SDK is initialized
    if (!this.isInitialized) {
      console.error("SDK is not initialized. Please call genuin.init({}) first to use genuin.collapse().");
      return;
    }

    // Validate that id is provided and not empty
    if (!id || id.trim() === "") {
      console.error("ID parameter is required for collapse() method.");
      return;
    }

    // Find target embed based on id
    let targetEmbedId: string | undefined;
    let targetPlacementId: string | undefined;

    // Find by div element ID (use first element if multiple exist)
    const element = document.getElementById(id);
    if (element) {
      const instanceId = element.getAttribute("data-instance-id");
      if (instanceId && this.sdkElements[instanceId]) {
        targetEmbedId = this.sdkElements[instanceId].config.embedDetails?.embed_id;
        targetPlacementId = this.sdkElements[instanceId].config.embedDetails?.placement_id;
      }
    }

    if (!targetEmbedId && !targetPlacementId) {
      console.warn("Could not find embed with id:", id);
      return;
    }

    this.eventManager.emit(SDKEventType.SDK_COLLAPSE_EMBED, {
      embedId: targetEmbedId,
      placementId: targetPlacementId,
    });
  }

  /**
   * Logs out the current user by clearing authentication data and emitting logout event.
   * This will:
   * - Clear user data from token manager
   * - Emit logout event to authentication provider
   * - Clear cached user session
   */
  logout(): void {
    // Check if SDK is initialized
    if (!this.isInitialized) {
      this.errorHandler.handleError(
        ErrorType.CONFIGURATION_ERROR,
        "Cannot logout: SDK is not initialized. Please call initialize() first."
      );
      return;
    }

    // Check if user is logged in
    if (!this.tokenManager.hasUserData()) {
      console.warn("GenuinSDK: No user is currently logged in. Logout skipped.");
      return;
    }

    try {
      // Clear authentication data from token manager
      this.tokenManager.clearAuth();

      // Emit logout event to notify authentication provider
      this.eventManager.emit(SDKEventType.SDK_LOGOUT_USER);
    } catch (error) {
      this.errorHandler.handleError(
        ErrorType.AUTHENTICATION_ERROR,
        `Failed to logout: ${error instanceof Error ? error.message : "Unknown error"}`,
        { originalError: error instanceof Error ? error : undefined }
      );
    }
  }

  /**
   * Destroy all embeds and reset SDK
   */
  destroy(): void {
    // Call cleanup functions for all embeds to unmount React roots
    Object.values(this.sdkElements).forEach((embedElement) => {
      if (embedElement.cleanup && typeof embedElement.cleanup === "function") {
        try {
          embedElement.cleanup();
        } catch (error) {
          console.error("Error during embed cleanup:", error);
        }
      }
    });

    // Remove all iframes
    const iframes = document.querySelectorAll("iframe[data-genuin-embed]");
    iframes.forEach((iframe) => iframe.remove());

    // Clear all listeners and state
    this.eventManager.removeAllListeners();
    this.errorHandler.clearErrors();
    this.isInitialized = false;
    this.sdkElements = {};

    // Don't know why this error is being thrown.
    // this.eventManager.emit(SDKEventType.EMBED_LOADED, { destroyed: true })
  }
}

// Export singleton instance
export const Genuin = GenuinSDK.getInstance();
