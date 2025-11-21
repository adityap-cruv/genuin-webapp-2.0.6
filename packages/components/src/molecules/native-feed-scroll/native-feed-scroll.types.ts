/**
 * Type definitions for NativeFeedScroll component
 * @module native-feed-scroll.types
 */

/**
 * Event handler function type for custom event emitter
 */
export type EventHandler = (data?: any) => void;

/**
 * Configuration options for NativeFeedScrollController
 *
 * **Two Operating Modes:**
 * 1. **Container Mode** (default): Provide containerHeight/containerWidth to create a scrollable container
 * 2. **Window Mode**: Omit containerHeight/containerWidth to track slides relative to browser viewport
 */
export interface NativeFeedScrollConfig {
  /**
   * Height of the container/viewport in pixels
   * - If provided: Creates scrollable container with this height
   * - If omitted: Uses window viewport for scroll tracking
   */
  containerHeight?: number;
  /**
   * Width of the container/viewport in pixels
   * - If provided: Sets container width
   * - If omitted: Uses window viewport width
   */
  containerWidth?: number;
  /** Number of slides visible at once */
  slidesPerView: number;
  /** Gap/spacing between slides in pixels */
  spaceBetween: number;
  /** Top padding offset before first slide in pixels */
  slidesOffsetBefore?: number;
  /** Whether slides should be centered in viewport */
  centeredSlides?: boolean;
  /** Scroll direction - currently only vertical supported */
  direction?: "vertical" | "horizontal";
  /** Enable keyboard navigation (Arrow Up/Down) */
  keyboardEnabled?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Respect user's prefers-reduced-motion setting - default: true */
  respectReducedMotion?: boolean;
  /** Announce slide changes to screen readers - default: true */
  announceSlides?: boolean;
  /** Message announced when navigating to previous slide */
  prevSlideMessage?: string;
  /** Message announced when navigating to next slide */
  nextSlideMessage?: string;
  /** Message announced when reaching the first slide */
  firstSlideMessage?: string;
  /** Message announced when reaching the last slide */
  lastSlideMessage?: string;
  /** Instructions for using the carousel (e.g., keyboard navigation) */
  containerMessage?: string;
  /** Custom role description for the carousel container */
  containerRoleDescriptionMessage?: string;
  /** Template for slide position message (e.g., "Clip {{index}} of {{slidesLength}}") */
  slideLabelMessage?: string;
  /** Callback fired when active index changes - receives controller instance */
  onActiveIndexChange?: (instance: NativeFeedScrollInstance) => void;
  /** Callback fired when slide changes with full instance */
  onSlideChange?: (instance: NativeFeedScrollInstance) => void;
  /** Callback fired on controller initialization */
  onInit?: (instance: NativeFeedScrollInstance) => void;
  /** Callback fired on scroll events */
  onScroll?: (instance: NativeFeedScrollInstance) => void;
  /** Callback fired on scroll progress change - receives instance and progress (0-1) */
  onProgress?: (instance: NativeFeedScrollInstance, progress: number) => void;
}

/**
 * Configuration parameters exposed through params property
 * Mirrors Swiper's params API for compatibility
 */
export interface NativeFeedScrollParams {
  /** Number of slides visible at once */
  slidesPerView: number;
  /** Whether slides should be centered in viewport */
  centeredSlides: boolean;
  /** Top padding offset before first slide in pixels */
  slidesOffsetBefore: number;
  /** Scroll direction */
  direction: "vertical" | "horizontal";
}

/**
 * Public API exposed by NativeFeedScrollController
 * Provides imperative control over the carousel
 */
export interface NativeFeedScrollInstance {
  /** Current active slide index (0-based) */
  readonly activeIndex: number;
  /** Previous active slide index (0-based) - useful for tracking direction */
  readonly previousIndex: number;
  /** Whether the carousel is at the beginning */
  readonly isBeginning: boolean;
  /** Whether the carousel is at the end */
  readonly isEnd: boolean;
  /** Array of slide DOM elements */
  readonly slides: HTMLElement[];
  /** Container DOM element reference */
  readonly container: HTMLElement | null;
  /** Container DOM element reference (Swiper-compatible alias for container) */
  readonly el: HTMLElement | null;
  /** Configuration parameters (Swiper-compatible) */
  readonly params: NativeFeedScrollParams;
  /**
   * Current scroll progress from 0 (beginning) to 1 (end)
   * Provides continuous progress tracking across the entire scrollable content
   * (Swiper-compatible)
   */
  readonly progress: number;

