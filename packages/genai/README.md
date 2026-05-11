# GenAI SDK (@genuin/genai-sdk)

A powerful and flexible React-based SDK for integrating AI-powered chat functionality into web applications. This SDK provides a modern, customizable chat interface that can be embedded in different views (page, dialog, or floater).

## Features

- 🎯 Multiple View Modes
    - Page View: Embedded directly into your page layout
    - Dialog View: Opens as a modal dialog
    - Floater View: Appears as a floating chat widget

- 💅 Modern UI/UX
    - Responsive design
    - Smooth animations and transitions
    - Tailwind CSS styling with prefix isolation
    - Beautiful and intuitive chat interface

- 🔧 Highly Customizable
    - Customizable themes
    - Flexible layout options
    - Extensible component architecture

- 🚀 Advanced Features
    - Real-time chat functionality
    - Message history management
    - Session management
    - Agent-based conversations
    - Markdown support with GFM (GitHub Flavored Markdown)
    - Carousel embeds support
    - File upload capabilities
    - Agent presets and suggestions
    - Session migration and persistence
    - Response feedback system (like/dislike)
    - Thinking messages display
    - Auto-generated session titles

## Installation

Include the SDK directly in your HTML using a script tag:

```html
<!-- Add the SDK script to your HTML -->
<script type="module" src="https://your-cdn-url/genai-sdk.es.js"></script>
```

## Usage

#### Basic Setup

```html
<!DOCTYPE html>
<html>
    <head>
        <title>GenAI SDK Example</title>
    </head>
    <body>
        <!-- For page view mode -->
        <div id="genai-container"></div>

        <!-- Add the SDK script -->
        <script type="module" src="https://your-cdn-url/genai-sdk.es.js"></script>

        <!-- Initialize the SDK -->
        <script>
            // The SDK is available as window.GenAISDK
            window.GenAISDK.init({
                userId: 'user-123',
                brandId: 456,
                // Optional parameters
                sessionId: 'optional-session-id',
                view: 'dialog', // 'dialog' | 'page' | 'floater'
            });
        </script>
    </body>
</html>
```

#### View Modes

1. **Dialog Mode (Default)**

```javascript
// Opens as a modal dialog
GenAISDK.init({
    userId: 'user-123',
    brandId: 456,
    view: 'dialog',
});
```

2. **Page Mode**

```javascript
// Embeds in a container element
GenAISDK.init({
    userId: 'user-123',
    brandId: 456,
    view: 'page',
    containerId: 'genai-container', // Required for page view
});
```

3. **Floater Mode**

```javascript
// Creates a floating chat button
GenAISDK.init({
    userId: 'user-123',
    brandId: 456,
    view: 'floater',
});
```

#### Configuration Options

```typescript
interface SDKConfig {
    containerId?: string; // Required for 'page' view
    userId: string; // Required: User identifier
    brandId: number; // Required: Brand identifier (must be >= 0)
    sessionId?: string; // Optional: Session identifier for existing sessions
    view?: 'page' | 'floater' | 'dialog'; // Optional: View mode (defaults to 'dialog')
    draggable?: boolean; // Optional: Enable draggable floater
    userEmail?: string; // Optional: User email address
    userUUID?: string; // Optional: User UUID
    isMaya?: boolean; // Optional: Maya-only mode configuration
}
```

**Required Parameters:**

- `userId`: Unique identifier for the user
- `brandId`: Brand identifier (must be 0 or greater)

**Optional Parameters:**

- `containerId`: Required only for 'page' view mode
- `sessionId`: Use to resume an existing chat session
- `view`: Controls how the chat interface appears
- `draggable`: Enable draggable floater (for 'floater' view)
- `userEmail`: User email address
- `userUUID`: User UUID
- `isMaya`: Maya-only mode configuration (see below)

#### isMaya Configuration

The `isMaya` parameter controls whether the SDK displays only the Maya agent or all available agents:

