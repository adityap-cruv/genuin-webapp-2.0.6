import React, { createContext, useContext, useEffect } from 'react'
import { UAParser } from 'ua-parser-js'
import keyParamMapping from './keyParamMapping.json'
// Add types for class properties and methods
type BaseResolverConfig = {
  keyParamMapping: Record<string, any>
}

type DeviceResolverConfig = BaseResolverConfig & {
  instance?: DeviceResolver
  uaParserResult: UAParser.IResult
  resolvers: Record<string, () => void | Promise<void>>
}

type SiteResolverConfig = BaseResolverConfig & {
  instance?: SiteResolver
  config: Record<string, any>
  resolvers: Record<string, () => void | Promise<void>>
}

type UserResolverConfig = BaseResolverConfig & {
  instance?: UserResolver
  config: Record<string, any>
  resolvers: Record<string, () => void | Promise<void>>
}

type MainResolverConfig = {
  deviceResolver: DeviceResolver
  siteResolver: SiteResolver
  userResolver: UserResolver
}

// Base Resolver class
class BaseResolver implements BaseResolverConfig {
  keyParamMapping: Record<string, any>
  private static publisherName: string = 'begenuin'

  constructor() {
    // Initialize an empty object to store key-param mappings
    this.keyParamMapping = keyParamMapping
  }

  static setPublisherName(name: string): void {
    BaseResolver.publisherName = name
  }

  protected getPublisherName(): string {
    return BaseResolver.publisherName
  }

  /**
   * Sets a value in the keyParamMapping object based on a dot-notation key path
   * @param {string} keyPath - Dot-notation path to the key (e.g., 'device.os')
   * @param {any} value - Value to be set
   *
   * @description
   * This method sets the value for a specific key in the keyParamMapping object.
   * The keyPath is a dot-notation string that specifies the path to the key.
   * This is used to map the resolved values to the appropriate keys as per the OpenRTB specification.
   *
   * @example
   * // Sets the device operating system to 'iOS'
   * setKeyValue('device.os', 'iOS')
   */
  setKeyValue(keyPath: string, value: any): void {
    const keys = keyPath.split('.')
    let current = this.keyParamMapping
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {}
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = {
      value,
      param: current[keys[keys.length - 1]]?.param,
      macros: current[keys[keys.length - 1]]?.macros,
    }
  }

  /**
   * Handles errors by logging them and setting an 'Unknown' value for the given key path
   * @param {string} keyPath - Dot-notation path to the key where the error occurred
   * @param {Error} error - The error that occurred
   *
   * @description
   * This method handles any errors that occur during the resolution process.
   * It logs the error and sets the value for the specified keyPath to 'Unknown'.
   * This ensures that the keyParamMapping object is always populated, even if an error occurs.
   *
   * @example
   * // Logs an error and sets the device operating system to 'Unknown'
   * handleError('device.os', new Error('Failed to resolve OS'))
   */
  handleError(keyPath: string, error: Error): void {
    console.error(`Error resolving ${keyPath}:`, error.message)
    this.setKeyValue(keyPath, 'Unknown')
  }

  /**
   * Safely executes a function and handles any errors that occur
   * @param {string} keyPath - Dot-notation path to the key being resolved
   * @param {Function} func - The function to be executed
   *
   * @description
   * This method safely executes a resolver function and handles any errors that occur.
   * It ensures that the resolver function is executed within a try-catch block.
   * If an error occurs, it is handled by the handleError method.
   *
   * @example
   * // Safely executes the resolveOS function
   * safeExecute('device.os', resolveOS)
   */
  async safeExecute(
    keyPath: string,
    func: () => void | Promise<void>,
  ): Promise<void> {
    try {
      await func()
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.handleError(keyPath, error)
      } else {
        this.handleError(keyPath, new Error(String(error)))
      }
    }
  }

  /**
   * Extracts information from the user agent string based on a given regex
   * @param {RegExp} regex - Regular expression to match against the user agent string
   * @returns {string} - Matched information or 'Unknown' if no match found
   *
   * @description
   * This method extracts information from the user agent string using a regular expression.
   * It is used to resolve various device properties such as operating system and browser.
   * The extracted information is used to populate the keyParamMapping object as per the OpenRTB specification.
   *
   * @example
   * // Extracts the operating system from the user agent string
   * const os = getFromUserAgent(/(Windows|Mac OS X|Android|iOS|Linux)/i)
   */
  getFromUserAgent(regex: RegExp): string {
    const match = navigator.userAgent.match(regex)
    return match ? match[1] : 'Unknown'
  }
}

