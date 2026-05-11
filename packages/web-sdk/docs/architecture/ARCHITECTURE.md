# Web SDK Architecture Overview

## Architecture Overview

The Genuin Web SDK is designed as a modular, singleton-based architecture that provides an embeddable React application for integrating Genuin content into third-party websites. The architecture follows a layered approach with clear separation of concerns, using singleton patterns for shared services and an event-driven communication system.

## Core Architecture Components

### 1. GenuinSDK - Main Entry Point

**Location**: `src/sdk/GenuinSDK.ts`

The `GenuinSDK` is the primary singleton class that orchestrates the entire SDK functionality:

```typescript
export class GenuinSDK {
  // Singleton instance
  private static instance: GenuinSDK;

  // Core managers (all singletons)
  private configManager: ConfigManager;
  private eventManager: EventManager;
  private errorHandler: ErrorHandler;
  private tokenManager: TokenManager;
  private themeManager: ThemeManager;
  private brandDetailsManager: BrandDetailsManager;
  private embedDetailsManager: EmbedDetailsManager;
  private callbackQueueManager: CallbackQueueManager;
  private placementManager: PlacementManager;

  // SDK state
  private isInitialized = false;
  private sdkElements: SDKElementsType = {};
}
```

**Key Responsibilities**:

- **Singleton Pattern**: Ensures only one SDK instance exists globally
- **Initialization**: Handles embed discovery, configuration parsing, and initialization
- **Authentication**: Manages user authentication and token handling
- **Updates**: Processes configuration updates (contextual params, start video, etc.)
- **Event Coordination**: Emits events to the event bus for inter-component communication

### 2. Core Managers Layer

All core managers follow the singleton pattern and handle specific domains:

#### EventManager - Event Bus

**Location**: `src/core/events.ts`

```typescript
export class EventManager {
  private static instance: EventManager;
  private listeners: Map<SDKEventType, Set<EventListener>> = new Map();
  private eventHistory: SDKEvent[] = [];

  // Core methods
  on(eventType: SDKEventType, listener: EventListener);
  off(eventType: SDKEventType, listener: EventListener);
  emit(eventType: SDKEventType, payload?: any);
  onAll(listener: EventListener);
}
```

**Key Features**:

- **Pub/Sub Pattern**: Allows components to subscribe to and emit events
- **Event History**: Maintains a rolling history of events (max 100)
- **Error Handling**: Safely executes listeners with try-catch
- **Promise-based Waiting**: `waitFor()` method for async event handling

**Event Types**:

```typescript
enum SDKEventType {
  EMBED_LOADED = "embed:loaded",
  SDK_AUTHENTICATE_USER = "sdk:authenticateUser",
  SDK_UPDATE_CONTEXTUAL_PARAMS = "sdk:updateContextualParams",
  SDK_UPDATE_START_VIDEO_SLUG = "sdk:updateStartVideoSlug",
  SDK_EMBED_PROVIDER_READY = "sdk:embedProviderReady",
  // ... and more
}
```

#### APIService - Singleton API Layer

**Location**: `src/core/api.ts`

```typescript
export class APIService {
  private static instance: APIService;

  // Core API methods
  fetchBrandDetails(apiKey: string);
  fetchEmbedData(embedId: string);
  getPlacementData(placementId: string);
  getAuthenticatedUserDetails(token, brandId, userParams);
  getMiniProfile();
}
```

**API Endpoints**:

- `/goservices/brand/details` - Brand configuration
- `/goservices/embed` - Embed configuration
- `/goservices/placement` - Placement configuration
- `/api/v4/sso/autologin` - User authentication
- `/api/v3/auth/profile` - User profile

**Features**:

- **Error Handling**: Integrated with ErrorHandler for consistent error management
- **Authentication**: Handles token-based and session-based auth
- **Caching**: No direct caching (handled by specialized managers)
- **Validation**: Methods for validating API keys and embed IDs

### 3. Specialized Managers

These managers extend the API layer with caching and domain-specific logic:

#### BrandDetailsManager

**Location**: `src/core/brand-details-manager.ts`

