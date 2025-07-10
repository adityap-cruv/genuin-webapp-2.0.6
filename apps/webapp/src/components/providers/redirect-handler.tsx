import { type ConfigType } from '@lib/stores/genuin-options'
import { checkAndAppendHttps } from '@lib/utils'
import { headers } from 'next/headers'
import { permanentRedirect } from 'next/navigation'
import type { ReactNode } from 'react'

export async function RedirectHandler({
  children,
  config,
  shouldRedirect = false,
}: {
  children: ReactNode
  config?: ConfigType
  shouldRedirect: boolean
}) {
  if (config && Object.keys(config).length === 0) {
    permanentRedirect('/inactive')
  }
  const headersList = await headers()
  if (config) {
    if (config?.integrations.white_label.enable && config?.integrations.white_label.allowed_domains[0]) {
      const searchParamStr = headersList.get('x-search-params')
      const pathParamStr = headersList.get('x-path-params')
      // Special case for brand_id 2357 (ted), redirect to the specific domain as per the client request
      // Convert path params to query string for this special case
      // Always start with utm_source=shorts
      // **NOTE**: This is a special case for ted.com, where we need to handle the path and search params differently
      //  reason to pass all the details in query param is to consume it on our ted.com embed
      if (config.brand_id.toString() === '2357') {
        // only allow these pages for redirection, allow rest of the pages to go through
        const whitelistPaths = [
          '/home',
          '/popular',
          '/latest',
          '/explore',
          '/group',
          '/community',
          '/brand',
          '/profile',
          '/video',
        ]
        // for these paths we will add the path as a query param to consumed on ted.com, which will be added as trend
        // and will be used to show the correct feed home, latest, popular etc. content on ted.com if our
        // embed is integrated
        const trendWhitelistPaths = ['/home', '/popular', '/latest']
        // Check if pathParamStr starts with any whitelisted path (with or without trailing slash)
        const isWhitelisted = whitelistPaths.some(
          (base) => pathParamStr && pathParamStr.replace(/\/$/, '').startsWith(base)
        )
        if (pathParamStr && !isWhitelisted) {
          return children
        }
        const queryParts = ['utm_source=shorts']

        // If pathParamStr is present and not just '/', add as path param
        if (pathParamStr && pathParamStr !== '/') {
          // Remove leading and trailing slashes
          const cleanPath = pathParamStr.replace(/^\/|\/$/g, '')
          // If path is in trendWhitelistPaths, add as "trend" param
          if (trendWhitelistPaths.includes('/' + cleanPath)) {
            queryParts.push(`trend=${encodeURIComponent(cleanPath)}`)
          } else {
            // Split by '/' and process as key/value pairs
            const segments = cleanPath.split('/')
            for (let i = 0; i < segments.length - 1; i += 2) {
              const key = segments[i]
              const value = segments[i + 1]
              if (key && value) {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
              }
            }
          }
        }

        // If searchParamStr is present, append its params (without leading '?')
        if (searchParamStr) {
          const search = searchParamStr.startsWith('?') ? searchParamStr.slice(1) : searchParamStr
          if (search) {
            queryParts.push(search)
          }
        }

        // Join all parts with '&' and prepend '?'
        const finalQuery = '?' + queryParts.join('&')
        return permanentRedirect(checkAndAppendHttps('https://ted.com') + finalQuery)
      }
      if (shouldRedirect) {
        permanentRedirect(
          checkAndAppendHttps(config.integrations.white_label.allowed_domains[0]) + pathParamStr + searchParamStr
        )
      }
    } else {
      // Skip auth check if running on localhost or if loaded in an iframe from BCC_URL
      const host = headersList.get('host') ?? ''
      const referer = headersList.get('referer') ?? ''
      const secFetchDest = headersList.get('sec-fetch-dest') ?? ''
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
        // Skip auth check for the dlk page itself to avoid redirect loops
        const pathParamStr = headersList.get('x-path-params') ?? ''
        if (pathParamStr === '/dlk/') {
          return children
        }

        // Check if this is a return from Google auth (contains provider=google and code parameters)
        const searchParams = headersList.get('x-search-params') ?? ''
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
        const cookieHeader = headersList.get('cookie') ?? ''
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

        // Special logic for /auth-wall: if already authenticated, redirect to returnUrl or /home
        if (pathParamStr === '/auth-wall') {
          if (hasAuthCookie) {
            const searchParams = headersList.get('x-search-params') ?? ''
            // Try to extract returnUrl from searchParams
            let returnUrl = '/home'
            const match = searchParams.match(/returnUrl=([^&]*)/)
            if (match?.[1]) {
              try {
                returnUrl = decodeURIComponent(match[1])
              } catch (error) {
                console.error('[RedirectHandler] Error decoding returnUrl:', error)
              }
            }
            permanentRedirect(returnUrl)
          } else {
            console.log('[RedirectHandler] No auth cookie, showing auth wall')
            return children
          }
        }

        // If not authenticated, redirect to auth wall
        if (!hasAuthCookie) {
          // Store the intended destination URL to redirect back after authentication
          const currentPath = pathParamStr
          const searchParams = headersList.get('x-search-params') ?? ''
          const destinationUrl = currentPath + searchParams

          // Redirect to auth wall with the return URL as a parameter
          permanentRedirect(`/auth-wall?returnUrl=${encodeURIComponent(destinationUrl)}`)
        }
      }
    }
  }

  return await children
}
