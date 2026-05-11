/**
 * Utility for managing pending actions in localStorage
 * Used to persist user actions across authentication flow
 */

export type PendingActionType =
  | "spark"
  | "comment-spark"
  | "comment"
  | "repost"
  | "report"
  | "join-community"
  | "join-group"
  | "subscribe-group"
  | "become-a-creator"
  | "iheart-follow";

export interface PendingActionData {
  action: PendingActionType;
  videoSlug?: string;
  videoId?: string;
  commentId?: string;
  embedId?: string;
  divId?: string;
  timestamp: number;
  communityId?: string;
  groupId?: string;
  followId?: string;
  followType?: "station" | "podcast";
}

const STORAGE_KEY = "gen_pending_action";
const EXPIRY_TIME = 5 * 60 * 1000; // 5 mins

/**
 * Checks if we're in a browser environment with localStorage available
 */
function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

/**
 * Saves a pending action to localStorage
 * @param data The action data to save
 */
export function savePendingAction(data: Omit<PendingActionData, "timestamp">): void {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage not available, cannot save pending action");
    return;
  }

  try {
    const actionData: PendingActionData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actionData));
  } catch (error) {
    console.error("Failed to save pending action:", error);
  }
}

/**
 * Retrieves a pending action from localStorage
 * Returns null if not found or expired (unless ignoreExpiry is true)
 * @param ignoreExpiry If true, returns the action even if expired without clearing it
 */
export function getPendingAction(ignoreExpiry: boolean = false): PendingActionData | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: PendingActionData = JSON.parse(stored);

    // Check if action has expired (unless ignoreExpiry is true)
    if (!ignoreExpiry) {
      const age = Date.now() - data.timestamp;
      if (age > EXPIRY_TIME) {
        clearPendingAction();
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error("Failed to retrieve pending action:", error);
    clearPendingAction(); // Clear corrupted data
    return null;
  }
}

/**
 * Clears the pending action from localStorage
 */
export function clearPendingAction(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear pending action:", error);
  }
}
