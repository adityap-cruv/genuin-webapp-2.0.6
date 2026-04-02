/**
 * Browser Detection Utility
 * Detects browser information using ua-parser-js
 */

import { UAParser } from 'ua-parser-js'

export interface BrowserInfo {
  name?: string
  version?: string
  major?: string
}

/**
 * BrowserDetector provides browser detection utilities
 */
export class BrowserDetector {
  private static parser: UAParser | null = null

  /**
   * Get parser instance (singleton)
   */
  private static getParser(): UAParser {
    if (!this.parser) {
      this.parser = new UAParser()
    }
    return this.parser
  }

  /**
   * Detect browser information
   */
  static detect(): BrowserInfo {
    if (typeof window === 'undefined') {
      return {}
    }

    try {
      const parser = this.getParser()
      const result = parser.getResult()
      return result.browser || {}
    } catch (error) {
      console.error('[BrowserDetector] Error detecting browser:', error)
      return {}
    }
  }

  /**
   * Get browser name
   */
  static getName(): string | undefined {
    return this.detect().name
  }

  /**
   * Get browser version
   */
  static getVersion(): string | undefined {
    return this.detect().version
  }

  /**
   * Get browser major version
   */
  static getMajorVersion(): string | undefined {
    return this.detect().major
  }

  /**
   * Check if running in specific browser
   */
  static is(browserName: string): boolean {
    const name = this.getName()
    return name?.toLowerCase() === browserName.toLowerCase()
  }

  /**
   * Check if running in Chrome
   */
  static isChrome(): boolean {
    return this.is('Chrome')
  }

  /**
   * Check if running in Firefox
   */
  static isFirefox(): boolean {
    return this.is('Firefox')
  }

  /**
   * Check if running in Safari
   */
  static isSafari(): boolean {
    return this.is('Safari')
  }

  /**
   * Check if running in Edge
   */
  static isEdge(): boolean {
    return this.is('Edge')
  }
}
