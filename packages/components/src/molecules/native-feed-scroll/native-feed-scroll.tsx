import { cn } from "@genuin/ui/lib/utils";
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from "react";

import { NativeFeedScrollController } from "./native-feed-scroll-controller";
import type { NativeFeedScrollProps, NativeFeedScrollInstance } from "./native-feed-scroll.types";

// Re-export types for convenience
export type { NativeFeedScrollProps, NativeFeedScrollInstance } from "./native-feed-scroll.types";

/**
 * NativeFeedScroll component
 * Thin React wrapper that manages the NativeFeedScrollController lifecycle
 */
const NativeFeedScroll = forwardRef<NativeFeedScrollInstance, NativeFeedScrollProps>(
  (
    {
      children,
      containerHeight,
      containerWidth,
      slidesPerView,
      spaceBetween,
      slidesOffsetBefore = 0,
      className,
      onActiveIndexChange,
      onSlideChange,
      onInit,
      onProgress,
      customHeightFor,
      keyboardEnabled = true,
      ariaLabel = "Video feed",
      respectReducedMotion = true,
      announceSlides = true,
      prevSlideMessage = "Previous Highlight",
      nextSlideMessage = "Next Highlight",
      firstSlideMessage = "This is the first Highlight",
      lastSlideMessage = "This is the last Highlight",
      containerMessage = "Highlight feed carousel. Use arrow keys to navigate between Highlights.",
      containerRoleDescriptionMessage = "Highlight feed carousel",
      slideLabelMessage = "Highlight {{index}} of {{slidesLength}}",
    },
    ref
  ) => {
    // ==================== Refs ====================

    /** DOM reference to the container element */
    const containerRef = useRef<HTMLDivElement>(null);

    /** Controller instance reference */
    const controllerRef = useRef<NativeFeedScrollController | null>(null);

    // ==================== Computed Values ====================

    /**
     * Detect if running in window mode (no containerHeight provided)
     */
    const isWindowMode = useMemo(() => !containerHeight, [containerHeight]);

    /**
     * Calculate slide height based on viewport and slides per view
     * Formula: (viewportHeight / slidesPerView) - spaceBetween
     * In window mode, uses window.innerHeight as viewport
     */
    const slideHeight = useMemo(() => {
      const viewportHeight = containerHeight ?? window.innerHeight;
      return viewportHeight / slidesPerView - spaceBetween;
    }, [containerHeight, slidesPerView, spaceBetween]);

    // ==================== Controller Lifecycle ====================

    /**
     * Initialize controller on mount
     * Cleanup controller on unmount
     */
    useEffect(() => {
      // Create controller instance
      const controller = new NativeFeedScrollController();
      controllerRef.current = controller;

      // Initialize controller with container and configuration
      if (containerRef.current) {
        controller.init(containerRef.current, {
          containerHeight,
          containerWidth,
          slidesPerView,
          spaceBetween,
          slidesOffsetBefore,
          keyboardEnabled,
          ariaLabel,
          respectReducedMotion,
          announceSlides,
          prevSlideMessage,
          nextSlideMessage,
          firstSlideMessage,
          lastSlideMessage,
          containerMessage,
          containerRoleDescriptionMessage,
          slideLabelMessage,
          onActiveIndexChange,
          onSlideChange,
          onInit,
          onProgress,
        });
      }

      // Cleanup on unmount
      return () => {
        controller.destroy();
        controllerRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount/unmount

    /**
     * Update controller when callback props change
     * Uses updateConfig to avoid full re-initialization
     */
    useEffect(() => {
      if (controllerRef.current) {
        // Update only the callback configuration without destroying the controller
        controllerRef.current.updateConfig({
          onActiveIndexChange,
          onSlideChange,
          onInit,
          onProgress,
        });
      }
    }, [onActiveIndexChange, onSlideChange, onInit, onProgress]);

    /**
     * Update controller when structural configuration changes
     * These require full re-initialization
     */
    useEffect(() => {
      if (controllerRef.current && containerRef.current) {
        // Reinitialize with new configuration for structural changes
        controllerRef.current.destroy();
        controllerRef.current.init(containerRef.current, {
          containerHeight,
          containerWidth,
          slidesPerView,
          spaceBetween,
          slidesOffsetBefore,
          keyboardEnabled,
          ariaLabel,
          respectReducedMotion,
          announceSlides,
          prevSlideMessage,
          nextSlideMessage,
          firstSlideMessage,
          lastSlideMessage,
          containerMessage,
          containerRoleDescriptionMessage,
          slideLabelMessage,
          onActiveIndexChange,
          onSlideChange,
          onInit,
          onProgress,
        });
      }
    }, [
      containerHeight,
      containerWidth,
      slidesPerView,
      spaceBetween,
      slidesOffsetBefore,
      keyboardEnabled,
      ariaLabel,
      respectReducedMotion,
      announceSlides,
      prevSlideMessage,
      nextSlideMessage,
      firstSlideMessage,
      lastSlideMessage,
      containerMessage,
      containerRoleDescriptionMessage,
      slideLabelMessage,
      // Note: callbacks are NOT included here to avoid re-init
      // They are handled by the separate updateConfig effect above
    ]);

    /**
     * Update controller when children change
     */
    useEffect(() => {
      if (controllerRef.current) {
        controllerRef.current.update();
      }
    }, [children]);

    // ==================== Imperative Handle ====================

    /**
     * Expose controller instance via ref
     * Allows parent components to control the carousel imperatively
     */
    useImperativeHandle(ref, () => {
      if (!controllerRef.current) {
        throw new Error("NativeFeedScroll: Controller not initialized");
      }
      return controllerRef.current;
    }, []);

    // ==================== Render ====================

    // Don't render if there are no children
    if (!children || React.Children.count(children) === 0) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          "gencl:h-full gencl:w-full gencl:z-0 gencl:relative",
          // Only add overflow-y-auto in container mode
          !isWindowMode && "gencl:overflow-y-auto",
          className
        )}
        style={{
          // In window mode, don't constrain height/width
          height: isWindowMode ? undefined : containerHeight,
          width: isWindowMode ? undefined : containerWidth,
          // scrollBehavior only needed in container mode (window uses smooth by default)
          scrollBehavior: isWindowMode ? undefined : "smooth",
          paddingTop: slidesOffsetBefore,
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}>
        {/* Flex container for vertical slide layout */}
        <div
          className="gencl:flex gencl:flex-col"
          style={{
            gap: spaceBetween,
          }}>
          {/* Render each child as a slide with calculated height */}
          {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return child;

            // Skip rendering if child is a React Fragment
            if (child.type === React.Fragment) return null;

            return (
              <div
                key={child.key || index}
                style={{
                  height: index === customHeightFor?.index ? customHeightFor.height : slideHeight,
                  minHeight: index === customHeightFor?.index ? customHeightFor.height : slideHeight,
                  flexShrink: 0, // Prevent slides from shrinking
                }}
                // Note: role, aria-roledescription, aria-label, and tabindex
                // are set by the controller in _updateSlides() to use
                // the slideLabelMessage template for consistent terminology
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

NativeFeedScroll.displayName = "NativeFeedScroll";

export default NativeFeedScroll;
