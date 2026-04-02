/**
 * Enrichment Middleware
 * Automatically enriches events with computed fields
 */

import type { Middleware } from '../types/middleware'
import { BrowserDetector, DeviceDetector, URLParser, SessionManager, DeviceIdManager } from '../utils'

/**
 * Enrichment options
 */
export interface EnrichmentOptions {
  /**
   * Add session information
   * @default true
   */
  addSession?: boolean

  /**
   * Add device ID
   * @default true
   */
  addDeviceId?: boolean

  /**
   * Add page context
   * @default true
   */
  addPageContext?: boolean

  /**
   * Add device context
   * @default true
   */
  addDeviceContext?: boolean

  /**
   * Use iframe-aware device ID
   * @default false
   */
  iframeAware?: boolean
}

/**
 * Creates enrichment middleware that adds computed fields to events
 */
export function createEnrichmentMiddleware(options: EnrichmentOptions = {}): Middleware {
  const {
    addSession = true,
    addDeviceId = true,
    addPageContext = true,
    addDeviceContext = true,
    iframeAware = false,
  } = options

  return async (event, next, _context) => {
    // Add session information
    if (addSession) {
      const session = SessionManager.getSession()
      event.context = event.context || {}
      event.context.session = {
        sessionId: session.sessionId,
        startTime: session.startTime,
        lastActivityTime: session.lastActivityTime,
        isNewSession: SessionManager.isNewSession(),
      }
    }

    // Add device ID
    if (addDeviceId) {
      const deviceId = iframeAware
        ? DeviceIdManager.getDeviceIdIframeAware()
        : DeviceIdManager.getDeviceId()

      event.payload.device_id = event.payload.device_id || deviceId
    }

    // Add page context
    if (addPageContext) {
      event.context = event.context || {}
      event.context.page = {
        url: URLParser.getCurrentURL(),
        path: URLParser.getPath(),
        title: URLParser.getTitle(),
        referrer: URLParser.getReferrer(),
        queryParams: URLParser.getQueryParams(),
      }
    }

    // Add device context
    if (addDeviceContext) {
      const deviceInfo = DeviceDetector.detect()
      const osInfo = DeviceDetector.getOS()
      const browserInfo = BrowserDetector.detect()

      event.context = event.context || {}
      event.context.device = {
        type: deviceInfo.type,
        model: deviceInfo.model,
        browser: {
          name: browserInfo.name,
          version: browserInfo.version,
        },
        os: {
          name: osInfo.name,
          version: osInfo.version,
        },
      }
    }

    // Continue to next middleware
    await next()
  }
}

/**
 * Default enrichment middleware with all options enabled
 */
export const enrichmentMiddleware = createEnrichmentMiddleware()
