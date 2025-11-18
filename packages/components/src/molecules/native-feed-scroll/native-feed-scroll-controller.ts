/**
 * NativeFeedScrollController
 *
 * Core controller class for managing native scroll-based carousel behavior.
 * This class encapsulates all business logic for scroll position tracking,
 * active index calculation, navigation, and event management.
 *
 * @example
 * ```typescript
 * const controller = new NativeFeedScrollController();
 * controller.init(containerElement, {
 *   containerHeight: 800,
 *   slidesPerView: 1,
 *   spaceBetween: 10
 * });
 *
 * controller.on('slideChange', (instance) => {
 *   console.log('Active index:', instance.activeIndex);
 * });
 *
 * controller.slideNext();
 * ```
 */

import type {
  NativeFeedScrollConfig,
  NativeFeedScrollInstance,
  NativeFeedScrollParams,
  EventHandler,
} from "./native-feed-scroll.types";

export class NativeFeedScrollController implements NativeFeedScrollInstance {
  // ==================== State Properties ====================

  /** Current active slide index (0-based) */
  private _activeIndex: number = 0;

  /** Whether the carousel is at the beginning */
  private _isBeginning: boolean = true;

  /** Whether the carousel is at the end */
  private _isEnd: boolean = false;

  /** Previous active index for change detection */
  private _previousIndex: number = 0;

  // ==================== DOM References ====================

  /** Container DOM element reference */
  private _container: HTMLElement | null = null;

  /** Array of slide DOM elements */
  private _slides: HTMLElement[] = [];

  // ==================== Configuration ====================

  /** Controller configuration options */
  private _config: NativeFeedScrollConfig | null = null;

  // ==================== Event System ====================

  /** Custom event emitter: Map of event names to handler sets */
  private _eventHandlers: Map<string, Set<EventHandler>> = new Map();

  // ==================== Internal State ====================

  /**
   * Whether controller is in window mode (tracks viewport scroll) or container mode
   * - true: Uses window viewport for scroll tracking
   * - false: Uses container element for scroll tracking
   */
  private _isWindowMode: boolean = false;

  /** Debounce timer for scroll handler */
  private _scrollDebounceTimer: NodeJS.Timeout | null = null;

  /** Debounce timer for Intersection Observer updates */
  private _ioDebounceTimer: NodeJS.Timeout | null = null;

  /** Idle detection timer to reset scroll direction after prolonged inactivity */
  private _idleDetectionTimer: NodeJS.Timeout | null = null;

  /** Debounce delay in milliseconds */
  private readonly SCROLL_DEBOUNCE_DELAY = 150;

  /** IO callback debounce delay in milliseconds - reduced for faster response */
  private readonly IO_DEBOUNCE_DELAY = 300;

  /** High velocity scroll threshold (pixels per millisecond) */
  private readonly HIGH_VELOCITY_THRESHOLD = 2;

  /** Low velocity debounce delay in milliseconds */
  private readonly LOW_VELOCITY_DEBOUNCE = 150;

  /** High velocity debounce delay in milliseconds */
  private readonly HIGH_VELOCITY_DEBOUNCE = 50;

  /** Idle detection delay - reset direction after this period of inactivity */
  private readonly IDLE_DETECTION_DELAY = 500;

  /** Bound event handler references for cleanup */
  private _boundHandleScroll: ((e: Event) => void) | null = null;
  private _boundHandleKeyboard: ((e: KeyboardEvent) => void) | null = null;

  // ==================== Accessibility State ====================

  /** ARIA live region for screen reader announcements */
  private _liveRegion: HTMLElement | null = null;

  // ==================== Intersection Observer State ====================

  /** Intersection Observer instance for tracking slide visibility */
  private _intersectionObserver: IntersectionObserver | null = null;

  /** Map of slide indices to their intersection ratios (0-1) */
  private _intersectionRatios: Map<number, number> = new Map();

  // ==================== Scroll Velocity Tracking ====================

  /** Last recorded scroll position */
  private _lastScrollTop: number = 0;

  /** Last recorded scroll timestamp */
  private _lastScrollTime: number = 0;

  /** Current scroll velocity in pixels per millisecond */
  private _scrollVelocity: number = 0;

  /** Current scroll direction */
  private _scrollDirection: "up" | "down" | "idle" = "idle";

  // ==================== High-Velocity Throttling State ====================

  /** Track if currently in high-velocity scrolling mode */
  private _isHighVelocityScrolling: boolean = false;

  /** Timestamp of last activeIndex change */
  private _lastActiveIndexChangeTime: number = 0;

  /** Minimum interval between activeIndex changes during high-velocity scrolling (ms) */
  private readonly MIN_HIGH_VELOCITY_INDEX_CHANGE_INTERVAL = 200;

  /** Threshold for backward scrolling - increased for stability */
  private readonly BACKWARD_SCROLL_VISIBILITY_THRESHOLD = 0.45;

  /** Threshold for forward scrolling */
  private readonly FORWARD_SCROLL_VISIBILITY_THRESHOLD = 0.5;

  /** Hysteresis delta - amount visibility must change to switch back */
  private readonly HYSTERESIS_DELTA = 0.1;

  // ==================== Public Getters ====================

  /**
   * Get current active slide index
   * @returns Current active index (0-based)
   */
  get activeIndex(): number {
    return this._activeIndex;
  }

  /**
   * Get previous active slide index
   * Useful for tracking slide direction (forward/backward)
   * @returns Previous active index (0-based)
   */
  get previousIndex(): number {
    return this._previousIndex;
  }

  /**
   * Check if carousel is at the beginning
   * @returns True if at the start
   */
  get isBeginning(): boolean {
    return this._isBeginning;
  }

  /**
   * Check if carousel is at the end
   * @returns True if at the end
   */
  get isEnd(): boolean {
    return this._isEnd;
  }

  /**
   * Get array of slide elements
   * @returns Array of slide DOM elements
   */
  get slides(): HTMLElement[] {
    return this._slides;
  }

