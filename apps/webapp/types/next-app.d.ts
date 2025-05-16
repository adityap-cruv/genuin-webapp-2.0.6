// This file extends the Next.js types for app directory features in Next.js 15

// For React 19 JSX types
import React from 'react'

// For metadata API
declare module 'next' {
  // Extend the Metadata type with additional properties for Next.js 15
  export interface Metadata {
    metadataBase?: URL
    alternates?: {
      canonical?: string
      languages?: Record<string, string>
      types?: Record<string, string>
    }
    openGraph?: {
      type?: string
      title?: string | { absolute?: string; default?: string; template?: string }
      description?: string
      images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
      locale?: string
      siteName?: string
    }
    twitter?: {
      card?: 'summary' | 'summary_large_image' | 'app' | 'player'
      site?: string
      creator?: string
      title?: string
      description?: string
      images?: Array<{ url: string; alt?: string }>
    }
  }

  // Viewport configuration for Next.js 15
  export interface Viewport {
    width?: string | number
    height?: string | number
    initialScale?: number
    minimumScale?: number
    maximumScale?: number
    userScalable?: boolean
    viewportFit?: 'auto' | 'contain' | 'cover'
    themeColor?: string
  }
}

// Extend the React namespace to include Next.js 15 specific types
declare module 'react' {
  // Add support for the use() hook
  export function use<T>(promise: Promise<T>): T
}