- **`isMaya: true`** - Maya-only mode: Shows only Maya agent, hides other agents and the AgentsSection
- **`isMaya: false`** - Normal mode: Shows all available agents with full interface (default behavior)
- **`isMaya: undefined`** - Defaults to `false` (normal mode)

**Example: Normal Mode (All Agents)**

```javascript
GenAISDK.init({
    userId: 'user-123',
    brandId: 456,
    view: 'dialog',
    isMaya: false, // Normal mode - shows all agents
});
```

**Example: Maya-Only Mode**

```javascript
GenAISDK.init({
    userId: 'user-123',
    brandId: 456,
    view: 'dialog',
    isMaya: true, // Maya-only mode - shows only Maya agent
});
```

**Example: Switching Between Modes**

To switch from normal mode to Maya-only mode (or vice versa), you can use either approach:

**Option 1: Re-initialize with `init()`**

```javascript
// First initialization - normal mode
GenAISDK.init({
    userId: 'user-123',
    brandId: 456,
    view: 'dialog',
    isMaya: false,
});

// Later, switch to Maya-only mode
GenAISDK.init({
    userId: 'user-123',
    brandId: 456,
    view: 'dialog',
    isMaya: true, // Old instance is automatically unmounted
});
```

**Option 2: Use `genai:openDialog` event with `isMaya` in detail**

```javascript
// Initialize SDK first
GenAISDK.init({
    userId: 'user-123',
    brandId: 456,
    view: 'dialog',
    isMaya: false,
});

// Later, switch modes using event
window.dispatchEvent(
    new CustomEvent('genai:openDialog', {
        detail: { isMaya: true }, // Switch to Maya-only mode
    })
);

// Or switch back to normal mode
window.dispatchEvent(
    new CustomEvent('genai:openDialog', {
        detail: { isMaya: false }, // Switch to normal mode
    })
);
```

**React Integration Example**

Here's a complete React component example that handles dynamic mode switching:

```typescript
import { useEffect, useRef, useState } from 'react';

export const GenAIDialog = ({ isMayaMode = false }) => {
    const { user, brand } = useOptionsStore.getState();
    const initializedRef = useRef(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const currentModeRef = useRef<boolean | undefined>(undefined);

    const initGenAISDK = () => {
        if (!scriptLoaded || !window.GenAISDK) return;

        // Check if mode has changed
        if (initializedRef.current && currentModeRef.current !== isMayaMode) {
            // Mode switch detected - SDK will handle unmounting automatically
            console.log(
                `Switching from ${currentModeRef.current ? 'Maya' : 'Normal'} to ${isMayaMode ? 'Maya' : 'Normal'} mode`
            );
        }

        window.GenAISDK.init({
            userId: user?.user_id?.toString() || '',
            brandId: 2314,
            view: 'floater',
            draggable: true,
            userEmail: user?.email || '',
            userUUID: brand?.master_user_uuid || '',
            isMaya: isMayaMode,
        });

        initializedRef.current = true;
        currentModeRef.current = isMayaMode;
    };

    useEffect(() => {
        if (scriptLoaded && window.GenAISDK) {
            initGenAISDK();
        }
    }, [scriptLoaded, isMayaMode]); // Re-initialize when isMayaMode changes

    // ... rest of component
};
```

**Best Practices for Mode Switching**

1. **Always check if SDK is loaded**: Wait for `window.GenAISDK` to be available before calling `init`
2. **Handle mode switches**: When switching modes, the SDK handles cleanup automatically, but ensure your component state is updated
3. **Use refs to track initialization**: Use `useRef` to prevent duplicate initializations
4. **Destroy before switching**: Optionally call `window.GenAISDK.destroy()` before switching modes for explicit cleanup

#### Cleanup

To remove the SDK from your page:

```javascript
GenAISDK.destroy();
```

#### Events

The SDK provides both incoming and outgoing events for seamless integration:

**Incoming Events (Trigger SDK Actions):**

