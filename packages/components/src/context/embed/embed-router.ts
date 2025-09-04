import { memoryLocation } from "wouter/memory-location";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

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
    return this.currentIndex < this.router.history.length - 1;
  }

  back(): boolean {
    if (this.canGoBack()) {
      this.currentIndex--;
      const targetPath = this.router.history[this.currentIndex];
      if (targetPath) {
        // Use the navigate method from embedRouter directly to avoid updating history
        this.router.navigate(targetPath);
        return true;
      }
    }
    return false;
  }

  forward(): boolean {
    if (this.canGoForward()) {
      this.currentIndex++;
      const targetPath = this.router.history[this.currentIndex];
      if (targetPath) {
        // Use the navigate method from embedRouter directly to avoid updating history
        this.router.navigate(targetPath);
        return true;
      }
    }
    return false;
  }

  // Update the current index when navigation happens
  updateIndexForNavigation(path: string): void {
    // Find the path in history or add it
    const historyIndex = this.router.history.indexOf(path);
    if (historyIndex !== -1) {
      // If path exists in history, update index to that position
      this.currentIndex = historyIndex;
    } else {
      // If it's a new path, it will be added to the end of history
      this.currentIndex = this.router.history.length - 1;
    }
  }

  // Replace the current history entry with a new path
  replace(path: string): void {
    // Replace the current history entry
    if (this.router.history.length > 0) {
      this.router.history[this.currentIndex] = path;
    }
    // Navigate to the new path without adding to history
    this.router.navigate(path);
  }

  constructor(private router: any) {}
}

export function createEmbedRouter() {
  const baseRouter = memoryLocation({
    path: buildPageUrl({ type: "home" }),
    record: true,
  });

  const historyManager = new HistoryManager(baseRouter);

  const navigate = (url: string) => {
    let route: string = "";
    try {
      route = new URL(url).pathname;
    } catch (e) {
      route = url;
    }

    // Store the current history length before navigation
    const prevHistoryLength = baseRouter.history.length;

    // This will navigate to the given URL.
    baseRouter.navigate(route);

    // Update the history manager's current index
    // If history length increased, we navigated to a new page
    if (baseRouter.history.length > prevHistoryLength) {
      historyManager.incrementIndex();
    } else {
      // If history length didn't change, update index to the current route
      historyManager.updateIndexForNavigation(route);
    }
  };

  const replace = (url: string) => {
    let route: string = "";
    try {
      route = new URL(url).pathname;
    } catch (e) {
      route = url;
    }

    // Replace the current history entry and navigate
    historyManager.replace(route);
  };

  return {
    ...baseRouter,
    navigate,
    goBack: () => historyManager.back(),
    goForward: () => historyManager.forward(),
    canGoBack: () => historyManager.canGoBack(),
    canGoForward: () => historyManager.canGoForward(),
    replace,
  };
}
