import { detectAccessibilityMode, getTabindexElementsInViewport } from "@genuin/ui/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Swiper } from "swiper/types";

import { userSlideNext, userSlidePrev } from "@genuin/components/organisms/player-swiper/swipe-intent";

// Type definition for focusable elements
export interface FocusableElement {
  index: number;
  element: HTMLElement;
  tagName: string;
  id: string | null;
  className: string | null;
  text: string | null;
  tabIndex: string;
  position: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
}

export interface UseFocusManagementOptions {
  /** Whether focus management is enabled (e.g., when expand view is open) */
  isEnabled: boolean;
  /** Current active slide index for refreshing elements on slide changes */
  activeIndex: number;
  /** The active swiper instance for slide navigation */
  activeSwiper?: Swiper | null;
}

export interface UseFocusManagementReturn {
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Current list of focusable elements */
  focusableElements: FocusableElement[];
  /** Current focus index */
  currentFocusIndex: number;
  /** Function to manually update focusable elements */
  updateFocusableElements: () => FocusableElement[];
  /** Function to set slide navigation direction */
  setSlideNavigationDirection: (direction: "next" | "prev" | null) => void;
}

export function useFocusManagement({
  isEnabled,
  activeIndex,
  activeSwiper,
}: UseFocusManagementOptions): UseFocusManagementReturn {
  // Only activate when accessibility mode is detected (screen reader, high contrast, etc.)
  const isAccessibilityMode = useMemo(() => detectAccessibilityMode(), []);
  const isActive = isEnabled && isAccessibilityMode;

  // Create a ref for the container
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus management state
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  // Track slide navigation for focus management
  const slideNavigationDirection = useRef<"next" | "prev" | null>(null);

  // Function to update focusable elements list
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) {
      setFocusableElements([]);
      return [];
    }

    const elements = getTabindexElementsInViewport(containerRef.current);

    // Filter out disabled elements
    const enabledElements = elements.filter((element) => {
      const htmlElement = element.element;
      // Check if element is disabled (for buttons, inputs, etc.)
      return !htmlElement.hasAttribute("disabled") && !(htmlElement as any).disabled;
    });

    setFocusableElements(enabledElements);
    return enabledElements;
  }, []);

  const setSlideNavigationDirection = useCallback((direction: "next" | "prev" | null) => {
    slideNavigationDirection.current = direction;
  }, []);

  // Focus management when enabled/disabled
  useEffect(() => {
    if (isActive) {
      // Save the currently focused element before enabling focus management
      previousFocusedElementRef.current = document.activeElement as HTMLElement;

      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        const elements = updateFocusableElements();
        if (elements.length > 0 && elements[0]) {
          // Focus the first focusable element
          elements[0].element.focus();
          setCurrentFocusIndex(0);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      // Restore focus to previous element when disabled
      if (previousFocusedElementRef.current && document.contains(previousFocusedElementRef.current)) {
        previousFocusedElementRef.current.focus();
      }
      // Reset focus state
      setCurrentFocusIndex(0);
      setFocusableElements([]);
    }
  }, [isActive, updateFocusableElements]);

  // Update focusable elements when activeIndex changes
  useEffect(() => {
    if (!isActive) return;

    const timeoutId = setTimeout(() => {
      const elements = updateFocusableElements();

      // Handle focus after slide navigation
      const direction = slideNavigationDirection.current;
      if (direction && elements.length > 0) {
        if (direction === "next" && elements[0]) {
          elements[0].element.focus();
          setCurrentFocusIndex(0);
        } else if (direction === "prev") {
          const lastIndex = elements.length - 1;
          const lastElement = elements[lastIndex];
          if (lastElement) {
            lastElement.element.focus();
            setCurrentFocusIndex(lastIndex);
          }
        }
        slideNavigationDirection.current = null;
      } else if (elements.length > 0) {
        // Maintain current focus or reset to first element
        const targetIndex = Math.min(currentFocusIndex, elements.length - 1);
        const currentElement = elements[targetIndex];
        if (currentElement) {
          currentElement.element.focus();
          setCurrentFocusIndex(targetIndex);
        }
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [activeIndex, isActive, updateFocusableElements, currentFocusIndex]);

  // Track focus changes to maintain current focus index and refresh elements when needed
  useEffect(() => {
    if (!isActive) return;

    const handleFocusIn = (event: FocusEvent) => {
      const focusedElement = event.target as HTMLElement;
      const elementIndex = focusableElements.findIndex((el) => el.element === focusedElement);

      if (elementIndex !== -1) {
        setCurrentFocusIndex(elementIndex);
      } else {
        // Refresh if focused element is not in current list
        setTimeout(() => {
          updateFocusableElements();
        }, 50);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [isActive, focusableElements, updateFocusableElements]);

  // Listen for swiper slide change events (handled by activeIndex effect above)
  useEffect(() => {
    if (!activeSwiper || !isActive) return;

    const handleSlideChange = () => {
      setTimeout(() => {
        updateFocusableElements();
      }, 100);
    };

    activeSwiper.on("slideChange", handleSlideChange);
    return () => activeSwiper.off("slideChange", handleSlideChange);
  }, [activeSwiper, isActive, updateFocusableElements]);

  // Keyboard navigation handler with slide navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive || focusableElements.length === 0) return;

      if (event.key === "Tab") {
        event.preventDefault();

        // Get current focused element index
        const activeElement = document.activeElement as HTMLElement;
        const currentElementIndex = focusableElements.findIndex((el) => el.element === activeElement);

        const actualCurrentIndex = currentElementIndex !== -1 ? currentElementIndex : currentFocusIndex;

        if (event.shiftKey) {
          // Shift+Tab: Go to previous element or previous slide
          if (actualCurrentIndex > 0) {
            const nextElement = focusableElements[actualCurrentIndex - 1];
            if (nextElement) {
              nextElement.element.focus();
              setCurrentFocusIndex(actualCurrentIndex - 1);
            }
          } else if (activeSwiper && !activeSwiper.isBeginning) {
            // Go to previous slide
            slideNavigationDirection.current = "prev";
            userSlidePrev(activeSwiper, "keyboard");
          } else {
            // Wrap to last element
            const lastIndex = focusableElements.length - 1;
            const lastElement = focusableElements[lastIndex];
            if (lastElement) {
              lastElement.element.focus();
              setCurrentFocusIndex(lastIndex);
            }
          }
        } else {
          // Tab: Go to next element or next slide
          if (actualCurrentIndex < focusableElements.length - 1) {
            const nextElement = focusableElements[actualCurrentIndex + 1];
            if (nextElement) {
              nextElement.element.focus();
              setCurrentFocusIndex(actualCurrentIndex + 1);
            }
          } else if (activeSwiper && !activeSwiper.isEnd) {
            // Go to next slide
            slideNavigationDirection.current = "next";
            userSlideNext(activeSwiper, "keyboard");
          } else {
            // Wrap to first element
            const firstElement = focusableElements[0];
            if (firstElement) {
              firstElement.element.focus();
              setCurrentFocusIndex(0);
            }
          }
        }
      }
    };

    if (isActive) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isActive, focusableElements, currentFocusIndex, activeSwiper]);

  return {
    containerRef,
    focusableElements,
    currentFocusIndex,
    updateFocusableElements,
    setSlideNavigationDirection,
  };
}
