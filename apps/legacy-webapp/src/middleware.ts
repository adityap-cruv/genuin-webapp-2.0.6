import { auth } from '../auth'
import type { NextRequest } from 'next/server'
import { NextResponse, userAgent } from 'next/server'
import { getEmbedConfig } from './lib/api/config'

// Export the auth middleware
export { auth }

// Export middleware configuration using the updated format for Next.js 15
// This replaces the deprecated export const config = { ... }
export const matcher = ['/((?!api|_next/static|_next/image|favicon.ico).*)']

/**
 * Gets the effective host to use, checking for an override in environment variables
 * @param requestHost The host from the current request
 * @returns The host to use (either the override or the original)
 */
function getEffectiveHost(requestHost: string): string {
  const overrideHost = process.env.MIDDLEWARE_OVERRIDE_HOST
  return overrideHost && overrideHost.trim() !== '' ? overrideHost : requestHost
}

// Constants for path handlers
const PATH_HANDLERS: Record<string, { headerKey: string; pathParamsSlice: number }> = {
  // Specific sitemap patterns
  '/sitemap/index.xml': {
    headerKey: 'x-sitemap-index-api-url',
    pathParamsSlice: 2, // Keep "index.xml"
  },
  '/sitemap/static/index.xml': {
    headerKey: 'x-sitemap-static-api-url',
    pathParamsSlice: 2, // Keep "static/index.xml"
  },
  '/sitemap/community/index.xml': {
    headerKey: 'x-sitemap-community-api-url',
    pathParamsSlice: 2, // Keep "community/index.xml"
  },
  '/sitemap/group/index.xml': {
    headerKey: 'x-sitemap-group-api-url',
    pathParamsSlice: 2, // Keep "group/index.xml"
  },
  '/sitemap/user/index.xml': {
    headerKey: 'x-sitemap-user-api-url',
    pathParamsSlice: 2, // Keep "user/index.xml"
  },
  '/sitemap/video/index.xml': {
    headerKey: 'x-sitemap-video-api-url',
    pathParamsSlice: 2, // Keep "video/index.xml"
  },
  // General sitemap handler (catch-all for other sitemap paths)
  '/sitemap': {
    headerKey: 'x-sitemap-api-url',
    pathParamsSlice: 1, // Keep the full path after /sitemap
  },
  '/robots.txt': {
    headerKey: 'x-robots-api-url',
    pathParamsSlice: 1, // Remove first segment (/robots.txt)
  },
  '/.well-known/assetlinks.json': {
    headerKey: 'x-assetlinks-api-url',
    pathParamsSlice: 1, // Remove first segment (/.well-known/...)
  },
  '/.well-known/apple-app-site-association': {
    headerKey: 'x-apple-app-site-association-api-url',
    pathParamsSlice: 1, // Remove first segment (/.well-known/...)
  },
}

/**
 * Handles API rewrites for specific paths
 */
