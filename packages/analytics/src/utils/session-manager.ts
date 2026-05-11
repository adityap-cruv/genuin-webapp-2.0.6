/**
 * Session Manager Utility
 * Manages analytics session tracking
 */

const SESSION_KEY = "genuin-analytics-session";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export interface SessionData {
  sessionId: string;
  startTime: number;
  lastActivityTime: number;
}

/**
 * SessionManager handles session tracking for analytics
 */
export class SessionManager {
  /**
   * Get current session ID (creates new session if needed)
   */
  static getSessionId(): string {
    const session = this.getSession();
    return session.sessionId;
  }

  /**
   * Get current session data
   */
  static getSession(): SessionData {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
      return this.createNewSession();
    }

    try {
      const stored = sessionStorage.getItem(SESSION_KEY);

      if (!stored) {
        return this.createAndStoreSession();
      }

      const session: SessionData = JSON.parse(stored);
      const now = Date.now();

      // Check if session has expired
      if (now - session.lastActivityTime > SESSION_TIMEOUT) {
        return this.createAndStoreSession();
      }

      // Update last activity time
      session.lastActivityTime = now;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return session;
    } catch (error) {
      console.error("[SessionManager] Error getting session:", error);
      return this.createNewSession();
    }
  }

  /**
   * Generate a new session ID
   */
  static generateSessionId(): string {
    // Generate UUID-like session ID
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Clear current session
   */
  static clearSession(): void {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
      return;
    }

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error("[SessionManager] Error clearing session:", error);
    }
  }

  /**
   * Get session duration in milliseconds
   */
  static getSessionDuration(): number {
    const session = this.getSession();
    return Date.now() - session.startTime;
  }

  /**
   * Check if this is a new session
   */
  static isNewSession(): boolean {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
      return true;
    }

    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return !stored;
    } catch (error) {
      return true;
    }
  }

  /**
   * Update last activity time
   */
  static updateActivity(): void {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
      return;
    }

    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return;

      const session: SessionData = JSON.parse(stored);
      session.lastActivityTime = Date.now();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("[SessionManager] Error updating activity:", error);
    }
  }

  /**
   * Create a new session
   */
  private static createNewSession(): SessionData {
    const now = Date.now();
    return {
      sessionId: this.generateSessionId(),
      startTime: now,
      lastActivityTime: now,
    };
  }

  /**
   * Create and store a new session
   */
  private static createAndStoreSession(): SessionData {
    const session = this.createNewSession();

    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch (error) {
        console.error("[SessionManager] Error storing session:", error);
      }
    }

    return session;
  }
}
