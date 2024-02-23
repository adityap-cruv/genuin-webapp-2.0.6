import type { NextRequest } from 'next/server'
import { NextResponse, userAgent } from 'next/server'
// import MobileDetect from 'mobile-detect'

export function middleware(request: NextRequest) {
  const parsedUA = userAgent(request)
  // console.log('::Referrer::', request.referrer)
  // console.log('::Referrer Policy::', request.referrerPolicy)
  console.log('::header::', request.headers.get('host'))
  console.log('::forwarded headers::', request.headers.get('x-forwarded-host'))
  console.log('::string headers::', JSON.stringify(request.headers))
  console.log('::request object::', JSON.stringify(request))
  const deviceType = parsedUA.device.type
  if (deviceType) request.cookies.set('device_type', deviceType)

  const os = parsedUA.os.name
  if (os) request.cookies.set('os', os)

  const host = request.headers.get('host')
  if (host) request.cookies.set('host_name', host)

  const browserType = parsedUA.browser.name
  if (browserType) request.cookies.set('browser_type', browserType)
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