/**
 * DeviceResolver class to resolve various device properties
 * @class
 * @extends BaseResolver
 * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
 */
class DeviceResolver extends BaseResolver implements DeviceResolverConfig {
  static instance?: DeviceResolver
  uaParserResult!: UAParser.IResult
  resolvers!: Record<string, () => void | Promise<void>>

  constructor() {
    super()
    // Implement Singleton pattern
    if (DeviceResolver.instance) {
      return DeviceResolver.instance
    }
    DeviceResolver.instance = this
    // Initialize UAParser and store the result
    this.uaParserResult = new UAParser().getResult()

    // Define resolvers for various device properties
    this.resolvers = {
      ua: this.resolveUA.bind(this),
      devicetype: this.resolveDeviceType.bind(this),
      pxratio: this.resolvePxRatio.bind(this),
      dimensions: this.resolveDimensions.bind(this),
      js: this.resolveJS.bind(this),
      language: this.resolveLanguage.bind(this),
      connectiontype: this.resolveConnectionType.bind(this),
      make: this.resolveMake.bind(this),
      model: this.resolveModel.bind(this),
      os: this.resolveOS.bind(this),
      geolocation: this.resolveGeolocation.bind(this),
      geofetch: this.resolveGeofetch.bind(this),
      ppi: this.resolvePPI.bind(this),
      flashver: this.resolveFlashVersion.bind(this),
      lmt: this.resolveLMT.bind(this),
      dnt: this.resolveDNT.bind(this),
    }
  }

  // Resolver methods

