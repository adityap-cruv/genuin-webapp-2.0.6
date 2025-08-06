/**
 * Type definition for event listeners that receive context
 */
type EventListener<TContext, TEventData = any> = (
  eventData: TEventData,
  context: TContext
) => void;

/**
 * Generic event manager singleton class that maintains typed context
 * and passes it to all event listeners
 */
export class EventManager<TContext, TEventNames extends string = string> {
  private static instance: EventManager<any, any> | null = null;
  private listeners: Map<TEventNames, Set<EventListener<TContext, any>>> =
    new Map();
  private context: TContext;

  /**
   * Create a new EventManager instance with typed context
   * @param initialContext - The initial context that will be passed to all listeners
   */
  constructor(initialContext: TContext) {
    this.context = initialContext;
  }

  /**
   * Get or create the singleton instance of EventManager
   * @param initialContext - The initial context (only used on first call)
   * @returns The singleton EventManager instance
   */
  static getInstance<TContext, TEventNames extends string = string>(
    initialContext?: TContext
  ): EventManager<TContext, TEventNames> {
    if (!EventManager.instance) {
      if (!initialContext) {
        throw new Error(
          "EventManager: initialContext is required for first instantiation"
        );
      }
      EventManager.instance = new EventManager(initialContext);
    }
    return EventManager.instance as EventManager<TContext, TEventNames>;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    EventManager.instance = null;
  }

  /**
   * Add an event listener for a specific event type
   * @param eventType - The type/name of the event
   * @param listener - The listener function that will receive event data and context
   */
  on<TEventData = any>(
    eventType: TEventNames,
    listener: EventListener<TContext, TEventData>
  ): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  /**
   * Remove an event listener for a specific event type
   * @param eventType - The type/name of the event
   * @param listener - The listener function to remove
   */
  off<TEventData = any>(
    eventType: TEventNames,
    listener: EventListener<TContext, TEventData>
  ): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param eventType - The type/name of the event
   * @param eventData - The data to pass to the listeners
   * @param contextUpdate - Optional context update to apply before emitting
   */
  emit<TEventData = any>(
    eventType: TEventNames,
    eventData?: TEventData,
    contextUpdate?: Partial<TContext> | ((currentContext: TContext) => TContext)
  ): void {
    // Update context if provided
    if (contextUpdate) {
      if (typeof contextUpdate === "function") {
        this.context = contextUpdate(this.context);
      } else {
        this.context = { ...this.context, ...contextUpdate };
      }
    }

    const eventListeners = this.listeners.get(eventType);
    if (!eventListeners) {
      return;
    }

    for (const listener of eventListeners) {
      try {
        listener(eventData, this.context);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    }
  }

  /**
   * Update the context that will be passed to future listener calls
   * @param newContext - The new context to use
   */
  updateContext(newContext: TContext): void {
    this.context = newContext;
  }

  /**
   * Get the current context
   * @returns The current context
   */
  getContext(): TContext {
    return this.context;
  }

  /**
   * Remove all listeners for a specific event type
   * @param eventType - The type/name of the event
   */
  removeAllListeners(eventType?: TEventNames): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get all event types that have listeners
   * @returns Array of event types
   */
  getEventTypes(): TEventNames[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get the number of listeners for a specific event type
   * @param eventType - The type/name of the event
   * @returns Number of listeners
   */
  getListenerCount(eventType: TEventNames): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }
}

// // Example usage and type definitions
// interface MyAppContext {
//   userId: string;
//   theme: "light" | "dark";
//   permissions: string[];
// }

// interface UserLoginEvent {
//   userId: string;
//   timestamp: Date;
//   loginMethod: "email" | "oauth" | "sso";
// }

// interface ThemeChangeEvent {
//   oldTheme: string;
//   newTheme: string;
// }

// // Define event names as a union type for inference
// type AppEventNames =
//   | "user:login"
//   | "user:logout"
//   | "theme:change"
//   | "permission:update";

// // Example usage:
// /*
// // Create the singleton event manager with typed context
// // Event names are inferred from usage, not passed during construction
// const eventManager = EventManager.getInstance<MyAppContext, AppEventNames>({
//   userId: 'user-123',
//   theme: 'light',
//   permissions: ['read', 'write']
// });

// // Get the same instance anywhere in your app
// const sameInstance = EventManager.getInstance<MyAppContext, AppEventNames>();

// // Add typed event listeners - TypeScript will enforce event name types
// eventManager.on<UserLoginEvent>('user:login', (eventData, context) => {
//   console.log(`User ${eventData.userId} logged in at ${eventData.timestamp}`);
//   console.log(`Current app context:`, context);
// });

// eventManager.on<ThemeChangeEvent>('theme:change', (eventData, context) => {
//   console.log(`Theme changed from ${eventData.oldTheme} to ${eventData.newTheme}`);
//   console.log(`User ${context.userId} is using ${context.theme} theme`);
// });

// // Emit events with context updates
// eventManager.emit<UserLoginEvent>('user:login', {
//   userId: 'user-123',
//   timestamp: new Date(),
//   loginMethod: 'email'
// }, {
//   permissions: ['read', 'write', 'admin'] // Update permissions on login
// });

// // Function-based context update
// eventManager.emit<ThemeChangeEvent>('theme:change', {
//   oldTheme: 'light',
//   newTheme: 'dark'
// }, (currentContext) => ({
//   ...currentContext,
//   theme: 'dark'
// }));

// // Simple emit without context update
// eventManager.emit('user:logout');

// // TypeScript will prevent using invalid event names if you specify the union type:
// // eventManager.emit('invalid:event'); // ✗ TypeScript error if AppEventNames doesn't include this

// // Reset instance (useful for testing)
// EventManager.resetInstance();
// */

// export { EventManager, type EventListener };
// export type { MyAppContext, UserLoginEvent, ThemeChangeEvent, AppEventNames };
