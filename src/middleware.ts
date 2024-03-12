import type { NextRequest } from 'next/server'
import { NextResponse, userAgent } from 'next/server'

export async function middleware(request: NextRequest) {
  const STATIC_PATHNAMES = ['/', '/manage', '/market', '/pricing', '/privacy', '/terms', '/verify-email']
  const parsedUA = userAgent(request)
  const deviceType = parsedUA.device.type
  if (deviceType) request.cookies.set('device_type', deviceType)

  const os = parsedUA.os.name
  if (os) request.cookies.set('os', os)

  request.headers.set('x-search-params', request.nextUrl.search)
  request.headers.set('x-path-params', request.nextUrl.pathname)

  // console.log('config params::', getConfig('ankpal.com'))

  const browserType = parsedUA.browser.name
  if (browserType) request.cookies.set('browser_type', browserType)

  const host = request.headers.get('host')
  if (host) {
    const config = getConfig(host)
    request.cookies.set('config_params', JSON.stringify(config))
    const urlObj = new URL(request.url)
    // eslint-disable-next-line no-prototype-builtins
    if (config && STATIC_PATHNAMES.includes(urlObj.pathname)) {
      urlObj.pathname = '/home'
      return NextResponse.redirect(urlObj)
    }
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|fonts).*)',
  ],
}

function getConfig(host: string) {
  const arr = host.split('.')
  if (['app', 'begenuin', 'localhost:4005'].includes(arr[0])) return ''

  if (!host.includes('begenuin')) return { domain: host }

  return { subdomain: arr[0] }
}
