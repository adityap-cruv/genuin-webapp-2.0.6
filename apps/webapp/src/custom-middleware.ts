import type { NextRequest } from 'next/server'
import { NextResponse, userAgent } from 'next/server'
import { getEmbedConfig } from './lib/api/config'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')

  if (request.nextUrl.pathname.startsWith('/sitemap') && host) {
    let config = null
    try {
      config = await getEmbedConfig(getConfig(host) ?? {})
      let pathParams: null | string | undefined = request.nextUrl.pathname
      pathParams = pathParams?.split('/').slice(2).join('/')
      return NextResponse.rewrite(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/${config?.brand_id ?? 'genuin'}/${request.headers.get(
          'host'
        )}/${pathParams}${request.nextUrl.search}`
      )
    } catch (e) {
      return NextResponse.error()
    }
  }

  if (request.nextUrl.pathname.startsWith('/robots.txt') && host) {
    let config = null
    try {
      config = await getEmbedConfig(getConfig(host) ?? {})
      let pathParams: null | string | undefined = request.nextUrl.pathname
      pathParams = pathParams?.split('/').slice(1).join('/')
      return NextResponse.rewrite(
        `${process.env.NEXT_PUBLIC_GO_API_URL}/${config?.brand_id ?? 'genuin'}/${request.headers.get(
          'host'
        )}/${pathParams}${request.nextUrl.search}`
      )
    } catch (e) {
      return NextResponse.error()
    }
  }

  if (request.nextUrl.pathname.endsWith('/apple-app-site-association') && host) {
    let config = null
    try {
      config = await getEmbedConfig(getConfig(host) ?? {})
      // TODO: this will be automated by go service just like sitemap
      // hard coding for buzz skyscape brand
      if (Number(config?.brand_id) === 2023) {
        return NextResponse.rewrite(new URL('/.well-known/skyscape/apple-app-site-association', request.url))
      }
    } catch (e) {
      return NextResponse.error()
    }
  }

  /*
   * .local tld domain handling for web-sdk dev work
   */
  const { device } = userAgent(request)
  const url = request.nextUrl
  const searchParams = url.searchParams

  // Do not continue if this is an api call or static file
  if (
    request.url.includes('/_next/') ||
    request.url.includes('/api/') ||
    request.url.includes('/fonts/') ||
    request.url.includes('/images/')
  ) {
    return NextResponse.next()
  }

  if (host) {
    const embReQStr = searchParams.get('_embedreq')
    const isSdk = searchParams.get('sdk')
    if ((embReQStr || isSdk) && device.type === 'mobile') {
      const pathname = device.vendor === 'Apple' ? url.pathname : '/m' + url.pathname
      url.pathname = pathname
      // const cleanUrl = removeQueryParams(url, ['_embedreq', 'sdk'])
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

/**
 * Get configuration object based on host info
 */
function getConfig(host: string): Record<string, any> | null {
  // if this is brand specific env fetch its config
  const isProduction = process.env.NODE_ENV === 'production'
  const isBegenuin = host.includes('begenuin.com')

  if (!isProduction && !isBegenuin) {
    const isLocal = host.includes('.local')
    const isTest = host.includes('test-')

    const hostname = isLocal
      ? host.replace('.local', '')
      : isTest
        ? host.replace('test-', '').replace('.begenuin.com', '')
        : host.replace('.begenuin.com', '')

    // if not test domain return null
    if (hostname === host) {
      return null
    }

    // check if there's subdomain or its root domain
    const hostParts = hostname.split('.')
    const brandStr = hostParts.length > 1 ? hostParts.shift() : hostname

    // we want the first part of host to be potentially brand so return
    // TODO: future enhancement -> allow multi subdomain depth brands
    // hbo.max.begenuin.com should be interpreted as max is the brand
    return {
      brandSlug: brandStr,
    }
  } else if (isBegenuin) {
    // get the brand name from subdomain (if there's one)
    const hostWithoutTLD = host.replace('.begenuin.com', '')
    const hostParts = hostWithoutTLD.split('.')
    const brand = hostParts.length > 1 ? hostParts.shift() : ''

    // if no brand but app then its primary app domain
    if (!brand && hostWithoutTLD === 'app') {
      return {
        brandSlug: 'genuin',
      }
    } else if (brand) {
      // check if its brand/env specific app domain
      const remainingHost = hostParts.join('.')

      // if format is brand.app.env.begenuin.com
      const envIdentifier = remainingHost.replace('app.', '')
      const isEnvApp = remainingHost.includes('app')
      const env = isEnvApp
        ? envIdentifier.toLowerCase() === 'qa'
          ? 'qa'
          : envIdentifier.toLowerCase() === 'staging'
            ? 'staging'
            : ''
        : ''

      return {
        brandSlug: brand,
        env,
        isApp: isEnvApp,
      }
    }
  }

  // fall back to just domain name
  const brandKey = host.replace('.local', '').replace('test-', '').replace('.begenuin.com', '')

  return {
    brandSlug: brandKey,
  }
}
