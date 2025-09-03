import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { EmbedConfig } from '../types/embed'

interface SDKContextType {
  config: EmbedConfig | null
  isInitialized: boolean
  error: string | null
  setConfig: (config: EmbedConfig) => void
  setError: (error: string | null) => void
}

const SDKContext = createContext<SDKContextType | undefined>(undefined)

interface SDKProviderProps {
  children: React.ReactNode
  initialConfig?: EmbedConfig
}

export function SDKProvider({ children, initialConfig }: SDKProviderProps) {
  const [config, setConfigState] = useState<EmbedConfig | null>(
    initialConfig || null,
  )
  const [isInitialized, setIsInitialized] = useState(!!initialConfig)
  const [error, setError] = useState<string | null>(null)

  const setConfig = (newConfig: EmbedConfig) => {
    setConfigState(newConfig)
    setIsInitialized(true)
    setError(null)
  }

  const contextValue: SDKContextType = {
    config,
    isInitialized,
    error,
    setConfig,
    setError,
  }

  return (
    <SDKContext.Provider value={contextValue}>{children}</SDKContext.Provider>
  )
}

export function useSDK(): SDKContextType {
  const context = useContext(SDKContext)
  if (context === undefined) {
    throw new Error('useSDK must be used within an SDKProvider')
  }
  return context
}

export function useSDKConfig(): EmbedConfig {
  const { config, isInitialized } = useSDK()
  if (!isInitialized || !config) {
    throw new Error('SDK not initialized. Call Genuin.init() first.')
  }
  return config
}