  /**
   * Get container element
   * @returns Container DOM element or null
   */
  get container(): HTMLElement | null {
    return this._container;
  }

  /**
   * Get container element (Swiper-compatible alias)
   * @returns Container DOM element or null
   */
  get el(): HTMLElement | null {
    return this._container;
  }

  /**
   * Get configuration parameters (Swiper-compatible)
   * @returns Configuration parameters object
   */
  get params(): NativeFeedScrollParams {
    return {
      slidesPerView: this._config?.slidesPerView ?? 1,
      centeredSlides: this._config?.centeredSlides ?? false,
      slidesOffsetBefore: this._config?.slidesOffsetBefore ?? 0,
      direction: this._config?.direction ?? "vertical",
    };
  }

  /**
   * Get current scroll progress (Swiper-compatible)
   * Returns a value from 0 (beginning) to 1 (end) based on scroll position
   * This provides continuous progress tracking across the entire scrollable content
   *
   * @returns Progress value between 0 and 1
   * @example
   * ```typescript
   * const currentProgress = controller.progress; // 0.0 to 1.0
   * if (currentProgress >= 0.7) {
   *   // 70% scrolled through content
   *   fetchNextPage();
   * }
   * ```
   */
  get progress(): number {
    if (!this._container || this._slides.length === 0) return 0;

    // Single slide or no scroll range - always return 0
    if (this._slides.length === 1) return 0;

    // Get current scroll position
    const scrollTop = this._isWindowMode
      ? window.scrollY || window.pageYOffset
      : this._container.scrollTop;

    // Get total scrollable distance
    const scrollHeight = this._isWindowMode
      ? document.documentElement.scrollHeight
      : this._container.scrollHeight;

    const clientHeight = this._isWindowMode
      ? window.innerHeight
      : this._container.clientHeight;

    // Calculate maximum scroll position
    const maxScroll = scrollHeight - clientHeight;

    // No scrollable content - return 0
    if (maxScroll <= 0) return 0;

    // Return progress as 0-1, clamped to valid range
    return Math.min(Math.max(scrollTop / maxScroll, 0), 1);
  }

  // ==================== Public Methods ====================

  /**
   * Initialize the controller with DOM container and configuration
   *
   * @param container - DOM element that contains the slides
   * @param config - Configuration options for the controller
   * @throws Error if container is null or invalid
   */
  init(container: HTMLElement | null, config: NativeFeedScrollConfig): void {
    if (!container) {
      throw new Error(
        "NativeFeedScrollController: Container element is required"
      );
    }

    this._container = container;
    this._config = config;

    // Detect operating mode based on config
    // Window mode: containerHeight not provided, uses browser viewport
    // Container mode: containerHeight provided, uses scrollable container
    this._isWindowMode = !config.containerHeight;

    // Update slides from container children
    this._updateSlides();

    // Setup accessibility features
    this._setupAriaAttributes();
    this._setupLiveRegion();

    // Setup Intersection Observer for visibility tracking
    this._setupIntersectionObserver();

    // Setup event listeners
    this._setupEventListeners();

    // Initial state calculation
    this._updateScrollState();
    this._activeIndex = this._calculateMostVisibleIndex();

    // Fire initialization callback
    if (this._config.onInit) {
      this._config.onInit(this);
    }
  }

  /**
   * Update controller after configuration or DOM changes
   * Recalculates slides and current state
   */
  update(): void {
    this._updateSlides();

    // Re-setup Intersection Observer for new slides
    this._setupIntersectionObserver();

    this._updateScrollState();
    const newIndex = this._calculateMostVisibleIndex();
    if (newIndex !== this._activeIndex) {
      this._activeIndex = newIndex;
      this._handleActiveIndexChange();
    }
  }

  /**
   * Update configuration (especially callbacks) without full re-initialization
   * This allows updating event handlers when parent component props change
   *
   * @param config - Partial configuration to merge with existing config
   */
  updateConfig(config: Partial<NativeFeedScrollConfig>): void {
    if (!this._config) {
      console.warn(
        "NativeFeedScrollController: Cannot update config before initialization"
      );
      return;
    }
    this._config = { ...this._config, ...config };
  }

  /**
   * Scroll to a specific slide by index (Swiper-compatible)
   * Works in both container mode and window mode
   *
   * @param index - Target slide index (0-based)
   * @param speed - Animation duration in milliseconds (default: 300, 0 for instant)
   * @param runCallbacks - Whether to fire event callbacks (default: true)
   */
  slideTo(
    index: number,
    speed: number = 300,
    runCallbacks: boolean = true
  ): void {
    if (!this._container || !this._config) return;

    // Validate index bounds
    if (index < 0 || index >= this._slides.length) {
      console.warn(
        `NativeFeedScrollController: Index ${index} out of bounds (0-${this._slides.length - 1})`
      );
      return;
    }

    const targetSlide = this._slides[index];
    if (!targetSlide) return;

    // Respect user's reduced motion preference if configured
    const effectiveSpeed =
      this._config.respectReducedMotion !== false &&
      this._getPrefersReducedMotion()
        ? 0
        : speed;

    // Calculate the target scroll position to center the slide in viewport
    const slideRect = targetSlide.getBoundingClientRect();
    const behavior: ScrollBehavior = effectiveSpeed > 0 ? "smooth" : "auto";

    if (this._isWindowMode) {
      // Window mode: Scroll the window to the slide
      const currentScrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;

      // Calculate slide's top position relative to document
      const slideTopRelativeToDocument = slideRect.top + currentScrollY;

      // Center the slide in the viewport
      const targetScrollY =
        slideTopRelativeToDocument - viewportHeight / 2 + slideRect.height / 2;

      // Perform window scroll
      window.scrollTo({
        top: targetScrollY,
        behavior,
      });
    } else {
      // Container mode: Scroll the container to the slide
      const containerRect = this._container.getBoundingClientRect();
      const currentScrollTop = this._container.scrollTop;
      const containerHeight =
        this._config.containerHeight || containerRect.height;

      // Calculate slide's top position relative to container's scroll position
      const slideTopRelativeToContainer =
        slideRect.top - containerRect.top + currentScrollTop;

      // Center the slide in the viewport
      const targetScrollTop =
        slideTopRelativeToContainer -
        containerHeight / 2 +
        slideRect.height / 2;

      // Perform container scroll
      this._container.scrollTo({
        top: targetScrollTop,
        behavior,
      });
    }

    // Update activeIndex and scroll state immediately
    this._previousIndex = this._activeIndex;
    this._activeIndex = index;
    this._updateScrollState();

    // Manage focus on the target slide for keyboard accessibility
    // Make slide focusable and move focus to it
    if (!targetSlide.hasAttribute("tabindex")) {
      targetSlide.setAttribute("tabindex", "-1");
    }

    // Move focus after a brief delay to ensure scroll has started
    // This provides better UX for screen reader users
    setTimeout(() => {
      targetSlide.focus({ preventScroll: true }); // preventScroll since we're already scrolling
    }, 50);

    // Fire callbacks if requested
    if (runCallbacks && this._previousIndex !== index) {
      this._handleActiveIndexChange();
    }
  }

