import { useLinkContext } from "../context/link";
import {
  embedRouter,
  goBack,
  goForward,
  canGoBack as primitiveCanGoBack,
} from "../lib/utils/embed-router";

// Type definition for the router object that mimics Next.js router
interface WouterRouter {
  push: (href: string, options?: { scroll?: boolean }) => void;
  replace: (href: string, options?: { scroll?: boolean }) => void;
  refresh: () => void;
  prefetch: (
    href: string,
    options?: { onInvalidate?: () => void }
  ) => Promise<void>;
  back: () => void;
  forward: () => void;
  canGoBack: () => boolean;
}

export function useRouter() {
  const { useRouter } = useLinkContext();
  return useRouter
    ? { ...useRouter(), canGoBack: () => true }
    : useWouterRouter();
}

function useWouterRouter(): WouterRouter {
  return {
    /**
     * Navigate to a new route by adding a new entry to the browser's history stack
     * @param href - The destination route
     * @param options - Navigation options
     */
    push: (href: string, options?: { scroll?: boolean }) => {
      embedRouter.navigate(href);
      // Note: Scroll behavior would need to be implemented separately
      // as wouter's memory location doesn't handle scrolling
      if (options?.scroll !== false) {
        // Scroll to top by default (Next.js behavior)
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
      }
    },

    /**
     * Navigate to a new route by replacing the current entry in the browser's history stack
     * @param href - The destination route
     * @param options - Navigation options
     */
    replace: (href: string, options?: { scroll?: boolean }) => {
      embedRouter.replace(href);
      if (options?.scroll !== false) {
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
      }
    },

    /**
     * Refresh the current route
     * Note: In wouter's memory location, this doesn't trigger a server request
     * but forces a re-render by navigating to the same location
     */
    refresh: () => {
      const currentLocation = embedRouter.hook()[0];
      embedRouter.navigate(currentLocation);
    },

    /**
     * Prefetch a route for faster client-side transitions
     * @param href - The route to prefetch
     * @param options - Prefetch options
     */
    prefetch: (href: string, options?: { onInvalidate?: () => void }) => {
      // Note: wouter's memory location doesn't support prefetching
      // This is a no-op to maintain API compatibility
      return Promise.resolve();
    },

    /**
     * Navigate back to the previous route in the browser's history stack
     */
    back: () => {
      goBack();
    },

    canGoBack: () => {
      return primitiveCanGoBack();
    },

    /**
     * Navigate forward to the next page in the browser's history stack
     */
    forward: () => {
      goForward();
    },
  };
}
