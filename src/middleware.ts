import type { NextRequest } from 'next/server'
import { NextResponse, userAgent } from 'next/server'
import MobileDetect from 'mobile-detect'

export function middleware(request: NextRequest) {
  // detects if it's mobile or not
  const isMobile = Boolean(new MobileDetect(userAgent(request).ua).phone)
  request.cookies.set('mobile', '' + isMobile)
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