  /**
   * Scroll to a specific slide by index (deprecated)
   *
   * @param index - Target slide index (0-based)
   * @param smooth - Whether to use smooth scrolling animation (default: true)
   * @deprecated Use slideTo() instead for Swiper compatibility
   */
  scrollToSlide(index: number, smooth: boolean = true): void {
    this.slideTo(index, smooth ? 300 : 0, true);
  }

  /**
   * Navigate to the next slide
   * Does nothing if already at the last slide
   */
  slideNext(): void {
    if (this._activeIndex < this._slides.length - 1) {
      // Announce navigation action before sliding
      this._announceNavigation("next");
      this.slideTo(this._activeIndex + 1);
    } else {
      // Already at last slide - announce boundary message if configured
      if (this._liveRegion && this._config?.lastSlideMessage) {
        this._liveRegion.textContent = this._config.lastSlideMessage;
      }
    }
  }

  /**
   * Navigate to the previous slide
   * Does nothing if already at the first slide
   */
  slidePrev(): void {
    if (this._activeIndex > 0) {
      // Announce navigation action before sliding
      this._announceNavigation("prev");
      this.slideTo(this._activeIndex - 1);
    } else {
      // Already at first slide - announce boundary message if configured
      if (this._liveRegion && this._config?.firstSlideMessage) {
        this._liveRegion.textContent = this._config.firstSlideMessage;
      }
    }
  }