```typescript
export class BrandDetailsManager {
  private brandDetailsList: Record<string, BrandDetailsConfigType> = {};

  async getBrandDetails(apiKey: string) {
    if (this.brandDetailsList[apiKey]) {
      return this.brandDetailsList[apiKey]; // Cache hit
    }
    const brandDetails = await apiService.fetchBrandDetails(apiKey);
    this.brandDetailsList[apiKey] = brandDetails; // Cache
    return brandDetails;
  }
}
```

#### EmbedDetailsManager

**Location**: `src/core/embed-details-manager.ts`

```typescript
export class EmbedDetailsManager {
  private embedDetailsList: Record<string, EmbedDataType> = {};

  async getEmbedDetails(embedId: string, brandDetails) {
    if (this.embedDetailsList[embedId]) {
      return this.embedDetailsList[embedId];
    }
    const embedDetails = await apiService.fetchEmbedData(embedId);
    this.embedDetailsList[embedId] = embedDetails;
    return embedDetails;
  }
}
```

#### TokenManager

**Location**: `src/core/token-manager.ts`

```typescript
export class TokenManager {
  private cachedUser: AuthUser | null = null

  async getCurrentUser(config) {
    if (this.cachedUser) return this.cachedUser

    // Handle token-based auth
    if (config?.token) {
      const apiResponse = await apiService.getAuthenticatedUserDetails(...)
      // Parse and cache user
    }

    // Handle session-based auth
    if (this.hasAccessToken()) {
      const profile = await apiService.getMiniProfile()
      // Parse and cache user
    }
  }
}
```

#### PlacementManager

**Location**: `src/core/placement-manager.ts`

```typescript
export class PlacementManager {
  private placements: Map<string, EmbedDataType> = new Map();

  async getPlacementData(placementId: string, styleId: string) {
    if (this.placements.has(placementId)) {
      return this.placements.get(placementId);
    }
    const placementData = await apiService.getPlacementData(placementId);
    const parsedData = parsePlacementToEmbedData(placementData, styleId);
    this.placements.set(placementId, parsedData);
    return parsedData;
  }
}
```

## Event Flow Architecture Diagram

### Client ↔ SDK ↔ Component Library Communication

This diagram illustrates the detailed event flow between layers with proper alignment and rich descriptions:

```
+-------------------------------------------------------------------------+
|                         CLIENT APPLICATION                              |
|                                                                         |
| • Third-party website that embeds Genuin content                        |
| • Interacts via global API interface (window.genuin.*)                  |
| • Configures embeds with data attributes on DOM elements                |
| • Provides auth tokens, contextual parameters, and user data            |
| • Registers callbacks for SDK events (authentication, content updates)  |
+-------------------------------------------------------------------------+
                |
                | 1. SDK Commands with rich payloads:
                |    • init({apiKey, embedId, token, contextual_params})
                |    • update({contextual_params, start_video_slug})
                |    • Initialization triggers DOM discovery
                v
+-------------------------------------------------------------------------+
|                           SDK CORE LAYER                                |
|                                                                         |
| • GenuinSDK: Main orchestrator with lifecycle management                |
|   - Discovers and configures embed elements in the DOM                  |
|   - Processes configuration from attributes and API calls               |
|   - Maintains state of all embeds on the page                           |
|                                                                         |
| • EventManager: Central event bus with pub/sub functionality            |
|   - Maintains event history (max 100 events)                            |
|   - Provides listeners with subscription cleanup functions              |
|   - Supports targeted and broadcast events                              |
|                                                                         |
| • Specialized Managers with domain-specific caching:                    |
|   - TokenManager: Authentication state and session handling             |
|   - BrandDetailsManager: Brand configuration and caching                |
|   - EmbedDetailsManager: Embed configuration and caching                |
|   - PlacementManager: Placement data management                         |
|   - APIService: HTTP requests with consistent error handling            |
+-------------------------------------------------------------------------+
                |
                | 2. Rich SDK Events with structured payloads:
                |    • sdk:authenticateUser (user profile, permissions)
                |    • sdk:updateContextualParams (geo, segments, interests)
                |    • sdk:embedProviderReady (embedId, container)
                |    • sdk:updateStartVideoSlug (videoId, action)
                v
+------------------------------------------------------------------------+
|                      COMPONENT LIBRARY LAYER                           |
|                                                                        |
| • React Component Architecture:                                        |
|   - Embed containers with responsive layouts                           |
|   - Video players, feeds, and interactive UI elements                  |
|   - State management via React hooks and contexts                      |
|                                                                        |
| • Event-Driven Update System:                                          |
|   - Components subscribe to specific SDK events                        |
|   - Updates trigger precise re-renders of affected components          |
|   - Authentication state propagates through context providers          |
|                                                                        |
| • Business Logic Components:                                           |
|   - Video playback with analytics tracking                             |
|   - Content recommendation algorithms                                  |
|   - User interaction handling (likes, shares, comments)                |
|   - Form submission and validation                                     |
+------------------------------------------------------------------------+
                ^
                | 3. Rich Component Events with contextual data:
                |    • user:interaction (action, target, metadata)
                |    • content:updated (contentId, viewPercentage)
                |    • navigation (path, source, previousPath)
                |    • embed:resize (width, height, embedId)
                |
+-------------------------------------------------------------------------+
|                          EVENT FLOW DETAIL                              |
|                                                                         |
| • Bidirectional Communication:                                          |
|   - Client-to-SDK: Configuration, authentication, context updates       |
|   - SDK-to-Components: User data, content settings, UI state changes    |
|   - Components-to-SDK: User interactions, view tracking, form data      |
|   - SDK-to-Client: Event callbacks, error reporting, analytics          |
|                                                                         |
| • Data Transformation:                                                  |
|   - Client data normalized by SDK before reaching components            |
|   - Component events processed and enriched by SDK before callbacks     |
|   - Context parameters applied to content filtering and sorting         |
+-------------------------------------------------------------------------+
```