  /**
   * Resolves and sets the user agent string
   * @description
   * This method sets the `device.ua` field as per OpenRTB specification section 3.2.18.
   * The user agent string is used to identify the browser and operating system.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveUA() {
    this.setKeyValue('device.ua', navigator.userAgent)
  }

  /**
   * Determines and sets the device type based on the user agent string
   * @description
   * This method sets the `device.devicetype` field as per OpenRTB specification section 3.2.18.
   * The device type is determined using regex patterns and mapped to OpenRTB values.
   * Values:
   * - 0: Unknown
   * - 2: Personal Computers
   * - 3: Connected TV
   * - 4: Phone
   * - 5: Tablet
   * - 6: Connected Device
   * - 7: Set Top Box
   * - 8: Digital Signage
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveDeviceType() {
    const ua = navigator.userAgent.toLowerCase()
    const types = [
      { regex: /tablet|ipad/, value: 5 },
      { regex: /mobi/, value: 4 },
      { regex: /smart[-\s]?tv|appletv|googletv|hbbtv/, value: 3 },
      { regex: /desktop|mac|windows|linux/, value: 2 },
      { regex: /set[-\s]?top|xbox|roku|firetv/, value: 7 },
      { regex: /iot|fridge|thermostat|wear/, value: 6 },
      { regex: /digital[-\s]?signage|billboard|ooh/, value: 8 },
    ]
    const deviceType = types.find((type) => type.regex.test(ua))?.value ?? 0
    this.setKeyValue('device.devicetype', deviceType)
  }

  /**
   * Resolves and sets the device pixel ratio
   * @description
   * This method sets the `device.pxratio` field as per OpenRTB specification section 3.2.18.
   * The pixel ratio is used to determine the device's screen density.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolvePxRatio() {
    this.setKeyValue(
      'device.pxratio',
      parseFloat(window.devicePixelRatio.toFixed(2)) || 1.0,
    )
  }

  /**
   * Resolves and sets the screen dimensions
   * @description
   * This method sets the `device.h` and `device.w` fields as per OpenRTB specification section 3.2.18.
   * The screen dimensions are used to determine the height and width of the device screen.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveDimensions() {
    this.setKeyValue('device.h', window.screen.height)
    this.setKeyValue('device.w', window.screen.width)
  }

  /**
   * Sets the JavaScript support flag
   * @description
   * This method sets the `device.js` field as per OpenRTB specification section 3.2.18.
   * The JavaScript support flag indicates whether the device supports JavaScript.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveJS() {
    this.setKeyValue('device.js', 1)
  }

  /**
   * Resolves and sets the device language
   * @description
   * This method sets the `device.language` field as per OpenRTB specification section 3.2.18.
   * The language is determined from the browser's language settings.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveLanguage() {
    this.setKeyValue('device.language', navigator.language)
  }

  /**
   * Determines and sets the connection type
   * @description
   * This method sets the `device.connectiontype` field as per OpenRTB specification section 3.2.18.
   * The connection type is determined using the Network Information API.
   * Values:
   * - 1: Ethernet
   * - 2: WiFi
   * - 3: Cellular Network - Unknown Generation
   * - 4: Cellular Network - 2G
   * - 5: Cellular Network - 3G
   * - 6: Cellular Network - 4G
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveConnectionType(): void {
    const conn = (navigator as any).connection
    const types: Record<string, number> = {
      '4g': 6,
      '3g': 5,
      '2g': 4,
      'slow-2g': 3,
      wifi: 2,
      ethernet: 1,
    }
    this.setKeyValue(
      'device.connectiontype',
      conn ? types[conn.effectiveType] || 3 : 3,
    )
  }

  /**
   * Determines and sets the device make
   * @description
   * This method sets the `device.make` field as per OpenRTB specification section 3.2.18.
   * The device make is determined using known manufacturer names in the user agent string.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveMake() {
    const deviceVendor = this.uaParserResult.device?.vendor || 'Unknown'
    this.setKeyValue('device.make', deviceVendor)
  }

  /**
   * Determines and sets the device model
   * @description
   * This method sets the `device.model` field as per OpenRTB specification section 3.2.18.
   * The device model is determined using known model names in the user agent string.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveModel() {
    const deviceModel = this.uaParserResult.device?.model || 'Unknown'
    this.setKeyValue('device.model', deviceModel)
  }

  /**
   * Resolves and sets the operating system and its version
   * @description
   * This method sets the `device.os` and `device.osv` fields as per OpenRTB specification section 3.2.18.
   * The operating system and its version are determined using regex patterns on the user agent string.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveOS() {
    this.setKeyValue('device.os', this.uaParserResult.os?.name || 'Unknown')
    this.setKeyValue('device.osv', this.uaParserResult.os?.version || 'Unknown')
  }

  /**
   * Resolves and sets the geolocation information
   * @description
   * This method sets the `device.geo` fields as per OpenRTB specification section 3.2.18.
   * The geolocation information is obtained using the Geolocation API.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  async resolveGeolocation() {
    try {
      const response = await fetch('https://ipinfo.io/json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data) {
        if (data.loc) {
          const [latitude, longitude] = data.loc.split(',')
          this.setKeyValue('device.geo.lat', parseFloat(latitude))
          this.setKeyValue('device.geo.lon', parseFloat(longitude))
        }
        this.setKeyValue('device.ip', data.ip || 'Unknown')
        this.setKeyValue('device.geo.region', data.region || 'Unknown')
        this.setKeyValue('device.geo.region', data.region || 'Unknown')
        this.setKeyValue('device.geo.city', data.city || 'Unknown')
        this.setKeyValue('device.geo.zip', data.postal || 'Unknown')
        this.setKeyValue('device.geo.country', data.country || 'Unknown')
        this.setKeyValue('device.geo.type', 2)
      } else {
        throw new Error('Invalid geolocation data from API')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.handleError('device.geo', error)
      } else {
        this.handleError('device.geo', new Error('Unknown error occurred'))
      }
    }
  }

  /**
   * Sets the geolocation fetch capability flag
   * @description
   * This method sets the `device.geofetch` field as per OpenRTB specification section 3.2.18.
   * The geolocation fetch capability flag indicates whether the device supports geolocation.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveGeofetch() {
    this.setKeyValue('device.geofetch', 'geolocation' in navigator ? 1 : 0)
  }

  /**
   * Calculates and sets the pixels per inch (PPI) value
   * @description
   * This method sets the `device.ppi` field as per OpenRTB specification section 3.2.18.
   * The PPI value is calculated using the screen dimensions and an approximate diagonal size.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  // TODO: Find better way to identify PPI
  resolvePPI() {
    const diagPixels = Math.sqrt(screen.width ** 2 + screen.height ** 2)
    const diagInches = 6 // Approximate
    const ppi = Math.round(
      (diagPixels / diagInches) * (window.devicePixelRatio || 1),
    )
    this.setKeyValue('device.ppi', ppi || 'Unknown')
  }

  /**
   * Resolves and sets the Flash version if available
   * @description
   * This method sets the `device.flashver` field as per OpenRTB specification section 3.2.18.
   * The Flash version is determined using the browser's plugins.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveFlashVersion() {
    const flashPlugin = Array.from(navigator.plugins || []).find((plugin) =>
      plugin.name.includes('Shockwave Flash'),
    )
    this.setKeyValue(
      'device.flashver',
      flashPlugin ? flashPlugin.description.split(' ')[2] : 'Unknown',
    )
  }

  /**
   * Sets the Limit Ad Tracking flag
   * @description
   * This method sets the `device.lmt` field as per OpenRTB specification section 3.2.18.
   * The Limit Ad Tracking flag indicates whether the user has opted out of ad tracking.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveLMT(): void {
    this.setKeyValue(
      'device.lmt',
      navigator.doNotTrack === '1' || (window as any).doNotTrack === '1'
        ? 1
        : 0,
    )
  }

  /**
   * Sets the Do Not Track flag
   * @description
   * This method sets the `device.dnt` field as per OpenRTB specification section 3.2.18.
   * The Do Not Track flag indicates whether the user has enabled the Do Not Track setting in their browser.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveDNT(): void {
    this.setKeyValue(
      'device.dnt',
      navigator.doNotTrack === '1' || (window as any).doNotTrack === '1'
        ? 1
        : 0,
    )
  }

  /**
   * Resolves all device properties
   * @description
   * This method resolves all device properties by executing each resolver method.
   * The resolved properties are stored in the `keyParamMapping` object.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  async resolve() {
    for (const [key, resolver] of Object.entries(this.resolvers)) {
      await this.safeExecute(`device.${key}`, resolver)
    }
  }
}

/**
 * SiteResolver class to resolve various site properties
 * @class
 * @extends BaseResolver
 * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
 */
class SiteResolver extends BaseResolver implements SiteResolverConfig {
  static instance?: SiteResolver
  config!: Record<string, any>
  resolvers!: Record<string, () => void | Promise<void>>

