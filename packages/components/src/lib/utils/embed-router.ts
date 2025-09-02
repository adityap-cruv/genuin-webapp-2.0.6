import { memoryLocation } from "wouter/memory-location";
import { buildPageUrl } from "./pages";

export const embedRouter = {
  ...memoryLocation({
    path: buildPageUrl({ type: "home" }),
    record: true,
  }),
  replace,
};

// History manager to track current position for back/forward navigation
class HistoryManager {
  private currentIndex = 0;

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }

  incrementIndex(): void {
    this.currentIndex++;
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < embedRouter.history.length - 1;
  }

  back(): boolean {
    if (this.canGoBack()) {
      this.currentIndex--;
      const targetPath = embedRouter.history[this.currentIndex];
      if (targetPath) {
        // Use the navigate method from embedRouter directly to avoid updating history
        embedRouter.navigate(targetPath);
        return true;
      }
    }
    return false;
  }

  forward(): boolean {
    if (this.canGoForward()) {
      this.currentIndex++;
      const targetPath = embedRouter.history[this.currentIndex];
      if (targetPath) {
        // Use the navigate method from embedRouter directly to avoid updating history
        embedRouter.navigate(targetPath);
        return true;
      }
    }
    return false;
  }

  // Update the current index when navigation happens
  updateIndexForNavigation(path: string): void {
    // Find the path in history or add it
    const historyIndex = embedRouter.history.indexOf(path);
    if (historyIndex !== -1) {
      // If path exists in history, update index to that position
      this.currentIndex = historyIndex;
    } else {
      // If it's a new path, it will be added to the end of history
      this.currentIndex = embedRouter.history.length - 1;
    }
  }

  // Replace the current history entry with a new path
  replace(path: string): void {
    // Replace the current history entry
    if (embedRouter.history.length > 0) {
      embedRouter.history[this.currentIndex] = path;
    }
    // Navigate to the new path without adding to history
    embedRouter.navigate(path);
  }
}

export const historyManager = new HistoryManager();

/**
 * Only pass path of the url to navigate internally. It will navigate to the given URL.
 * @param url
 * @returns
 */
export function navigate(url: string) {
  let route: string = "";
  try {
    route = new URL(url).pathname;
  } catch (e) {
    route = url;
  }

  // Store the current history length before navigation
  const prevHistoryLength = embedRouter.history.length;

  // This will navigate to the given URL.
  embedRouter.navigate(route);

  // Update the history manager's current index
  // If history length increased, we navigated to a new page
  if (embedRouter.history.length > prevHistoryLength) {
    historyManager.incrementIndex();
  } else {
    // If history length didn't change, update index to the current route
    historyManager.updateIndexForNavigation(route);
  }
}

/**
 * Navigate back in the embed router's history
 * @returns true if navigation was successful, false if can't go back
 */
export function goBack(): boolean {
  return historyManager.back();
}

/**
 * Navigate forward in the embed router's history
 * @returns true if navigation was successful, false if can't go forward
 */
export function goForward(): boolean {
  return historyManager.forward();
}

/**
 * Check if we can navigate back
 * @returns true if back navigation is possible
 */
export function canGoBack(): boolean {
  return historyManager.canGoBack();
}

/**
 * Check if we can navigate forward
 * @returns true if forward navigation is possible
 */
export function canGoForward(): boolean {
  return historyManager.canGoForward();
}

/**
 * Replace the current history entry with a new route without adding to history
 * @param url - The URL or path to replace the current entry with
 */
export function replace(url: string) {
  let route: string = "";
  try {
    route = new URL(url).pathname;
  } catch (e) {
    route = url;
  }

  // Replace the current history entry and navigate
  historyManager.replace(route);
}