### Event Flow Architecture Benefits

The diagram above illustrates how the architecture maintains clear separation of concerns while enabling rich interactions:

- **Client Layer** provides configuration and receives callbacks without needing to understand component implementation
- **SDK Core Layer** acts as a mediator, handling API calls, caching, and event orchestration
- **Component Library Layer** focuses on rendering and user interactions without direct dependency on client applications

### Separation of Concerns in Event Flow

#### 1. **Client Layer** (Presentation/Integration)

- **Responsibility**: Website integration and user experience
- **Knows About**: SDK public API, DOM manipulation
- **Doesn't Know**: Internal SDK implementation, component details
- **Communication**: Calls SDK methods, listens to SDK events

#### 2. **SDK Core Layer** (Business Logic/Orchestration)

- **Responsibility**: Data management, API communication, state coordination
- **Knows About**: Client requirements, component interfaces
- **Doesn't Know**: Client-specific UI details, component internal state
- **Communication**: Receives client commands, emits events to components

#### 3. **Component Library Layer** (UI Components/State)

- **Responsibility**: Rendering, user interaction, local state management
- **Knows About**: SDK events, React patterns
- **Doesn't Know**: Client context, external API details
- **Communication**: Listens to SDK events, emits interaction events

### Event Flow Examples

#### **Authentication Flow**:

```
Client: window.genuin.init({ token: 'abc123' })
    ↓
SDK: GenuinSDK.authenticateUser()
    ↓
TokenManager: getCurrentUser() → APIService.getAuthenticatedUserDetails()
    ↓
EventManager: emit('sdk:authenticateUser', user)
    ↓
Components: Listen to event → Update user state → Re-render authenticated UI
```

#### **Contextual Parameter Update**:

```
Client: window.genuin.update({ contextual_params: { geo: { lat: 40.7, long: -74.0 } } })
    ↓
SDK: GenuinSDK.updateContextualParams()
    ↓
EventManager: emit('sdk:updateContextualParams', params)
    ↓
Components: Listen to event → Update local contextual state → Filter content
```

#### **User Interaction Flow**:

```
User: Clicks video in component
    ↓
Component: Emits 'user:interaction' event
    ↓
EventManager: Receives event → Processes interaction
    ↓
SDK: Updates interaction tracking → Emits 'content:updated'
    ↓
Other Components: Listen to event → Update related content
```