  constructor() {
    super()
    // Implement Singleton pattern
    if (SiteResolver.instance) {
      return SiteResolver.instance
    }
    SiteResolver.instance = this

    // Initialize configuration object for integration-provided values
    this.config = {}

    // Define resolvers for various site properties
    this.resolvers = {
      domain: this.resolveDomain.bind(this),
      // TODO: enable in future when we have mapping and support of category info on the served video
      // cat: this.resolveCat.bind(this),
      // sectioncat: this.resolveSectionCat.bind(this),
      // pagecat: this.resolvePageCat.bind(this),
      page: this.resolvePage.bind(this),
      ref: this.resolveRef.bind(this),
      search: this.resolveSearch.bind(this),
      mobile: this.resolveMobile.bind(this),
      privacypolicy: this.resolvePrivacyPolicy.bind(this),
      publisher: this.resolvePublisherDomain.bind(this),
      publisherName: this.resolvePublisherName.bind(this),
      // TODO: do it when we have support from this from backend
      // content: this.resolveContent.bind(this),
      // keywords: this.resolveKeywords.bind(this),
    }
  }

  // Method to set configuration values provided by website integration
  setConfig(config: Record<string, any>): void {
    this.config = { ...this.config, ...config }
  }

  // Resolver methods
  /**
   * Resolves the domain of the site
   * Automatically extracted from the current URL
   * @description
   * This method sets the `site.domain` field as per OpenRTB specification section 3.2.13.
   * The domain is the primary domain of the site where the ad will be displayed.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveDomain() {
    this.setKeyValue('site.domain', window.location.hostname)
    this.setKeyValue('site.id', window.location.hostname)
  }

  /**
   * Resolves the IAB content categories of the site
   * Must be provided by website integration
   * @description
   * This method sets the `site.cat` field as per OpenRTB specification section 3.2.13.
   * The content categories are used to describe the content of the site.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveCat() {
    this.setKeyValue('site.cat', this.config.cat || [])
  }

  /**
   * Resolves the IAB content categories for the current section
   * Must be provided by website integration
   * @description
   * This method sets the `site.sectioncat` field as per OpenRTB specification section 3.2.13.
   * The section categories describe the content of the specific section of the site.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveSectionCat() {
    this.setKeyValue('site.sectioncat', this.config.sectioncat || [])
  }

  /**
   * Resolves the IAB content categories for the current page
   * Must be provided by website integration
   * @description
   * This method sets the `site.pagecat` field as per OpenRTB specification section 3.2.13.
   * The page categories describe the content of the specific page of the site.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolvePageCat() {
    this.setKeyValue('site.pagecat', this.config.pagecat || [])
  }

  /**
   * Resolves the URL of the current page
   * Automatically extracted from the current URL
   * @description
   * This method sets the `site.page` field as per OpenRTB specification section 3.2.13.
   * The page URL is the URL of the page where the ad will be displayed.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolvePage() {
    this.setKeyValue('site.page', window.location.href)
  }

  /**
   * Resolves the referrer URL
   * Automatically extracted from document.referrer
   * @description
   * This method sets the `site.ref` field as per OpenRTB specification section 3.2.13.
   * The referrer URL is the URL of the page that referred the user to the current page.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveRef() {
    this.setKeyValue('site.ref', document.referrer || '')
  }

  /**
   * Resolves the search string that caused navigation to the current page
   * Extracted from the URL's search parameters
   * @description
   * This method sets the `site.search` field as per OpenRTB specification section 3.2.13.
   * The search string is the query string that led the user to the current page.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveSearch() {
    const searchParams = new URLSearchParams(window.location.search)
    this.setKeyValue('site.search', searchParams.get('q') ?? 'Unknown')
  }

  /**
   * Resolves whether the site is optimized for mobile
   * Uses DeviceResolver's device type to determine
   * @description
   * This method sets the `site.mobile` field as per OpenRTB specification section 3.2.13.
   * The mobile flag indicates whether the site is optimized for mobile devices.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveMobile() {
    this.setKeyValue('site.mobile', 1)
  }

  /**
   * Resolves whether the site has a privacy policy
   * Must be provided by website integration
   * @description
   * This method sets the `site.privacypolicy` field as per OpenRTB specification section 3.2.13.
   * The privacy policy flag indicates whether the site has a privacy policy.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolvePrivacyPolicy() {
    this.setKeyValue('site.privacypolicy', 1)
  }

  /**
   * Resolves publisher details
   * Must be provided by website integration
   * @description
   * This method sets the `site.publisher` field as per OpenRTB specification section 3.2.13.
   * The publisher object contains details about the publisher of the site.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolvePublisherDomain() {
    this.setKeyValue('site.publisher.domain', window.location.hostname)
  }

  /**
   * Resolves publisher details
   * Consider brand name here
   * @description
   * This method sets the `site.publisher` field as per OpenRTB specification section 3.2.13.
   * The publisher object contains details about the publisher of the site.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolvePublisherName() {
    this.setKeyValue('site.publisher.name', this.getPublisherName())
  }

  /**
   * Resolves content details
   * Must be provided by website integration
   * @description
   * This method sets the `site.content` field as per OpenRTB specification section 3.2.13.
   * The content object contains details about the content of the site.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveContent() {
    this.setKeyValue('site.content', this.config.content || {})
  }

  /**
   * Resolves keywords for the site
   * Extracts keywords from meta tags and combines with config-provided keywords
   * @description
   * This method sets the `site.keywords` field as per OpenRTB specification section 3.2.13.
   * The keywords are used to describe the content of the site.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveKeywords() {
    const metaKeywords = this.getMetaKeywords()
    const ogKeywords = this.getOgKeywords()
    const configKeywords = this.config.keywords || ''

    // Combine all keywords, remove duplicates, and filter out empty strings
    const combinedKeywords = [
      ...new Set([
        ...metaKeywords.split(','),
        ...ogKeywords.split(','),
        ...configKeywords.split(','),
      ]),
    ]
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword !== '')
      .join(',')

    this.setKeyValue('site.keywords', combinedKeywords)
  }

  /**
   * Extracts keywords from the standard meta keywords tag
   * @returns {string} Comma-separated list of keywords
   */
  getMetaKeywords() {
    const metaTag = document.querySelector('meta[name="keywords"]')
    return metaTag ? (metaTag.getAttribute('content') ?? '') : ''
  }

