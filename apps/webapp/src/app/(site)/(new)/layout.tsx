import { Inter } from 'next/font/google'
import '../../globals.css'
import '@genuin/components/styles'
import { type Metadata, type Viewport } from 'next'

// Root layout is now split into server and client parts for Next.js 15
// Client components are wrapped in ClientProviders
import SiteProviders from '@components/providers/site-providers'
import { cookies } from 'next/headers'
import { getEmbedConfig } from '@lib/api/config'
import { type ConfigType } from '@lib/stores/genuin-options'
import { parseBrandColors } from '@lib/utils'
import { auth } from '../../../../auth'
import { type Session } from 'next-auth'
import Error from '../../error'

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
  description: 'A video community platform',
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL ?? 'https://begenuin.com'),
}

export const viewport: Viewport = {
  height: 'device-height',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // SSR logic for config/session/cookies
  const configParamsStr = (await cookies()).get('config_params')?.value || ''
  let configParams = null
  if (configParamsStr) configParams = JSON.parse(configParamsStr)
  let userSession: Session | null = null
  if (configParams) {
    userSession = await auth()
  }

  let config: ConfigType | undefined
  if (configParams) {
    try {
      config = await getEmbedConfig(configParams)
    } catch (e) {
      return (
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body className={inter.className}>
            <Error />
          </body>
        </html>
      )
    }
  }
  const favicon = config?.favicon
  const brandColors = parseBrandColors(config?.brand_colors || {})

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href={favicon ?? '/favicon.svg'} />
        <link rel="mask-icon" href={favicon ?? '/favicon.svg'} />
        <meta rel="x-brand-id" content={config?.subdomain} />
        {/* Add any other head elements here */}
      </head>
      <body
        className={inter.className}
        style={{
          ...brandColors,
          /* iOS Safari specific fixes */
          // WebkitOverflowScrolling: 'touch',
          position: 'fixed',
          width: '100%',
          height: '100%',
        }}>
        <SiteProviders config={config} session={userSession}>
          {children}
        </SiteProviders>
      </body>
    </html>
  )
}
