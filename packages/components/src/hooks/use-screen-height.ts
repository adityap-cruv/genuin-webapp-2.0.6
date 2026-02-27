// hooks/use-viewport-height.ts
import { useState, useEffect } from "react";

/**
 * Custom hook to get the actual visible viewport height on mobile devices.
 *
 * **Why this is needed:**
 * On mobile browsers, using CSS `100vh` includes the browser's UI (address bar, navigation bar)
 * in the calculation, which causes content to be partially hidden behind these elements.
 *
 * For example:
 * - `100vh` might be 716px (including hidden browser UI)
 * - Actual visible area is only 635px (the space user can see)
 * - This creates an 81px gap where content is cut off
 *
 * This hook uses `window.visualViewport.height` which gives the ACTUAL visible viewport height,
 * accounting for all dynamic browser UI elements.
 *
 * **When to use this hook:**
 * - Building full-screen layouts (modals, video players, image viewers)
 * - Creating mobile-first components that need to fit the visible screen
 * - In SDK/embedded contexts where you can't modify global CSS
 * - When you need precise control over component height on mobile devices
 * - When `100vh` or `100dvh` CSS units don't work for your use case
 *
 * **When NOT to use this hook:**
 * - For simple layouts that don't need full-screen height
 * - If you can use modern CSS `100dvh` (Dynamic Viewport Height) instead
 * - For desktop-only applications
 * - When you're okay with content being slightly taller than viewport
 *
 * **How to use this hook:**
 *
 * @example
 * // Basic usage - full height container
 * function MyComponent() {
 *   const viewportHeight = useViewportHeight();
 *
 *   return (
 *     <div style={{ height: `${viewportHeight}px` }}>
 *       Content fits perfectly in visible area
 *     </div>
 *   );
 * }
 *
 * @example
 * // Multiple elements with different heights
 * function VideoPlayer() {
 *   const vh = useViewportHeight();
 *
 *   return (
 *     <>
 *       <div style={{ height: `${vh}px` }}>Full screen video</div>
 *       <div style={{ height: `${vh * 0.5}px` }}>Half height controls</div>
 *       <div style={{ minHeight: `${vh}px` }}>Scrollable content</div>
 *     </>
 *   );
 * }
 *
 * @example
 * // Combining with other styles
 * function Modal() {
 *   const viewportHeight = useViewportHeight();
 *
 *   return (
 *     <div
 *       className="fixed inset-0 bg-black"
 *       style={{ height: `${viewportHeight}px` }}
 *     >
 *       Modal content
 *     </div>
 *   );
 * }
 *
 * @returns {number} The current visible viewport height in pixels (e.g., 635)
 *
 * @remarks
 * - The hook automatically updates when the browser UI shows/hides (e.g., when scrolling)
 * - Uses `window.visualViewport.height` for accuracy, falls back to `window.innerHeight`
 * - Each component using this hook will re-render when viewport height changes
 * - The height value is reactive and updates on window resize and orientation change
 */
function useViewportHeight() {
  // Initialize with current viewport height
  // Use lazy initialization to avoid SSR issues
  const [height, setHeight] = useState(
    window?.visualViewport?.height || window?.innerHeight,
  );

  useEffect(() => {
    /**
     * Updates the height state with current viewport height
     * Uses visualViewport API for most accurate measurement
     */
    function updateHeight() {
      const vh = window.visualViewport?.height || window.innerHeight;
      setHeight(vh);
    }

    // Listen for viewport changes (address bar show/hide, keyboard open/close)
    window.visualViewport?.addEventListener("resize", updateHeight);

    // Fallback for browsers without visualViewport support
    window.addEventListener("resize", updateHeight);

    // Cleanup event listeners on unmount
    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return height;
}

export default useViewportHeight;