  /**
   * Extracts keywords from the Open Graph meta tag
   * @returns {string} Comma-separated list of keywords
   */
  getOgKeywords() {
    const ogTag = document.querySelector('meta[property="og:keywords"]')
    return ogTag ? (ogTag.getAttribute('content') ?? '') : ''
  }

  /**
   * Resolves all site properties
   * @description
   * This method resolves all site properties by executing each resolver method.
   * The resolved properties are stored in the `keyParamMapping` object.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  async resolve() {
    for (const [key, resolver] of Object.entries(this.resolvers)) {
      await this.safeExecute(`site.${key}`, resolver)
    }
  }

  /**
   * Validates the resolved site object against OpenRTB specification
   * @returns {boolean} - True if valid, false otherwise
   * @description
   * This method validates the resolved site object to ensure it complies with the OpenRTB specification.
   * It checks for the presence of required fields.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  validateResolvedSite() {
    const required = ['id', 'name', 'domain', 'page']
    for (const field of required) {
      if (!this.keyParamMapping.site[field]?.value) {
        console.error(`Missing required field: site.${field}`)
        return false
      }
    }
    // Add more validation logic here if needed
    return true
  }
}

/**
 * UserResolver class to resolve various user properties
 * @class
 * @extends BaseResolver
 * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
 */
class UserResolver extends BaseResolver implements UserResolverConfig {
  static instance?: UserResolver
  config!: Record<string, any>
  resolvers!: Record<string, () => void | Promise<void>>

