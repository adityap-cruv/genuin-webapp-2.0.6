/**
 * URL Parser Utility
 * Extracts URL information from the current page
 */

/**
 * URLParser provides utilities for parsing current page URL
 */
export class URLParser {
  /**
   * Get current full URL
   */
  static getCurrentURL(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.href
  }

  /**
   * Get current pathname
   */
  static getPath(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.pathname
  }

  /**
   * Get query parameters as object
   */
  static getQueryParams(): Record<string, string | string[]> {
    if (typeof window === 'undefined') {
      return {}
    }

    try {
      const params: Record<string, string | string[]> = {}
      const searchParams = new URLSearchParams(window.location.search)

      searchParams.forEach((value, key) => {
        // Check if key already exists
        if (key in params) {
          // Convert to array if not already
          if (Array.isArray(params[key])) {
            (params[key] as string[]).push(value)
          } else {
            params[key] = [params[key] as string, value]
          }
        } else {
          params[key] = value
        }
      })

      return params
    } catch (error) {
      console.error('[URLParser] Error parsing query params:', error)
      return {}
    }
  }

  /**
   * Get specific query parameter
   */
  static getQueryParam(key: string): string | string[] | undefined {
    return this.getQueryParams()[key]
  }

  /**
   * Get page title
   */
  static getTitle(): string {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return ''
    }
    return document.title
  }

  /**
   * Get hostname
   */
  static getHostname(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.hostname
  }

  /**
   * Get protocol
   */
  static getProtocol(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.protocol
  }

  /**
   * Get port
   */
  static getPort(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.port
  }

  /**
   * Get hash (without #)
   */
  static getHash(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.hash.replace(/^#/, '')
  }

  /**
   * Get referrer
   */
  static getReferrer(): string {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return ''
    }
    return document.referrer
  }

  /**
   * Get origin
   */
  static getOrigin(): string {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.origin
  }

  /**
   * Parse a URL string
   */
  static parse(url: string): {
    protocol?: string
    hostname?: string
    port?: string
    pathname?: string
    search?: string
    hash?: string
    queryParams?: Record<string, string | string[]>
  } {
    try {
      const urlObj = new URL(url)
      const params: Record<string, string | string[]> = {}
      const searchParams = new URLSearchParams(urlObj.search)

      searchParams.forEach((value, key) => {
        if (key in params) {
          if (Array.isArray(params[key])) {
            (params[key] as string[]).push(value)
          } else {
            params[key] = [params[key] as string, value]
          }
        } else {
          params[key] = value
        }
      })

      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash.replace(/^#/, ''),
        queryParams: params,
      }
    } catch (error) {
      console.error('[URLParser] Error parsing URL:', error)
      return {}
    }
  }
}