  /**
   * Scroll to a specific slide by index (Swiper-compatible signature)
   * @param index - Target slide index (0-based)
   * @param speed - Animation duration in milliseconds (default: 300)
   * @param runCallbacks - Whether to fire event callbacks (default: true)
   */
  slideTo(index: number, speed?: number, runCallbacks?: boolean): void;

  /**
   * Scroll to a specific slide by index (deprecated, use slideTo)
   * @param index - Target slide index (0-based)
   * @param smooth - Whether to use smooth scrolling animation (default: true)
   * @deprecated Use slideTo instead for Swiper compatibility
   */
  scrollToSlide(index: number, smooth?: boolean): void;

  /**
   * Navigate to the next slide
   */
  slideNext(): void;

  /**
   * Navigate to the previous slide
   */
  slidePrev(): void;

  /**
   * Subscribe to a custom event
   * @param event - Event name (e.g., "slideChange")
   * @param handler - Event handler function
   */
  on(event: string, handler: EventHandler): void;

  /**
   * Unsubscribe from a custom event
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: string, handler: EventHandler): void;

  /**
   * Emit a custom event to all subscribers
   * @param event - Event name
   * @param data - Data to pass to event handlers
   */
  emit(event: string, data?: any): void;

  /**
   * Update controller after configuration or DOM changes
   */
  update(): void;

  /**
   * Destroy controller and cleanup resources
   */
  destroy(): void;
}

/**
 * Props for NativeFeedScroll React component
 *
 * **Two Operating Modes:**
 * 1. **Container Mode**: Provide containerHeight/containerWidth for scrollable container
 * 2. **Window Mode**: Omit containerHeight/containerWidth for window-level scrolling
 */
export interface NativeFeedScrollProps {
  /** Child elements to render as slides */
  children: React.ReactNode;
  /**
   * Height of the container/viewport in pixels
   * - If provided: Creates scrollable container
   * - If omitted: Uses window viewport
   */
  containerHeight?: number;
  /**
   * Width of the container/viewport in pixels
   * - If provided: Sets container width
   * - If omitted: Uses window viewport width
   */
  containerWidth?: number;
  /** Number of slides visible at once */
  slidesPerView: number;
  /** Gap/spacing between slides in pixels */
  spaceBetween: number;
  /** Top padding offset before first slide in pixels */
  slidesOffsetBefore?: number;
  /** Additional CSS classes for the container */
  className?: string;
  /** Enable keyboard navigation (Arrow Up/Down) - default: true */
  keyboardEnabled?: boolean;
  /** ARIA label for accessibility - default: "Video feed" */
  ariaLabel?: string;
  /** Respect user's prefers-reduced-motion setting - default: true */
  respectReducedMotion?: boolean;
  /** Announce slide changes to screen readers - default: true */
  announceSlides?: boolean;
  /** Message announced when navigating to previous slide */
  prevSlideMessage?: string;
  /** Message announced when navigating to next slide */
  nextSlideMessage?: string;
  /** Message announced when reaching the first slide */
  firstSlideMessage?: string;
  /** Message announced when reaching the last slide */
  lastSlideMessage?: string;
  /**
   * Defines a custom height for a specific slide.
   * - `index`: The slide index that should use the custom height.
   * - `height`: The height value (in px) to apply to that slide.
   */
  customHeightFor?: {
    index: number;
    height: number;
  };
  /** Instructions for using the carousel (e.g., keyboard navigation) */
  containerMessage?: string;
  /** Custom role description for the carousel container */
  containerRoleDescriptionMessage?: string;
  /** Template for slide position message (e.g., "Clip {{index}} of {{slidesLength}}") */
  slideLabelMessage?: string;
  /** Callback fired when active index changes - receives controller instance */
  onActiveIndexChange?: (instance: NativeFeedScrollInstance) => void;
  /** Callback fired when slide changes - receives controller instance */
  onSlideChange?: (instance: NativeFeedScrollInstance) => void;
  /** Callback fired on initialization - receives controller instance */
  onInit?: (instance: NativeFeedScrollInstance) => void;
  /** Callback fired on scroll progress change - receives instance and progress (0-1) */
  onProgress?: (instance: NativeFeedScrollInstance, progress: number) => void;
}