  constructor() {
    super()
    // Implement Singleton pattern
    if (UserResolver.instance) {
      return UserResolver.instance
    }
    UserResolver.instance = this

    // Initialize configuration object for integration-provided values
    this.config = {}

    // Define resolvers for user properties
    this.resolvers = {
      geo: this.resolveGeo.bind(this),
      // TODO: do it when we have support from this from backend
      // keywords: this.resolveKeywords.bind(this),
      // kwarray: this.resolveKwarray.bind(this),
    }
  }

  // Method to set configuration values provided by integration
  setConfig(config: Record<string, any>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Resolves the geo information for the user
   * Uses the geo information from DeviceResolver
   * @description
   * This method sets the `user.geo` field as per OpenRTB specification section 3.2.21.
   * The geo object contains the user's geographic location information.
   * The geo information is mapped from the DeviceResolver's geo data.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveGeo() {
    const deviceResolver = new DeviceResolver()
    const deviceGeo = deviceResolver.keyParamMapping.device.geo
    // Map device geo attributes to user geo
    const geoMapping = {
      lat: 'lat',
      lon: 'lon',
      type: 'type',
      country: 'country',
      region: 'region',
      city: 'city',
      zip: 'zip',
      // TODO: do these ones when we can have support for it
      // accuracy: 'accuracy',
      // lastfix: 'lastfix',
      // ipservice: 'ipservice',
      // regionfips104: 'regionfips104',
      // metro: 'metro',
      // utcoffset: 'utcoffset',
    }

    for (const [userKey, deviceKey] of Object.entries(geoMapping)) {
      if (deviceGeo[deviceKey] && deviceGeo[deviceKey].value !== null) {
        this.setKeyValue(`user.geo.${userKey}`, deviceGeo[deviceKey].value)
      }
    }
  }

