import type { NextRequest } from 'next/server'
import { NextResponse, userAgent } from 'next/server'
// import MobileDetect from 'mobile-detect'

export function middleware(request: NextRequest) {
  const parsedUA = userAgent(request)

  const deviceType = parsedUA.device.type
  if (deviceType) request.cookies.set('device_type', deviceType)

  const os = parsedUA.os.name
  if (os) request.cookies.set('os', os)

  const browserType = parsedUA.browser.name
  if (browserType) request.cookies.set('browser_type', browserType)

  request.headers.set('x-get-config', getConfig(request.url))

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

function getConfig(url: string): string {
  const obj = new URL('https://jaydeeph.begenuin.com')
  const arr = obj.host.split('.')
  if (['app', 'begenuin', 'localhost:4005'].includes(arr[0])) return ''

  if (!obj.host.includes('begenuin')) return JSON.stringify({ domain: obj.host })

  return JSON.stringify({ subdomain: arr[0] })
}
