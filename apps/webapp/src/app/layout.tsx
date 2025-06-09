import { Inter } from 'next/font/google'
import './globals.css'
import '@genuin/components/globals.css'
import { type Metadata, type Viewport } from 'next'

// Root layout is now split into server and client parts for Next.js 15
// Client components are wrapped in ClientProviders
import ClientProviders from './client-providers'

// Enhanced font configuration for better performance
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Ensures text remains visible during font load
  preload: true, // Preloads font files
  fallback: ['system-ui', 'sans-serif'], // Fallback fonts
  adjustFontFallback: true, // Automatically adjusts the fallback font to match
})

// Metadata API for Next.js 15
export const metadata: Metadata = {
  title: {
    template: '%s | Genuin',
    default: 'Genuin',
  },
  description: 'A video community platform',
  metadataBase: new URL('https://app.begenuin.com'),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