  /**
   * Resolves keywords for the user
   * Combines keywords from config and any other available sources
   * @description
   * This method sets the `user.keywords` field as per OpenRTB specification section 3.2.21.
   * The keywords field contains a comma-separated list of keywords describing the user.
   * Keywords can be provided by the integration or derived from other sources.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveKeywords() {
    const configKeywords = this.config.keywords || ''
    // You can add more sources of keywords here in the future
    const combinedKeywords = [...new Set(configKeywords.split(','))]
      .map((value: unknown) => String(value).trim())
      .filter((keyword: string) => keyword !== '')
      .join(',')

    this.setKeyValue('user.keywords', combinedKeywords)
  }

  /**
   * Resolves kwarray for the user
   * Converts keywords string to an array
   * @description
   * This method sets the `user.kwarray` field as per OpenRTB specification section 3.2.21.
   * The kwarray field contains an array of keywords describing the user.
   * This is derived from the `user.keywords` field.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  resolveKwarray(): void {
    const keywords = this.keyParamMapping.user.keywords?.value || ''
    const kwarray = keywords
      .split(',')
      .map((kw: string) => kw.trim())
      .filter((kw: string) => kw !== '')
    this.setKeyValue('user.kwarray', kwarray)
  }

  /**
   * Resolves all user properties
   * @description
   * This method resolves all user properties by executing each resolver method.
   * The resolved properties are stored in the `keyParamMapping` object.
   * @see {@link https://iabtechlab.com/wp-content/uploads/2022/04/OpenRTB-2-6_FINAL.pdf|OpenRTB Specification}
   */
  async resolve() {
    for (const [key, resolver] of Object.entries(this.resolvers)) {
      await this.safeExecute(`user.${key}`, resolver)
    }
  }
}

// MainResolver class to orchestrate all resolvers
class MainResolver implements MainResolverConfig {
  deviceResolver: DeviceResolver
  siteResolver: SiteResolver
  userResolver: UserResolver

  constructor() {
    // Initialize individual resolvers
    this.deviceResolver = new DeviceResolver()
    this.siteResolver = new SiteResolver()
    this.userResolver = new UserResolver()
  }

  /**
   * Resolves all properties from all resolvers
   */
  async resolveAll() {
    await Promise.all([
      this.deviceResolver.resolve(),
      this.siteResolver.resolve(),
    ])
    await this.userResolver.resolve()
  }

  /**
   * Updates a given URL with resolved parameters
   * @param {string} url - The base URL to update
   * @returns {string} - The updated URL with resolved parameters
   */
  updateUrlWithParams(url: string): string {
    const urlObj = new URL(url)

    /**
     * Recursively traverses a JSON object and replaces URL macros with their corresponding values.
     *
     * This function iterates through all keys in the provided object. If a key's value is an object,
     * it checks if the object contains 'param' and 'value' properties. If the 'value' property is not
     * null or 'Unknown', and the 'macros' property exists in the URL's search string, it replaces the
     * macro with the value in the URL's search string. If the value is an array, it recursively calls
     * itself for each item in the array.
     *
     * @param {Object} obj - The JSON object to traverse.
     */
    // Function to traverse a JSON object and replace URL macros with their corresponding values
    const traverseJson = (obj: Record<string, any>) => {
      // Iterate over each key in the object
      for (const key in obj) {
        // Check if the value is an object and not null
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          // If the value is an array, recursively call traverseJson for each item
          if (Array.isArray(obj[key])) {
            obj[key].forEach((item: Record<string, any>) => {
              traverseJson(item)
            })
            // If the value contains 'param' and 'value' properties and the value is not null or 'Unknown'
          } else if (
            'param' in obj[key] &&
            'value' in obj[key] &&
            obj[key].value !== null &&
            obj[key].value !== 'Unknown'
          ) {
            // If the macros property exists in the URL's search string, replace the macro with the value
            if (obj[key].macros && urlObj.search.includes(obj[key].macros)) {
              urlObj.search = urlObj.search.replace(
                obj[key].macros,
                obj[key].value,
              )
            }
            // If the value is an object, recursively call traverseJson
          } else {
            traverseJson(obj[key])
          }
        }
      }
    }

