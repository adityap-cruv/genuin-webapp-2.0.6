import { useCallback, useEffect, useRef, useState } from "react";
import { getTabindexElementsInViewport } from "@genuin/ui/lib/utils";
import type { Swiper } from "swiper/types";

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
  /** Callback to toggle the expand view (called on Escape) */
  onToggleExpandView?: () => void;
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
  onToggleExpandView,
}: UseFocusManagementOptions): UseFocusManagementReturn {
  // Create a ref for the container
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus management state
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  // Track slide navigation for focus management
  const [slideNavigationDirection, setSlideNavigationDirection] = useState<
    "next" | "prev" | null
  >(null);

  // Function to update focusable elements list
  const updateFocusableElements = useCallback(() => {
    if (containerRef.current) {
      // Clear previous elements first
      setFocusableElements([]);

      // Get fresh elements from the current viewport
      const elements = getTabindexElementsInViewport(containerRef.current);

      // Update state with new elements
      setFocusableElements(elements);
      return elements;
    }
    // Clear elements if no container
    setFocusableElements([]);
    return [];
  }, []);

  // Focus management when enabled/disabled
  useEffect(() => {
    if (isEnabled) {
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
      if (
        previousFocusedElementRef.current &&
        document.contains(previousFocusedElementRef.current)
      ) {
        previousFocusedElementRef.current.focus();
      }
      // Reset focus state
      setCurrentFocusIndex(0);
      setFocusableElements([]);
    }
  }, [isEnabled, updateFocusableElements]);

  // Update focusable elements when activeIndex changes
  useEffect(() => {
    if (isEnabled) {
      const timeoutId = setTimeout(() => {
        // Always refresh focusable elements when slide changes
        const elements = updateFocusableElements();

        // Handle focus after slide navigation
        if (slideNavigationDirection && elements.length > 0) {
          if (slideNavigationDirection === "next" && elements[0]) {
            // Focus first element of new slide
            elements[0].element.focus();
            setCurrentFocusIndex(0);
          } else if (slideNavigationDirection === "prev") {
            // Focus last element of new slide
            const lastIndex = elements.length - 1;
            const lastElement = elements[lastIndex];
            if (lastElement) {
              lastElement.element.focus();
              setCurrentFocusIndex(lastIndex);
            }
          }
          // Reset navigation direction
          setSlideNavigationDirection(null);
        } else if (elements.length > 0) {
          // If no slide navigation direction but we have elements, maintain current focus or reset to first
          const targetIndex = Math.min(currentFocusIndex, elements.length - 1);
          const currentElement = elements[targetIndex];
          if (currentElement) {
            currentElement.element.focus();
            setCurrentFocusIndex(targetIndex);
          }
        }
      }, 150); // Slightly longer timeout to ensure DOM is fully updated

      return () => clearTimeout(timeoutId);
    }
  }, [
    activeIndex,
    isEnabled,
    updateFocusableElements,
    slideNavigationDirection,
    currentFocusIndex,
  ]);

  // Track focus changes to maintain current focus index
  useEffect(() => {
    if (!isEnabled) return;

    const handleFocusIn = (event: FocusEvent) => {
      const focusedElement = event.target as HTMLElement;
      const elementIndex = focusableElements.findIndex(
        (el) => el.element === focusedElement
      );

      if (elementIndex !== -1) {
        setCurrentFocusIndex(elementIndex);
      } else {
        // If focused element is not in our list, refresh the focusable elements
        setTimeout(() => {
          updateFocusableElements();
        }, 50);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [isEnabled, focusableElements, updateFocusableElements]);

  // Listen for swiper slide change events to refresh focusable elements
  useEffect(() => {
    if (activeSwiper && isEnabled) {
      const handleSlideChange = () => {
        // Small delay to ensure the slide transition is complete
        setTimeout(() => {
          updateFocusableElements();
        }, 100);
      };

      // Add event listener for slide change
      activeSwiper.on("slideChange", handleSlideChange);

      return () => {
        // Clean up event listener
        activeSwiper.off("slideChange", handleSlideChange);
      };
    }
  }, [activeSwiper, isEnabled, updateFocusableElements]);

  // Additional effect to ensure focusable elements are updated whenever activeIndex changes
  // This serves as a backup to the main activeIndex effect above
  useEffect(() => {
    if (isEnabled) {
      // Use a longer delay to avoid conflicts with the main effect
      const timeoutId = setTimeout(() => {
        updateFocusableElements();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [activeIndex, isEnabled, updateFocusableElements]);

  // Keyboard navigation handler with slide navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEnabled || focusableElements.length === 0) return;

      if (event.key === "Tab") {
        // Check if the currently focused element is still in our focusable elements list
        const activeElement = document.activeElement as HTMLElement;
        const currentElementIndex = focusableElements.findIndex(
          (el) => el.element === activeElement
        );

        // Update current index if we found the active element
        if (currentElementIndex !== -1) {
          setCurrentFocusIndex(currentElementIndex);
        }

        event.preventDefault();

        const actualCurrentIndex =
          currentElementIndex !== -1 ? currentElementIndex : currentFocusIndex;

        if (event.shiftKey) {
          // Shift+Tab: Go to previous element or previous slide
          if (actualCurrentIndex > 0) {
            // Move to previous element in current slide
            const nextIndex = actualCurrentIndex - 1;
            const nextElement = focusableElements[nextIndex];
            if (nextElement) {
              nextElement.element.focus();
              setCurrentFocusIndex(nextIndex);
            }
          } else {
            // At first element, try to go to previous slide
            if (activeSwiper && !activeSwiper.isBeginning) {
              setSlideNavigationDirection("prev");
              activeSwiper.slidePrev();

              // Force refresh focusable elements after a short delay to ensure new slide is loaded
              setTimeout(() => {
                updateFocusableElements();
              }, 200);
            } else {
              // If at beginning of slides, wrap to last element of current slide
              const lastIndex = focusableElements.length - 1;
              const lastElement = focusableElements[lastIndex];
              if (lastElement) {
                lastElement.element.focus();
                setCurrentFocusIndex(lastIndex);
              }
            }
          }
        } else {
          // Tab: Go to next element or next slide
          if (actualCurrentIndex < focusableElements.length - 1) {
            // Move to next element in current slide
            const nextIndex = actualCurrentIndex + 1;
            const nextElement = focusableElements[nextIndex];
            if (nextElement) {
              nextElement.element.focus();
              setCurrentFocusIndex(nextIndex);
            }
          } else {
            // At last element, try to go to next slide
            if (activeSwiper && !activeSwiper.isEnd) {
              setSlideNavigationDirection("next");
              activeSwiper.slideNext();

              // Force refresh focusable elements after a short delay to ensure new slide is loaded
              setTimeout(() => {
                updateFocusableElements();
              }, 200);
            } else {
              // If at end of slides, wrap to first element of current slide
              const firstElement = focusableElements[0];
              if (firstElement) {
                firstElement.element.focus();
                setCurrentFocusIndex(0);
              }
            }
          }
        }
      }

      // Close expand view on Escape key
      if (event.key === "Escape" && onToggleExpandView) {
        onToggleExpandView();
      }
    };

    if (isEnabled) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [
    isEnabled,
    focusableElements,
    currentFocusIndex,
    activeSwiper,
    onToggleExpandView,
    updateFocusableElements,
  ]);



  return {
    containerRef,
    focusableElements,
    currentFocusIndex,
    updateFocusableElements,
    setSlideNavigationDirection,
  };
}