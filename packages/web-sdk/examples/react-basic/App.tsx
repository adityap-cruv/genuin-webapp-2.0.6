import React, { useState } from 'react'
import {
  SDKProvider,
  CommunityEmbed,
  LoopEmbed,
  UserEmbed,
  useSDK,
  EmbedType,
  EmbedStyle,
} from '@genuin/web-sdk'

// Example component using the SDK
function EmbedExample() {
  const [embedType, setEmbedType] = useState<'community' | 'loop' | 'user'>(
    'community',
  )
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { config, error } = useSDK()

  const handleEmbedLoad = () => {
    console.log('Embed loaded successfully')
  }

  const handleEmbedError = (error: Error) => {
    console.error('Embed error:', error)
  }

  const handleEmbedResize = (height: number) => {
    console.log('Embed resized to:', height)
  }

  if (error) {
    return <div className='error'>Error: {error}</div>
  }

  return (
    <div className='embed-example'>
      <div className='controls'>
        <h3>Embed Controls</h3>

        <div className='control-group'>
          <label>Embed Type:</label>
          <select
            value={embedType}
            onChange={(e) => setEmbedType(e.target.value as any)}>
            <option value='community'>Community</option>
            <option value='loop'>Loop</option>
            <option value='user'>User</option>
          </select>
        </div>

        <div className='control-group'>
          <label>Theme:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}>
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
          </select>
        </div>
      </div>

      <div className='embed-container'>
        {embedType === 'community' && (
          <CommunityEmbed
            communityId='sample-community-id'
            style={EmbedStyle.FEED}
            theme={theme}
            showHeader={true}
            allowInteractions={true}
            maxHeight={600}
            onLoad={handleEmbedLoad}
            onError={handleEmbedError}
            onResize={handleEmbedResize}
          />
        )}

        {embedType === 'loop' && (
          <LoopEmbed
            loopId='sample-loop-id'
            style={EmbedStyle.CAROUSEL}
            theme={theme}
            showHeader={false}
            allowInteractions={true}
            maxHeight={500}
            onLoad={handleEmbedLoad}
            onError={handleEmbedError}
            onResize={handleEmbedResize}
          />
        )}

        {embedType === 'user' && (
          <UserEmbed
            userId='sample-user-id'
            style={EmbedStyle.STANDARD_WALL}
            theme={theme}
            showHeader={true}
            allowInteractions={true}
            maxHeight={600}
            onLoad={handleEmbedLoad}
            onError={handleEmbedError}
            onResize={handleEmbedResize}
          />
        )}
      </div>
    </div>
  )
}

// Main app component
function App() {
  const embedConfig = {
    elementId: 'main-embed',
    type: EmbedType.COMMUNITY,
    style: EmbedStyle.FEED,
    theme: 'light' as const,
    baseUrl: 'https://embed.genuin.ai',
    showHeader: true,
    allowInteractions: true,
    maxHeight: 600,
    autoResize: true,
  }

  return (
    <SDKProvider initialConfig={embedConfig}>
      <div className='app'>
        <header>
          <h1>Genuin Web SDK - React Example</h1>
          <p>Basic usage of Genuin embeds in React</p>
        </header>

        <main>
          <EmbedExample />
        </main>
      </div>
    </SDKProvider>
  )
}

export default App
