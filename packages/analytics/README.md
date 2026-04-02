# @genuin/analytics

Generic analytics package with multi-provider support for tracking analytics events.

## Features

- 🔌 **Multi-Provider Support** - Use Rudderstack, Console Logger, or create custom providers
- 📦 **Event Queue System** - Queue events before providers are ready, with size limits and TTL
- 🔀 **Middleware System** - Transform events with middleware (enrichment, validation, logging, etc.)
- 🎯 **Type-Safe** - Full TypeScript support
- ⚛️ **React Bindings** - Optional React hooks and context provider
- 🌐 **Framework Agnostic** - Core works anywhere, React bindings are optional
- 💾 **Queue Persistence** - Optionally persist queued events to localStorage
- 🎨 **Flexible Configuration** - Extensive configuration options for all components

## Installation

```bash
pnpm add @genuin/analytics
```

## Quick Start

### Basic Usage (Vanilla JS/TS)

```typescript
import { AnalyticsClient, RudderstackProvider } from '@genuin/analytics'

// Create analytics client
const analytics = new AnalyticsClient({
  providers: [
    new RudderstackProvider({
      writeKey: 'YOUR_WRITE_KEY',
      dataplaneUrl: 'https://your-dataplane-url.com',
    })
  ],
  defaultPayload: {
    brand_id: 123,
    user_id: 'user-456',
    channel: 'web sdk',
    environment: 'production',
  },
  debug: true,
})

// Track events
await analytics.track('Video Started', {
  video_id: 'video-123',
  video_length: 120,
})

// Identify users
await analytics.identify('user-456', {
  name: 'John Doe',
  email: 'john@example.com',
})

// Track page views
await analytics.page('Home Page', {
  path: '/',
})
```

### React Usage

```typescript
import { AnalyticsClient, RudderstackProvider } from '@genuin/analytics'
import { AnalyticsProvider, useAnalytics } from '@genuin/analytics/react'

// Create client
const analyticsClient = new AnalyticsClient({
  providers: [new RudderstackProvider({ ... })],
  defaultPayload: { ... },
})

// Wrap app with provider
function App() {
  return (
    <AnalyticsProvider client={analyticsClient}>
      <YourApp />
    </AnalyticsProvider>
  )
}

// Use in components
function VideoPlayer() {
  const { track } = useAnalytics()

  const handlePlay = () => {
    track('Video Started', {
      video_id: 'video-123',
    })
  }

  return <button onClick={handlePlay}>Play</button>
}
```

## Advanced Usage

### With Middleware

```typescript
import {
  AnalyticsClient,
  RudderstackProvider,
} from '@genuin/analytics'
import {
  enrichmentMiddleware,
  loggingMiddleware,
  deduplicationMiddleware,
} from '@genuin/analytics/middleware'

const analytics = new AnalyticsClient({
  providers: [new RudderstackProvider({ ... })],
  defaultPayload: { ... },
  debug: true,
})

// Add middleware
analytics.use(enrichmentMiddleware)  // Adds device, session, page context
analytics.use(loggingMiddleware)     // Logs events in debug mode
analytics.use(deduplicationMiddleware) // Prevents duplicate events
```

### Multiple Providers

```typescript
import {
  AnalyticsClient,
  RudderstackProvider,
  ConsoleProvider,
} from '@genuin/analytics'

const analytics = new AnalyticsClient({
  providers: [
    new RudderstackProvider({ ... }),      // Production analytics
    new ConsoleProvider({ debug: true }),  // Development logging
  ],
})

// Events are sent to ALL providers
```

### Queue Configuration

```typescript
const analytics = new AnalyticsClient({
  providers: [new RudderstackProvider({ ... })],
  queue: {
    maxSize: 100,           // Max events to queue
    maxAge: 300000,         // 5 minutes TTL
    persist: true,          // Save to localStorage
    persistKey: 'my-analytics-queue',
    strategy: 'priority',   // 'fifo', 'lifo', or 'priority'
  },
})
```

### Event Validation

```typescript
const analytics = new AnalyticsClient({
  providers: [new RudderstackProvider({ ... })],
  validation: {
    enabled: true,
    whitelist: ['Video Started', 'Video Complete'], // Only these events allowed
    throwOnError: true,  // Throw on validation errors
  },
})
```

## API Reference

### AnalyticsClient

Main client for tracking analytics events.

```typescript
const client = new AnalyticsClient(config)

// Methods
await client.initialize()
await client.track(eventName, payload, options)
await client.identify(userId, traits)
await client.page(pageName, properties)
await client.group(groupId, traits)

client.setDefaultPayload(payload)
client.updateDefaultPayload(partialPayload)
client.use(middleware)
client.isReady()
client.getMetrics()
client.destroy()
```

### RudderstackProvider

Provider for Rudderstack analytics.

```typescript
const provider = new RudderstackProvider({
  writeKey: 'YOUR_WRITE_KEY',
  dataplaneUrl: 'https://your-dataplane.com',
  loadOptions: {
    storage: { type: 'localStorage' },
    plugins: ['DeviceModeDestinations'],
  },
})
```

### ConsoleProvider

Provider that logs events to console (useful for debugging).

```typescript
const provider = new ConsoleProvider({
  useColors: true,
  showTimestamps: true,
  prettyPrint: true,
  logLevel: 'log',
})
```

### React Hooks

```typescript
// Get analytics context
const { track, identify, page, isReady } = useAnalytics()

// Get individual methods
const track = useTrack()
const identify = useIdentify()
const page = usePage()

// Auto-track page views
usePageTracking('Page Name', { custom: 'props' })

// Type-safe event names
const EventNames = useEventNames({
  VIDEO_STARTED: 'Video Started',
  VIDEO_COMPLETED: 'Video Complete',
})
track(EventNames.VIDEO_STARTED, { ... })
```

## Utilities

```typescript
import {
  BrowserDetector,
  DeviceDetector,
  URLParser,
  SessionManager,
  DeviceIdManager,
} from '@genuin/analytics'

// Browser detection
const browser = BrowserDetector.detect()
const isChrome = BrowserDetector.isChrome()

// Device detection
const device = DeviceDetector.detect()
const isMobile = DeviceDetector.isMobile()
const os = DeviceDetector.getOS()

// URL parsing
const path = URLParser.getPath()
const queryParams = URLParser.getQueryParams()

// Session management
const sessionId = SessionManager.getSessionId()

// Device ID
const deviceId = DeviceIdManager.getDeviceId()
```

## License

Private - Genuin Inc.
