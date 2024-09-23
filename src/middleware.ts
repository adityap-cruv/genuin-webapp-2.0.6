import NextAuth from 'next-auth'
import type { NextRequest } from 'next/server'
import { NextResponse, userAgent } from 'next/server'
import { authConfig } from '../auth.config'
import { getEmbedConfig } from './lib/api/config'

export default NextAuth(authConfig).auth

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')

  if ((request.nextUrl.pathname.startsWith('/sitemap') || request.nextUrl.pathname.startsWith('/robots.txt')) && host) {
    let config = null
    try {
      config = await getEmbedConfig(getConfig(host) ?? {})
      let pathParams: null | string | undefined = request.nextUrl.pathname
      pathParams = pathParams?.split('/').slice(2).join('/')
      return NextResponse.rewrite(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/${config?.brand_id}/${request.headers.get('host')}/${pathParams}${
          request.nextUrl.search
        }`
      )
    } catch (e) {
      return NextResponse.error()
    }
  }

  const STATIC_PATHNAMES = ['/', '/manage', '/market', '/pricing', '/privacy', '/terms', '/discover']
  const parsedUA = userAgent(request)
  const deviceType = parsedUA.device.type
  if (deviceType) request.cookies.set('device_type', deviceType)

  const os = parsedUA.os.name
  if (os) request.cookies.set('os', os)

  request.headers.set('x-search-params', request.nextUrl.search)
  request.headers.set('x-path-params', request.nextUrl.pathname)

  const browserType = parsedUA.browser.name
  if (browserType) request.cookies.set('browser_type', browserType)

  if (host) {
    const config = getConfig(host)
    // const config = getConfig('ankpal.qa.begenuin.com')
    if (config) request.cookies.set('config_params', JSON.stringify(config))
    const urlObj = new URL(request.url)
    // eslint-disable-next-line no-prototype-builtins
    if (config && STATIC_PATHNAMES.includes(urlObj.pathname)) {
      urlObj.pathname = '/home'
      return NextResponse.redirect(urlObj.href)
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

export function getConfig(host: string): { domain?: string; subdomain?: string } | null {
  if (['app', 'begenuin', 'localhost:4005', 'www', '192'].includes(host.split('.')[0])) return null

  if (!host.includes('begenuin')) return { domain: host }
  const subdomain =
    process.env.NEXT_PUBLIC_CURRENT_ENV === 'local' || process.env.NEXT_PUBLIC_CURRENT_ENV === 'qa'
      ? host.replace('.qa.begenuin.com', '')
      : host.replace('.begenuin.com', '')
  return { subdomain }
}