    // Combine all mappings from different resolvers
    const allMappings = {
      device: this.deviceResolver.keyParamMapping.device,
      site: this.siteResolver.keyParamMapping.site,
      user: this.userResolver.keyParamMapping.user,
    }
    traverseJson(allMappings)
    return urlObj.toString()
  }

  /**
   * Retrieves the resolved parameters from all resolvers
   * @returns {object} - An object containing all resolved parameters
   */
  getResolvedParams() {
    const resolvedParams: Record<string, any> = {}

    const traverseJson = (obj: Record<string, any>, parentKey = '') => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            obj[key].forEach((item: Record<string, any>) => {
              traverseJson(item, `${parentKey}${key}.`)
            })
          } else if (
            'param' in obj[key] &&
            'value' in obj[key] &&
            obj[key].value !== null &&
            obj[key].value !== 'Unknown'
          ) {
            resolvedParams[`${parentKey}${key}`] = obj[key].value
          } else {
            traverseJson(obj[key], `${parentKey}${key}.`)
          }
        }
      }
    }

    // Combine all mappings from different resolvers
    const allMappings = {
      device: this.deviceResolver.keyParamMapping.device,
      site: this.siteResolver.keyParamMapping.site,
      user: this.userResolver.keyParamMapping.user,
    }
    traverseJson(allMappings)
    return resolvedParams
  }

  /**
   * Main execution method
   */
  async main() {
    await this.resolveAll()
  }

  setPublisherName(name: string): void {
    BaseResolver.setPublisherName(name)
  }
}

// Context and Provider
type UrlParamContextType = {
  resolvedParams: Record<string, any>
  appendParamsToUrl: (url: string) => string
}

const UrlParamContext = createContext<UrlParamContextType>({
  resolvedParams: {},
  appendParamsToUrl: (url: string) => url,
})

/**
 * UrlParamProvider component that provides URL parameters context to its children.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components that will receive the URL parameters context.
 *
 * @returns {JSX.Element} The URL parameters context provider.
 *
 * @example
 * <UrlParamProvider>
 *   <MyComponent />
 * </UrlParamProvider>
 */
export const UrlParamProvider: React.FC<{
  children: React.ReactNode
  name: string
}> = ({ children, name }) => {
  // Set publisher name in BaseResolver config
  const resolvedParamsRef = React.useRef<Record<string, any>>({})
  const resolverRef = React.useRef<MainResolver | null>(null)

  useEffect(() => {
    const resolveUrlParams = async () => {
      const resolverInstance = new MainResolver()
      try {
        // Set the publisher name before resolving
        resolverInstance.setPublisherName(name)
        await resolverInstance.main()
        const params = resolverInstance.getResolvedParams()
        resolvedParamsRef.current = params
        resolverRef.current = resolverInstance
      } catch (error) {
        console.error(error)
      }
    }
    resolveUrlParams()
  }, [])

  const appendParamsToUrl = (url: string): string => {
    if (resolverRef.current) {
      return resolverRef.current.updateUrlWithParams(url)
    }
    return url
  }

  return (
    <UrlParamContext.Provider
      value={{ resolvedParams: resolvedParamsRef.current, appendParamsToUrl }}>
      {children}
    </UrlParamContext.Provider>
  )
}

export const useUrlParams = (): UrlParamContextType =>
  useContext(UrlParamContext)