  /**
   * Get visibility percentage of a specific slide
   * Calculates how much of a slide is currently visible in the viewport
   * Works in both container mode and window mode
   *
   * **Optimization:** Uses cached Intersection Observer data when available (instant, no reflow)
   * Falls back to manual calculation only if IO data is unavailable
   *
   * @param options - Configuration object with index and direction
   * @returns Percentage of slide visible (0-100)
   */
  getSlideVisibilityPercentage(options: {
    index: number;
    dir: "vertical" | "horizontal";
  }): number {
    const slide = this._slides[options.index];
    if (!this._container || !slide) {
      return 0;
    }

    // For vertical scrolling, try to use cached IO intersection ratio first
    // This is much faster as it avoids getBoundingClientRect() and DOM reflow
    if (options.dir === "vertical") {
      const cachedRatio = this._intersectionRatios.get(options.index);
      if (cachedRatio !== undefined) {
        // IO ratio is already a percentage (0-1), convert to 0-100
        return cachedRatio * 100;
      }
    }

    // Fallback: Manual calculation (used for horizontal or when IO data unavailable)
    const slideRect = slide.getBoundingClientRect();
    const viewportRect = this._getViewportRect();

    if (options.dir === "vertical") {
      // Calculate visible height for vertical scrolling
      const visibleTop = Math.max(slideRect.top, viewportRect.top);
      const visibleBottom = Math.min(slideRect.bottom, viewportRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const slideHeight = slideRect.height;

      return slideHeight > 0 ? (visibleHeight / slideHeight) * 100 : 0;
    } else {
      // Calculate visible width for horizontal scrolling
      // Note: IO doesn't track horizontal visibility, so always use manual calc
      const visibleLeft = Math.max(slideRect.left, viewportRect.left);
      const visibleRight = Math.min(slideRect.right, viewportRect.right);
      const visibleWidth = Math.max(0, visibleRight - visibleLeft);
      const slideWidth = slideRect.width;

      return slideWidth > 0 ? (visibleWidth / slideWidth) * 100 : 0;
    }
  }

  /**
   * Get visibility percentage of a slide by index
   * Simplified method that uses the configured direction (defaults to vertical)
   *
   * @param index - The slide index (0-based)
   * @returns Percentage of slide visible (0-100)
   */
  getVisibilityPercentageByIndex(index: number): number {
    // Validate index bounds
    if (index < 0 || index >= this._slides.length) {
      console.warn(
        `NativeFeedScrollController: Index ${index} out of bounds (0-${this._slides.length - 1})`
      );
      return 0;
    }

    // Use the configured direction, defaulting to vertical
    const direction = this._config?.direction || "vertical";

    return this.getSlideVisibilityPercentage({
      index,
      dir: direction,
    });
  }

  /**
   * Subscribe to a custom event
   *
   * @param event - Event name (e.g., "slideChange", "init")
   * @param handler - Event handler function
   *
   * @example
   * ```typescript
   * controller.on('slideChange', (instance) => {
   *   console.log('Slide changed to:', instance.activeIndex);
   * });
   * ```
   */
  on(event: string, handler: EventHandler): void {
    if (!this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, new Set());
    }
    this._eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from a custom event
   *
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this._eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      // Clean up empty event sets
      if (handlers.size === 0) {
        this._eventHandlers.delete(event);
      }
    }
  }

  /**
   * Emit a custom event to all registered handlers
   *
   * @param event - Event name
   * @param data - Data to pass to event handlers (default: this instance)
   */
  emit(event: string, data?: any): void {
    const handlers = this._eventHandlers.get(event);
    if (handlers) {
      // Use controller instance as default data
      const eventData = data !== undefined ? data : this;
      handlers.forEach((handler) => {
        try {
          handler(eventData);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Destroy the controller and cleanup all resources
   * Removes event listeners, disconnects observers, and clears references
   */
  destroy(): void {
    // Remove event listeners
    this._removeEventListeners();

    // Disconnect Intersection Observer
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }

    // Clear intersection ratios cache
    this._intersectionRatios.clear();

    // Clear debounce timers
    if (this._scrollDebounceTimer) {
      clearTimeout(this._scrollDebounceTimer);
      this._scrollDebounceTimer = null;
    }

    if (this._ioDebounceTimer) {
      clearTimeout(this._ioDebounceTimer);
      this._ioDebounceTimer = null;
    }

    if (this._idleDetectionTimer) {
      clearTimeout(this._idleDetectionTimer);
      this._idleDetectionTimer = null;
    }

    // Clear event handlers
    this._eventHandlers.clear();

    // Remove live region from DOM
    if (this._liveRegion && this._liveRegion.parentNode) {
      this._liveRegion.parentNode.removeChild(this._liveRegion);
      this._liveRegion = null;
    }

    // Clear references
    this._container = null;
    this._slides = [];
    this._config = null;
    this._boundHandleScroll = null;
    this._boundHandleKeyboard = null;

    // Reset scroll tracking state
    this._lastScrollTop = 0;
    this._lastScrollTime = 0;
    this._scrollVelocity = 0;
    this._scrollDirection = "idle";

    // Reset high-velocity throttling state
    this._isHighVelocityScrolling = false;
    this._lastActiveIndexChangeTime = 0;
  }

  // ==================== Private Methods ====================

  /**
   * Check if user prefers reduced motion
   * @returns True if user has set prefers-reduced-motion: reduce
   * @private
   */
  private _getPrefersReducedMotion(): boolean {
    // Check if window.matchMedia is available (not available in SSR)
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Setup ARIA attributes on container element
   * Adds carousel role and description for assistive technologies
   * @private
   */
  private _setupAriaAttributes(): void {
    if (!this._container) return;

    // Set carousel role description (use custom if provided)
    const roleDescription =
      this._config?.containerRoleDescriptionMessage || "carousel";
    this._container.setAttribute("aria-roledescription", roleDescription);

    // Set ARIA label if provided
    if (this._config?.ariaLabel) {
      this._container.setAttribute("aria-label", this._config.ariaLabel);
    }

    // Add container usage instructions via aria-describedby if provided
    if (this._config?.containerMessage) {
      const descriptionId = `carousel-desc-${Math.random().toString(36).substr(2, 9)}`;
      const descriptionElement = document.createElement("div");
      descriptionElement.id = descriptionId;
      descriptionElement.textContent = this._config.containerMessage;

      // Add visually hidden class (sr-only pattern)
      descriptionElement.style.position = "absolute";
      descriptionElement.style.width = "1px";
      descriptionElement.style.height = "1px";
      descriptionElement.style.padding = "0";
      descriptionElement.style.margin = "-1px";
      descriptionElement.style.overflow = "hidden";
      descriptionElement.style.clip = "rect(0, 0, 0, 0)";
      descriptionElement.style.whiteSpace = "nowrap";
      descriptionElement.style.border = "0";

      this._container.appendChild(descriptionElement);
      this._container.setAttribute("aria-describedby", descriptionId);
    }
  }

  /**
   * Create and setup ARIA live region for screen reader announcements
   * The live region is visually hidden but announced to screen readers
   * @private
   */
  private _setupLiveRegion(): void {
    if (!this._container) return;

    // Skip if announcements are disabled
    if (this._config?.announceSlides === false) return;

    // Create live region element
    this._liveRegion = document.createElement("div");
    this._liveRegion.setAttribute("aria-live", "polite");
    this._liveRegion.setAttribute("aria-atomic", "true");

    // Add visually hidden class (sr-only pattern)
    this._liveRegion.style.position = "absolute";
    this._liveRegion.style.width = "1px";
    this._liveRegion.style.height = "1px";
    this._liveRegion.style.padding = "0";
    this._liveRegion.style.margin = "-1px";
    this._liveRegion.style.overflow = "hidden";
    this._liveRegion.style.clip = "rect(0, 0, 0, 0)";
    this._liveRegion.style.whiteSpace = "nowrap";
    this._liveRegion.style.border = "0";

    // Append to container
    this._container.appendChild(this._liveRegion);
  }

  /**
   * Announce slide change to screen readers via ARIA live region
   * Includes boundary messages for first/last slides
   * Uses slideLabelMessage template if provided for consistent terminology
   * @private
   */
  private _announceSlideChange(): void {
    if (!this._liveRegion || !this._slides.length) return;

    // Skip if announcements are disabled
    if (this._config?.announceSlides === false) return;

    const currentSlide = this._activeIndex + 1;
    const totalSlides = this._slides.length;

    // Use the slideLabelMessage template if provided, otherwise default to "Slide"
    let message = this._config?.slideLabelMessage
      ? this._config.slideLabelMessage
          .replace("{{index}}", currentSlide.toString())
          .replace("{{slidesLength}}", totalSlides.toString())
      : `Slide ${currentSlide} of ${totalSlides}`;

    // Add boundary messages if configured
    if (this._activeIndex === 0 && this._config?.firstSlideMessage) {
      message += `. ${this._config.firstSlideMessage}`;
    } else if (
      this._activeIndex === totalSlides - 1 &&
      this._config?.lastSlideMessage
    ) {
      message += `. ${this._config.lastSlideMessage}`;
    }

    // Update live region text content to trigger screen reader announcement
    this._liveRegion.textContent = message;
  }

  /**
   * Announce navigation action to screen readers
   * Called before navigation to inform users of the action
   * @param direction - Navigation direction ('prev' or 'next')
   * @private
   */
  private _announceNavigation(direction: "prev" | "next"): void {
    if (!this._liveRegion || !this._slides.length) return;

    // Skip if announcements are disabled
    if (this._config?.announceSlides === false) return;

    let message = "";
    if (direction === "prev" && this._config?.prevSlideMessage) {
      message = this._config.prevSlideMessage;
    } else if (direction === "next" && this._config?.nextSlideMessage) {
      message = this._config.nextSlideMessage;
    }

    if (message) {
      this._liveRegion.textContent = message;
    }
  }

  /**
   * Initialize Intersection Observer for slide visibility tracking
   * Observes all slides with multiple thresholds for accurate visibility ratios
   * @private
   */
  private _setupIntersectionObserver(): void {
    if (!this._container) return;

    // Disconnect existing observer if any
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }

    // Define thresholds for fine-grained visibility tracking
    // These thresholds allow us to detect visibility changes at 10%, 25%, 50%, 75%, 90%, and 100%
    const thresholds = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0];

    // Get the root element for observation (container in container mode, null for window mode)
    const root = this._isWindowMode ? null : this._container;

    // Create Intersection Observer
    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        // Update intersection ratios for all observed slides
        entries.forEach((entry) => {
          const slideElement = entry.target as HTMLElement;
          const slideIndex = this._slides.indexOf(slideElement);

          if (slideIndex !== -1) {
            // Store the intersection ratio for this slide
            this._intersectionRatios.set(slideIndex, entry.intersectionRatio);
          }
        });

        // Debounce the active index update to prevent excessive event firing
        // The IO callback can fire many times as slides cross multiple thresholds
        // We want to batch these updates and only fire the slideChange event once
        if (this._ioDebounceTimer) {
          clearTimeout(this._ioDebounceTimer);
        }

        this._ioDebounceTimer = setTimeout(() => {
          // Calculate new active index based on updated intersection ratios
          const newIndex = this._calculateMostVisibleIndex();

          // Validate the calculated index to ensure it has acceptable visibility
          // This acts as a safety net to catch any edge cases from calculation
          const validatedIndex = this._validateActiveIndexVisibility(newIndex);

          if (validatedIndex !== this._activeIndex) {
            // Always update activeIndex immediately for accurate state
            // Throttling is only applied to event firing, not calculation
            const currentTime = performance.now();
            const timeSinceLastChange =
              currentTime - this._lastActiveIndexChangeTime;

            if (process.env.NODE_ENV === "development") {
              console.log(
                "[IO] Active index changing from",
                this._activeIndex,
                "to",
                validatedIndex,
                this._isHighVelocityScrolling
                  ? "(high velocity mode)"
                  : "(normal velocity)"
              );
            }

            this._previousIndex = this._activeIndex;
            this._activeIndex = validatedIndex;

            // Throttle event firing during high-velocity scrolling to prevent spam
            // But always update the internal state for accuracy
            const shouldFireEvents =
              !this._isHighVelocityScrolling ||
              timeSinceLastChange >=
                this.MIN_HIGH_VELOCITY_INDEX_CHANGE_INTERVAL;

            if (shouldFireEvents) {
              this._lastActiveIndexChangeTime = currentTime;
              this._handleActiveIndexChange();
            } else if (process.env.NODE_ENV === "development") {
              console.log(
                "[IO] Throttling event firing during high-velocity scroll",
                "(time since last event:",
                timeSinceLastChange.toFixed(0),
                "ms)"
              );
            }
          }
        }, this.IO_DEBOUNCE_DELAY);
      },
      {
        root,
        // Use rootMargin to slightly expand the observation area
        // This helps with edge cases where slides are just entering/leaving viewport
        rootMargin: "0px",
        threshold: thresholds,
      }
    );

    // Observe all slides
    this._slides.forEach((slide) => {
      this._intersectionObserver!.observe(slide);
    });
  }

  /**
   * Get minimum visibility threshold based on current scroll context
   * Returns context-aware threshold considering direction and velocity
   * @private
   * @returns Minimum visibility ratio (0-1) required for a slide to be considered active
   */
  private _getMinimumVisibilityThreshold(): number {
    const isHighVelocity = this._scrollVelocity > this.HIGH_VELOCITY_THRESHOLD;

    // Use the same thresholds as _calculateMostVisibleIndex for consistency
    if (this._scrollDirection === "up") {
      // Backward scrolling: lower threshold for responsiveness
      return isHighVelocity ? 0.35 : this.BACKWARD_SCROLL_VISIBILITY_THRESHOLD;
    } else if (this._scrollDirection === "down") {
      // Forward scrolling: higher threshold for stability
      return isHighVelocity ? 0.45 : this.FORWARD_SCROLL_VISIBILITY_THRESHOLD;
    } else {
      // Idle or no direction: require 50% minimum
      return 0.5;
    }
  }

  /**
   * Validate that the proposed activeIndex has acceptable visibility
   * Acts as a safety net to catch any edge cases from calculation
   * @private
   * @param proposedIndex - The index calculated by _calculateMostVisibleIndex
   * @returns Validated index (either proposed index or corrected index)
   */
  private _validateActiveIndexVisibility(proposedIndex: number): number {
    // Get visibility data for proposed index
    const proposedVisibility = this._intersectionRatios.get(proposedIndex);

    // CASE 1: No visibility data available (IO hasn't fired yet)
    // This can happen during initialization or rapid updates
    if (proposedVisibility === undefined) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[Validation] No visibility data for index",
          proposedIndex,
          "- trusting calculation"
        );
      }
      return proposedIndex;
    }

    // CASE 2: Check if visibility is critically low (< 30%)
    // This threshold is lower than any intentional threshold (35%-50%)
    // Only catches truly broken calculations, won't interfere with hysteresis
    const CRITICAL_THRESHOLD = 0.3;

    if (proposedVisibility < CRITICAL_THRESHOLD) {
      // Something went wrong - find the most visible slide as correction
      let bestIndex = proposedIndex;
      let bestVisibility = proposedVisibility;

      this._intersectionRatios.forEach((ratio, index) => {
        if (ratio > bestVisibility) {
          bestVisibility = ratio;
          bestIndex = index;
        }
      });

      // Log the correction for debugging
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[Validation] Corrected activeIndex from ${proposedIndex}`,
          `(${(proposedVisibility * 100).toFixed(1)}% visible)`,
          `to ${bestIndex} (${(bestVisibility * 100).toFixed(1)}% visible)`
        );
      }

      return bestIndex;
    }

    // CASE 3: Visibility is acceptable (>= 30%)
    // Trust the calculation and directional bias logic
    return proposedIndex;
  }

  /**
   * Get the viewport rectangle for visibility calculations
   * Returns window viewport in window mode, container bounds in container mode
   * @private
   */
  private _getViewportRect(): DOMRect {
    if (this._isWindowMode) {
      // Window mode: Use browser viewport
      return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    } else {
      // Container mode: Use container bounds
      return this._container!.getBoundingClientRect();
    }
  }

  /**
   * Update slides array from container's children
   * Filters out null elements and converts NodeList to array
   * @private
   */
  private _updateSlides(): void {
    if (!this._container) return;

    // Get direct children of the wrapper div (flex container)
    const wrapper = this._container.querySelector(
      ".gencl\\:flex.gencl\\:flex-col"
    );
    if (!wrapper) {
      this._slides = [];
      return;
    }

    // Convert children to array and filter out non-element nodes
    this._slides = Array.from(wrapper.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement
    );

    // Add ARIA attributes to each slide for accessibility
    this._slides.forEach((slide, index) => {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");

      // Use the slideLabelMessage template if provided for consistent terminology
      const ariaLabel = this._config?.slideLabelMessage
        ? this._config.slideLabelMessage
            .replace("{{index}}", (index + 1).toString())
            .replace("{{slidesLength}}", this._slides.length.toString())
        : `Slide ${index + 1} of ${this._slides.length}`;

      slide.setAttribute("aria-label", ariaLabel);

      // Make slides focusable for keyboard navigation
      if (!slide.hasAttribute("tabindex")) {
        slide.setAttribute("tabindex", "-1");
      }
    });
  }

  /**
   * Calculate which slide is most visible in the viewport
   * Uses Intersection Observer ratios as primary data source with scroll position as enhancement
   * Works in both container mode and window mode
   *
   * **Centered Slides Mode:**
   * When centeredSlides is true, finds the slide whose center is closest to viewport center
   * Uses IO data to filter only visible slides, then calculates center distance
   *
   * **Normal Mode:**
   * When centeredSlides is false, finds the slide with the highest visibility ratio
   * Primary: Uses cached IO intersection ratios (most accurate, no reflow)
   * Fallback: Uses manual calculation if IO data is unavailable (initial load)
   *
   * **Scroll Velocity Enhancement:**
   * During high-velocity scrolling, predicts next slide based on scroll direction
   * This provides smoother transitions during fast scrolling
   *
   * @returns Index of the most visible slide
   * @private
   */
  private _calculateMostVisibleIndex(): number {
    if (!this._container || this._slides.length === 0) return 0;

    const viewportRect = this._getViewportRect();

    // Centered slides mode: Find slide whose center is closest to viewport center
    if (this._config?.centeredSlides) {
      const viewportCenter = viewportRect.top + viewportRect.height / 2;
      let minDistance = Infinity;
      let centerIndex = this._activeIndex;

      this._slides.forEach((slide, index) => {
        // Only consider slides that are at least partially visible (IO ratio > 0)
        const ioRatio = this._intersectionRatios.get(index);
        if (ioRatio !== undefined && ioRatio > 0) {
          const slideRect = slide.getBoundingClientRect();
          const slideCenter = slideRect.top + slideRect.height / 2;
          const distance = Math.abs(slideCenter - viewportCenter);

          if (distance < minDistance) {
            minDistance = distance;
            centerIndex = index;
          }
        }
      });

      return centerIndex;
    }

    // Normal mode: Find slide with highest visibility ratio
    let maxVisibility = 0;
    let mostVisibleIndex = this._activeIndex; // Default to current if no better match

    // Try to use cached Intersection Observer data first (most efficient)
    if (this._intersectionRatios.size > 0) {
      // Get minimum threshold based on current scroll context
      const minThreshold = this._getMinimumVisibilityThreshold();

      // Use IO intersection ratios (no DOM reflow, browser-optimized)
      // Only consider slides that meet minimum visibility threshold
      this._intersectionRatios.forEach((ratio, index) => {
        // Strengthen calculation: only accept slides meeting minimum threshold
        if (ratio >= minThreshold && ratio > maxVisibility) {
          maxVisibility = ratio;
          mostVisibleIndex = index;
        }
      });

      // If no slide meets the minimum threshold, keep current activeIndex
      // This prevents switching to an invisible or barely visible slide
      if (maxVisibility === 0) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[Calculation] No slide meets minimum threshold",
            `(${(minThreshold * 100).toFixed(0)}%), keeping current index:`,
            this._activeIndex
          );
        }
        mostVisibleIndex = this._activeIndex;
        maxVisibility = this._intersectionRatios.get(this._activeIndex) || 0;
      }

      // Enhancement: Apply unified directional bias and velocity prediction
      // This logic integrates both directional bias and velocity prediction without early returns
      const isHighVelocity =
        this._scrollVelocity > this.HIGH_VELOCITY_THRESHOLD;

      if (this._scrollDirection === "up" && this._activeIndex > 0) {
        // Backward scrolling: Check if previous slide has reasonable visibility
        const previousIndex = this._activeIndex - 1;
        const previousVisibility = this._intersectionRatios.get(previousIndex);
        const currentVisibility =
          this._intersectionRatios.get(this._activeIndex) || 0;

        // For high velocity: Use lower threshold (35%) for more responsive feel
        // For normal velocity: Use standard threshold (45%)
        const backwardThreshold = isHighVelocity
          ? 0.35
          : this.BACKWARD_SCROLL_VISIBILITY_THRESHOLD;

        // Apply hysteresis: previous slide must have visibility DELTA higher than current
        // This prevents oscillation at boundaries
        const hysteresisThreshold = Math.max(
          backwardThreshold,
          currentVisibility - this.HYSTERESIS_DELTA
        );

        // If previous slide has sufficient visibility (with hysteresis), prefer it
        if (
          previousVisibility !== undefined &&
          previousVisibility > hysteresisThreshold
        ) {
          mostVisibleIndex = previousIndex;
          maxVisibility = previousVisibility;
        }
      } else if (
        this._scrollDirection === "down" &&
        this._activeIndex < this._slides.length - 1
      ) {
        // Forward scrolling: Check if next slide dominates visibility
        const nextIndex = this._activeIndex + 1;
        const nextVisibility = this._intersectionRatios.get(nextIndex);
        const currentVisibility =
          this._intersectionRatios.get(this._activeIndex) || 0;

        // For high velocity: Use lower threshold (45%) for more responsive feel
        // For normal velocity: Use standard threshold (50%)
        const forwardThreshold = isHighVelocity
          ? 0.45
          : this.FORWARD_SCROLL_VISIBILITY_THRESHOLD;

        // Apply hysteresis: next slide must have visibility DELTA higher than current
        // This prevents oscillation at boundaries
        const hysteresisThreshold = Math.max(
          forwardThreshold,
          currentVisibility - this.HYSTERESIS_DELTA
        );

        // Only switch to next slide if it has sufficient visibility (with hysteresis)
        if (
          nextVisibility !== undefined &&
          nextVisibility > hysteresisThreshold &&
          nextVisibility > maxVisibility
        ) {
          mostVisibleIndex = nextIndex;
          maxVisibility = nextVisibility;
        }
      }
    } else {
      // Fallback: Manual calculation (used on initial load before IO fires)
      // This ensures the controller works even before the first IO callback
      this._slides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();

        // Calculate visible portion of the slide
        const visibleTop = Math.max(slideRect.top, viewportRect.top);
        const visibleBottom = Math.min(slideRect.bottom, viewportRect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        // Calculate visibility ratio (0-1)
        const slideHeight = slideRect.height;
        const visibilityRatio =
          slideHeight > 0 ? visibleHeight / slideHeight : 0;

        // Update most visible slide if this one has higher visibility
        if (visibilityRatio > maxVisibility) {
          maxVisibility = visibilityRatio;
          mostVisibleIndex = index;
        }
      });
    }

    return mostVisibleIndex;
  }

  /**
   * Update scroll boundary state (isBeginning, isEnd)
   * Works in both container mode and window mode
   * @private
   */
  private _updateScrollState(): void {
    if (!this._container) return;

    if (this._isWindowMode) {
      // Window mode: Check window scroll position
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if at the beginning (with small tolerance for floating point)
      this._isBeginning = scrollY === 0;

      // Check if at the end (with 1px tolerance for floating point errors)
      this._isEnd = scrollY + viewportHeight >= documentHeight - 1;
    } else {
      // Container mode: Check container scroll position
      const { scrollTop, clientHeight, scrollHeight } = this._container;

      // Check if at the beginning (with small tolerance for floating point)
      this._isBeginning = scrollTop === 0;

      // Check if at the end (with 1px tolerance for floating point errors)
      this._isEnd = scrollTop + clientHeight >= scrollHeight - 1;
    }
  }

  /**
   * Handle scroll events with velocity tracking and adaptive debouncing
   * Calculates scroll velocity and direction, then updates active index
   * Uses Intersection Observer data as primary source for accuracy
   * @private
   */
  private _handleScroll(): void {
    // Get current scroll position and timestamp
    const currentTime = performance.now();
    const currentScrollTop = this._isWindowMode
      ? window.scrollY || window.pageYOffset
      : this._container?.scrollTop || 0;

    // CRITICAL: Calculate scroll velocity and direction IMMEDIATELY (before debouncing)
    // This ensures the direction is available when IO callback fires
    if (this._lastScrollTime > 0) {
      const deltaTime = currentTime - this._lastScrollTime;
      const deltaScroll = currentScrollTop - this._lastScrollTop;

      // Calculate velocity in pixels per millisecond
      this._scrollVelocity =
        deltaTime > 0 ? Math.abs(deltaScroll) / deltaTime : 0;

      // Determine scroll direction IMMEDIATELY
      if (deltaScroll > 0) {
        this._scrollDirection = "down";
      } else if (deltaScroll < 0) {
        this._scrollDirection = "up";
      }
      // Keep previous direction if deltaScroll is 0
    }

    // Track if we're in high-velocity scrolling mode (before debouncing)
    const isHighVelocity = this._scrollVelocity > this.HIGH_VELOCITY_THRESHOLD;
    this._isHighVelocityScrolling = isHighVelocity;

    // Update tracking variables
    this._lastScrollTop = currentScrollTop;
    this._lastScrollTime = currentTime;

    // Clear existing debounce timer
    if (this._scrollDebounceTimer) {
      clearTimeout(this._scrollDebounceTimer);
    }

    // Use adaptive debouncing based on scroll velocity
    // High velocity: shorter debounce for responsive feel
    // Low velocity: longer debounce to prevent jitter
    const debounceDelay =
      this._scrollVelocity > this.HIGH_VELOCITY_THRESHOLD
        ? this.HIGH_VELOCITY_DEBOUNCE
        : this.LOW_VELOCITY_DEBOUNCE;

    // Set new debounce timer with adaptive delay
    this._scrollDebounceTimer = setTimeout(() => {
      // Update scroll boundary state
      this._updateScrollState();

      // Note: Active index is ONLY updated by Intersection Observer
      // This scroll handler ONLY tracks velocity/direction and boundary states
      // This eliminates race conditions between scroll handler and IO callback

      // Calculate and emit progress (Swiper-compatible)
      const currentProgress = this.progress;
      this.emit("progress", this);

      // Fire onProgress callback if configured
      if (this._config?.onProgress) {
        this._config.onProgress(this, currentProgress);
      }

      // Fire onScroll callback if configured
      if (this._config?.onScroll) {
        this._config.onScroll(this);
      }

      // IMPORTANT: Don't reset velocity and direction to maintain directional context
      // The IO callback needs this information to apply proper directional bias
      // Only reset velocity to 0 to indicate scroll has momentarily paused
      this._scrollVelocity = 0;
      this._isHighVelocityScrolling = false;
      // NOTE: We deliberately keep _scrollDirection to preserve context for IO callback

      // Setup idle detection timer to reset direction after prolonged inactivity
      if (this._idleDetectionTimer) {
        clearTimeout(this._idleDetectionTimer);
      }
      this._idleDetectionTimer = setTimeout(() => {
        // After 500ms of no scroll activity, reset direction to idle
        this._scrollDirection = "idle";
        this._idleDetectionTimer = null;
      }, this.IDLE_DETECTION_DELAY);
    }, debounceDelay);
  }

  /**
   * Handle active index changes
   * Fires callbacks and emits events
   *
   * Note: Following Swiper's pattern, we pass the controller instance (this)
   * to all callbacks, not wrapper objects. Consumers receive the controller
   * instance directly and can access all properties/methods.
   *
   * @private
   */
  private _handleActiveIndexChange(): void {
    if (!this._config) return;

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[ActiveIndexChange] Firing callbacks and events for index:",
        this._activeIndex
      );
    }

    // Announce slide change to screen readers
    this._announceSlideChange();

    // Fire onActiveIndexChange callback with the controller instance
    // Just like Swiper passes its instance, we pass the controller instance
    // so consumers can access instance.activeIndex, instance.previousIndex, etc.
    if (this._config.onActiveIndexChange) {
      this._config.onActiveIndexChange(this);
    }

    // Emit slideChange event with controller instance
    if (process.env.NODE_ENV === "development") {
      console.log("[ActiveIndexChange] Emitting slideChange event");
    }
    console.log("[gen] activeIndex change::", {
      activeIndex: this.activeIndex,
    });
    this.emit("slideChange", this);

    // Fire onSlideChange callback with controller instance
    // Consumers can directly use the instance without creating wrappers
    if (this._config.onSlideChange) {
      this._config.onSlideChange(this);
    }

    // Update previous index
    this._previousIndex = this._activeIndex;
  }

  /**
   * Handle keyboard navigation events
   * Supports Arrow keys, Home, End, PageUp, PageDown for full accessibility
   * Only responds when carousel or its descendants have focus
   * @private
   */
  private _handleKeyboard(e: KeyboardEvent): void {
    if (!this._config?.keyboardEnabled) return;

    // Only respond if the carousel container or a slide has focus
    if (!this._container) return;
    const target = e.target as HTMLElement;
    if (!this._container.contains(target)) return;

    const direction = this._config?.direction || "vertical";

    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
        // For vertical carousels, move to next slide
        if (direction === "vertical") {
          e.preventDefault();
          this.slideNext();
        }
        break;

      case "ArrowUp":
      case "PageUp":
        // For vertical carousels, move to previous slide
        if (direction === "vertical") {
          e.preventDefault();
          this.slidePrev();
        }
        break;

      case "ArrowRight":
        // For horizontal carousels (future support), move to next slide
        if (direction === "horizontal") {
          e.preventDefault();
          this.slideNext();
        }
        break;

      case "ArrowLeft":
        // For horizontal carousels (future support), move to previous slide
        if (direction === "horizontal") {
          e.preventDefault();
          this.slidePrev();
        }
        break;

      case "Home":
        // Jump to first slide
        e.preventDefault();
        this.slideTo(0);
        break;

      case "End":
        // Jump to last slide
        e.preventDefault();
        this.slideTo(this._slides.length - 1);
        break;
    }
  }

  /**
   * Setup DOM event listeners
   * Attaches to window or container depending on mode
   * @private
   */
  private _setupEventListeners(): void {
    if (!this._container) return;

    // Bind event handlers to preserve context
    this._boundHandleScroll = this._handleScroll.bind(this);
    this._boundHandleKeyboard = this._handleKeyboard.bind(this);

    // Attach scroll listener based on mode
    if (this._isWindowMode) {
      // Window mode: Listen to window scroll events
      window.addEventListener("scroll", this._boundHandleScroll, {
        passive: true,
      });
    } else {
      // Container mode: Listen to container scroll events
      this._container.addEventListener("scroll", this._boundHandleScroll, {
        passive: true,
      });
    }

    // Attach keyboard listener (window level for global navigation)
    if (this._config?.keyboardEnabled) {
      window.addEventListener("keydown", this._boundHandleKeyboard);
    }
  }

  /**
   * Remove DOM event listeners
   * Removes from window or container depending on mode
   * @private
   */
  private _removeEventListeners(): void {
    if (this._boundHandleScroll) {
      if (this._isWindowMode) {
        // Window mode: Remove from window
        window.removeEventListener("scroll", this._boundHandleScroll);
      } else if (this._container) {
        // Container mode: Remove from container
        this._container.removeEventListener("scroll", this._boundHandleScroll);
      }
    }

    if (this._boundHandleKeyboard) {
      window.removeEventListener("keydown", this._boundHandleKeyboard);
    }
  }
}