async function handleApiRewrite(request: NextRequest, path: string, host: string): Promise<NextResponse> {
  const handler = PATH_HANDLERS[path]
  if (!handler) return NextResponse.next({ request })

  try {
    // IMPORTANT: Do not modify this line - it ensures correct host resolution
    // for API routing across all environments (local, QA, prod)
    // if you want to test it on local follow README.md to create a local env
    // and set the MIDDLEWARE_OVERRIDE_HOST env variable to your appropriate brand
    const effectiveHost = getEffectiveHost(host)
    const config = await getEmbedConfig(getConfig(effectiveHost) ?? {})
    let pathParams: string | null | undefined = request.nextUrl.pathname
    pathParams = pathParams?.split('/').slice(handler.pathParamsSlice).join('/')

    // Create a server-side fetch to the API
    const apiUrl = `${process.env.NEXT_PUBLIC_GO_API_URL}/${
      config?.brand_id ?? 'genuin'
    }/${effectiveHost}/${pathParams}${request.nextUrl.search}`

    // Clone the request URL but preserve the original path
    const url = new URL(request.nextUrl)

    // Add a special header to indicate this is a rewrite
    request.headers.set(handler.headerKey, apiUrl)

    // Use NextResponse.rewrite with the original URL to prevent visible redirection
    return NextResponse.rewrite(url, {
      request: {
        headers: request.headers,
      },
    })
  } catch (e) {
    // For .well-known or sitemap paths, return next() to allow route handler to provide fallback
    if (path.includes('.well-known') || path.includes('sitemap')) {
      return NextResponse.next({ request })
    }

    // Create a NextResponse error instead of using NextResponse.error()
    return new NextResponse(null, { status: 500 })
  }
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  if (!host) return NextResponse.next({ request })

  // Check for special path handlers
  // Sort paths by length (descending) to ensure more specific paths are matched first
  const paths = Object.keys(PATH_HANDLERS).sort((a, b) => b.length - a.length)
  for (const path of paths) {
    if (request.nextUrl.pathname.startsWith(path)) {
      return await handleApiRewrite(request, path, host)
    }
  }

  // Process user agent and set cookies
  await processUserAgent(request)

  // Handle subdomain routing
  const subdomainResponse = await handleSubdomainRouting(request, host)
  if (subdomainResponse) return subdomainResponse

  return NextResponse.next({ request })
}

/**
 * Process the user agent information and set cookies and headers
 */
async function processUserAgent(request: NextRequest): Promise<void> {
  const parsedUA = userAgent(request)

  // Set device type cookie - check params first, fallback to UA
  const deviceTypeParam = request.nextUrl.searchParams.get('device_type')
  const deviceType = deviceTypeParam ?? parsedUA.device.type
  if (deviceType) request.cookies.set('device_type', deviceType)

  // Set OS cookie
  const os = parsedUA.os.name
  if (os) request.cookies.set('os', os)

  // Set browser type cookie
  const browserType = parsedUA.browser.name
  if (browserType) request.cookies.set('browser_type', browserType)

  // Set path and search params as headers
  request.headers.set('x-search-params', request.nextUrl.search)
  request.headers.set('x-path-params', request.nextUrl.pathname)
}

/**
 * Handle subdomain-specific routing rules
 */
async function handleSubdomainRouting(request: NextRequest, host: string): Promise<NextResponse | null> {
  const STATIC_PATHNAMES = ['/', '/manage', '/market', '/pricing', '/privacy', '/terms', '/discover']

  // Use the effective host, which checks for override in environment variables
  const effectiveHost = getEffectiveHost(host)
  const config = getConfig(effectiveHost)

  if (config) {
    request.cookies.set('config_params', JSON.stringify(config))
    const urlObj = new URL(request.url)

    // Redirect non-app subdomains from static paths to /home
    if (config.subdomain !== 'app' && STATIC_PATHNAMES.includes(urlObj.pathname)) {
      urlObj.pathname = '/home'
      return NextResponse.redirect(urlObj.href)
    }
  }

  return null
}

/**
 * Get config from the host name
 * @param host The hostname from the request
 * @returns Configuration object with domain or subdomain information
 */
export function getConfig(host: string): { domain?: string; subdomain?: string } | null {
  // Special cases for localhost and other development environments
  const firstSegment = host.split('.')[0]
  if (['localhost:4005', 'www', '192'].includes(firstSegment)) {
    return { subdomain: 'app' }
  }

  // External domains
  if (!host.includes('begenuin')) {
    return { domain: host }
  }

  // Handle begenuin subdomains based on environment
  const isDevEnvironment =
    process.env.NEXT_PUBLIC_CURRENT_ENV === 'local' || process.env.NEXT_PUBLIC_CURRENT_ENV === 'qa'
  const subdomain = isDevEnvironment ? host.replace('.qa.begenuin.com', '') : host.replace('.begenuin.com', '')

  // Special case for root domain
  if (subdomain === 'begenuin.com') {
    return { subdomain: 'app' }
  }

  return { subdomain }
}