### Code Examples: Function Calls and Event Handling

Here are practical examples of how to call SDK methods and subscribe to events in both vanilla JavaScript and React environments.

#### Vanilla JavaScript Example

This example shows how to initialize the SDK, authenticate a user, and listen for the `auth:success` event.

```javascript
// 1. Initialize the SDK with configuration
window.genuin.init({
  apiKey: "YOUR_API_KEY",
  embedId: "YOUR_EMBED_ID",
  token: "USER_AUTH_TOKEN",
});

// 2. Define a listener function to handle successful authentication
const handleAuthSuccess = (event) => {
  console.log("Authentication successful:", event.payload);
  // You can now update your UI, e.g., show a personalized welcome message
  const user = event.payload;
  document.getElementById("user-greeting").innerText = `Welcome, ${user.name}!`;
};

// 3. Subscribe to the 'auth:success' event
// The SDK will emit this event after the user is successfully authenticated via the token.
window.genuin.on("auth:success", handleAuthSuccess);

// 4. To prevent memory leaks, it's good practice to clean up the listener
//    when it's no longer needed.
// window.genuin.off('auth:success', handleAuthSuccess);
```

#### React Hook Example (`useSDK`)

For React applications, the `useSDK` hook provides a convenient and idiomatic way to interact with the SDK from within your components.

```jsx
import React, { useEffect, useState } from "react";
import { useSDK, SDKEventType } from "@genuin/web-sdk"; // Assuming this is the package name

const UserProfile = () => {
  const sdk = useSDK(); // Access the SDK instance
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Ensure the SDK instance is available before proceeding
    if (!sdk) {
      return;
    }

    // Define the listener for authentication success
    const handleAuthSuccess = (event) => {
      console.log("Authenticated user:", event.payload);
      setUser(event.payload); // Update component state with user data
    };

    // The 'on' method returns an unsubscribe function, which is perfect for useEffect's cleanup
    const unsubscribe = sdk.on(SDKEventType.AUTHENTICATION_SUCCESS, handleAuthSuccess);

    // The cleanup function in useEffect will be called automatically when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [sdk]); // The effect re-runs if the SDK instance changes

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default UserProfile;
```

### Benefits of This Architecture

1. **Loose Coupling**: Each layer communicates through well-defined event interfaces
2. **Testability**: Components can be tested independently with mocked events
3. **Maintainability**: Changes in one layer don't require changes in others
4. **Scalability**: New components can be added without modifying existing code
5. **Debugging**: Event history and logging make issues easier to trace
6. **Performance**: Event-driven updates prevent unnecessary re-renders

This event flow architecture ensures that the SDK remains a clean abstraction layer between client applications and the component library, maintaining separation of concerns while enabling seamless communication.

## Global API Integration

**Location**: `src/index.ts`

The SDK provides both modern ES module exports and legacy global APIs:

```typescript
// Modern API
export { GenuinSDK } from "./sdk";
export const Genuin = GenuinSDK.getInstance();

// Global API for browser
if (typeof window !== "undefined") {
  window.GenuinSDK = Genuin;
  window.genuin = {
    SDK: Genuin,
    on: Genuin.on.bind(Genuin),
    init: (config) => Genuin.newInit(config),
    // ...
  };
}
```

## Key Design Patterns

1. **Singleton Pattern**: All core services are singletons
2. **Observer Pattern**: Event-driven communication via EventManager
3. **Factory Pattern**: Embed creation and configuration parsing
4. **Decorator Pattern**: API response parsing and caching
5. **Strategy Pattern**: Different initialization strategies (embed vs placement)

## Benefits of This Architecture

- **Modularity**: Clear separation of concerns
- **Testability**: Singleton instances can be mocked
- **Performance**: Caching reduces API calls
- **Maintainability**: Event-driven loose coupling
- **Scalability**: Easy to add new managers or event types
- **Backward Compatibility**: Legacy API support

This architecture provides a robust, scalable foundation for the Genuin Web SDK while maintaining clean code organization and efficient resource management.