```javascript
// Reopen the dialog programmatically
window.dispatchEvent(new Event('genai:openDialog'));

// Reopen the dialog with isMaya configuration
window.dispatchEvent(
    new CustomEvent('genai:openDialog', {
        detail: { isMaya: true }, // or false for normal mode
    })
);

// Reopen the dialog with isMaya configuration
window.dispatchEvent(
    new CustomEvent('genai:openDialog', {
        detail: { isMaya: true }, // or false for normal mode
    })
);
```

**Outgoing Events (Listen to SDK Actions):**

The SDK dispatches the following custom events that you can listen to:

```javascript
// 1. Session ID Updates - Fired when a chat session is created or changed
window.addEventListener('genai:sessionIdUpdate', event => {
    const { sessionId } = event.detail;
    console.log('Current session ID:', sessionId);

    // Use this to:
    // - Update your application's URL/routing
    // - Track user engagement
    // - Sync with your analytics
    // - Store session state in your application
});

// 2. Share Link Requests - Fired when user clicks the share button
window.addEventListener('genai:shareLink', event => {
    const { sessionId } = event.detail;
    console.log('User wants to share session:', sessionId);

    // Use this to:
    // - Generate shareable links to the conversation
    // - Copy session URLs to clipboard
    // - Integrate with your app's sharing mechanism
    // - Create deep links to specific conversations
});
```

**Example Integration:**

```javascript
// Complete event listener setup
window.addEventListener('genai:sessionIdUpdate', event => {
    const { sessionId } = event.detail;

    if (sessionId) {
        // Update browser URL to include session ID
        history.pushState({}, '', `/chat/${sessionId}`);

        // Track session creation in analytics
        analytics.track('chat_session_created', { sessionId });
    } else {
        // User returned to main chat view
        history.pushState({}, '', '/chat');
    }
});

window.addEventListener('genai:shareLink', event => {
    const { sessionId } = event.detail;

    // Generate shareable URL
    const shareUrl = `${window.location.origin}/chat/${sessionId}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('Share URL copied to clipboard');
    });
});
```

#### Error Handling

The SDK includes built-in error handling:

- Invalid `brandId` (negative values) will log an error
- Missing required parameters will log errors to console
- Failed stylesheet loading will be handled gracefully
- Network errors during API calls are caught and displayed to users

## Development

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm package manager

### Setup

1. Clone the repository
2. Install dependencies:
    ```bash
    pnpm install
    ```

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for development
- `pnpm build:qa` - Build for QA environment
- `pnpm build:prod` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm preview` - Preview the build locally

### Environment Setup

The SDK supports different environments through build modes:

- Development
- QA
- Production

Each environment can be configured using the appropriate build command and environment variables.

## Project Structure

```
src/
├── assets/          # Static assets and SVG icons
├── components/      # React components
│   ├── AgentIntro/     # Agent introduction components
│   ├── Chat/           # Core chat components
│   ├── MessageInput/   # Message input and suggestions
│   ├── Sidebar/        # Sidebar components
│   └── ui/             # Reusable UI components
├── context/        # React context providers
├── lib/           # Utility libraries
└── utils/         # Helper utilities
```

## Technical Stack

- **React 19**: Modern React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with prefix isolation (`gai:`)
- **Vite**: Fast build tool and development server
- **Radix UI Components**: Accessible component primitives
- **AWS SDK**: S3 & CloudFront integration for file uploads
- **Axios**: HTTP client for API communication
- **React Markdown**: GitHub Flavored Markdown support
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

## Build Outputs

The SDK is built as an ES module with the following structure:

- `genai-sdk.es.js` - Main SDK entry point
- `genai-sdk.css` - Stylesheet with prefixed classes
- `chunks/` - Code-split chunks for optimal loading:
    - `react-vendor-[hash].js` - React and React DOM
    - `vendor-deps-[hash].js` - Third-party dependencies
    - `app-[hash].js` - Main application components
    - `chat-[hash].js` - Chat functionality
    - `agentintro-[hash].js` - Agent introduction components

## Environment Support

The SDK supports multiple deployment environments:

- **Development**: Local development with hot reload
- **QA**: Staging environment for testing
- **Production**: Optimized build with compression

Environment-specific configurations are managed through Vite modes and environment variables.
