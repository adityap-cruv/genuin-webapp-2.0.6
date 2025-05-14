import { type ConfigType } from '@lib/stores/genuin-options'
import { checkAndAppendHttps } from '@lib/utils'
import { headers } from 'next/headers'
import { permanentRedirect } from 'next/navigation'

export function RedirectHandler({
  children,
  config,
  shouldRedirect = false,
}: {
  children: React.ReactNode
  config?: ConfigType
  shouldRedirect: boolean
}) {
  if (config && Object.keys(config).length === 0) {
    permanentRedirect('/inactive')
  }
  if (config) {
    if (config?.integrations.white_label.enable && config?.integrations.white_label.allowed_domains[0]) {
      if (shouldRedirect) {
        const searchParamStr = headers().get('x-search-params')
        const pathParamStr = headers().get('x-path-params')
        permanentRedirect(
          checkAndAppendHttps(config.integrations.white_label.allowed_domains[0]) + pathParamStr + searchParamStr
        )
      }
    } else {
      // Skip auth check if running on localhost or if loaded in an iframe from BCC_URL
      const host = headers().get('host') ?? ''
      const referer = headers().get('referer') ?? ''
      const secFetchDest = headers().get('sec-fetch-dest') ?? ''
      const bccUrl = process.env.NEXT_PUBLIC_BCC_URL || 'https://brands.qa.begenuin.com'

      // Check if the app is running locally, is embedded in an iframe from BCC_URL,
      // or explicitly has the sec-fetch-dest header set to 'iframe'
      if (
        host.includes('localhost') ||
        host.includes('127.0.0.1') ||
        host.startsWith('192.168.') ||
        (secFetchDest === 'iframe' && referer && referer.includes(bccUrl))
      ) {
        return children
      }

      if (config && config?.brand_id.toString() === '99') {
        // Skip auth check for the begenuin brand
        return children
      }

      if (config) {
        // Skip auth check for the auth-wall page itself to avoid redirect loops
        const pathParamStr = headers().get('x-path-params') ?? ''
        if (pathParamStr === '/auth-wall' || pathParamStr === '/dlk/') {
          return children
        }

        // Check if this is a return from Google auth (contains provider=google and code parameters)
        const searchParams = headers().get('x-search-params') ?? ''
        if (
          (searchParams.includes('provider=google') && searchParams.includes('code=')) ||
          (searchParams.includes('provider=apple') && searchParams.includes('code=')) ||
          (searchParams.includes('provider=auth') && searchParams.includes('code='))
        ) {
          // This is a auth callback, allow access without checking session
          // The session will be established during the callback processing
          // Detected auth callback, allowing access
          return children
        }

        // Check if user is authenticated with our custom auth wall
        const cookieHeader = headers().get('cookie') ?? ''
        let hasAuthCookie = false

        if (cookieHeader) {
          // Just check if the secure cookie exists at all
          // The actual value is a hash that we don't need to verify here
          // Since it's HTTP-only, if it exists, it means it was set by our server
          const authCookie = cookieHeader
            .split(';')
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith('gn_bx_acc='))

          hasAuthCookie = !!authCookie
        }

        // If not authenticated, redirect to auth wall
        if (!hasAuthCookie) {
          // Store the intended destination URL to redirect back after authentication
          const currentPath = pathParamStr
          const searchParams = headers().get('x-search-params') ?? ''
          const destinationUrl = currentPath + searchParams

          // Redirect to auth wall with the return URL as a parameter
          permanentRedirect(`/auth-wall?returnUrl=${encodeURIComponent(destinationUrl)}`)
        }
      }
    }
  }

  return children
}
