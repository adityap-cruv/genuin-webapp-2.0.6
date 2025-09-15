import { EmbedConfig, EmbedStyle } from '../types/embed'

export interface LegacySDKConfig {
  embed?: number
  brand_id?: number
  hide_navbar?: number
  api_key?: string
  community?: string
  loop?: string
  video?: string
  style?: 'carousel' | 'feed'
  subdomain?: string
  embed_page?: string
  embed_id?: string
  placement_id?: string
  style_id?: string
  brand_colors?: any
  live_customization_data?: any
  token?: string
  name?: string
  contextualParams?: {
    page_context?: string
    geo?: {
      lat?: number
      long?: number
      radius_limit?: number
    }
    url?: string
    previous_page_context?: string
    user_context?: string
    place?: {
      country?: string
      state?: string
      city?: string
      zipcode?: string | number
    }
    time?: string | number
    user_segments?: {
      age?: number
      min_age?: number
      max_age?: number
      segment?: string
      gender?: string
      race?: string
    }
    brands_ids?: number[]
    user_interests?: string[]
    posted_by_user_ids?: string[]
    community_ids?: string[]
    loop_ids?: string[]
  }
  params?: {
    name?: string | null
    mobile?: string | null
    email?: string | null
    nickname?: string | null
    profileImage?: string | null
    brandUserIdentity?: string | null
  }
  brand_ids?: number[]
  type?: 'brand_feed' | 'community_feed' | 'loop_feed'
  action?: ActionType
  comment?: string
  authInfo?: AuthInfoType
}

type ActionType = 'spark' | 'comment-spark' | 'comment'

type AuthInfoType = {
  signInUrl: string
  signUpUrl: string
}
export class ConfigManager {
  private static instance: ConfigManager
  private config: EmbedConfig | null = null
  private legacyConfig: LegacySDKConfig | null = null

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  // Legacy validation from original SDK
  validateLegacyConfig(config: {
    embed_id?: string
    api_key?: string
    placement_id?: string
  }): {
    isValid: boolean
    missingFields: string[]
    errorMessage?: string
  } {
    const missingFields = []
    // Require either embed_id or placement_id
    if (!config.embed_id && !config.placement_id) {
      missingFields.push('embed_id or placement_id')
    }
    if (!config.api_key) missingFields.push('api_key')

    return {
      isValid: missingFields.length === 0,
      missingFields,
      errorMessage: missingFields.length
        ? `Missing required fields: ${missingFields.join(', ')}. Please pass the config object in this format:
        window.genuin.init({
          embed_id: 'your_embed_id' OR placement_id: 'your_placement_id',
          api_key: 'your_api_key',
          token: 'your_token' (optional)
        })`
        : undefined,
    }
  }

  // Validate DOM element attributes
  validateDivAttributes(div: Element): {
    isValid: boolean
    missingFields: string[]
    errorMessage?: string
  } {
    const missingFields = []
    const placementId = div.getAttribute('data-placement-id')
    const embedId = div.getAttribute('data-embed-id')
    const apiKey = div.getAttribute('data-api-key')

    // Require either embedId or placementId
    if (!embedId && !placementId) {
      missingFields.push('data-embed-id or data-placement-id')
    }
    if (!apiKey) missingFields.push('data-api-key')

    return {
      isValid: missingFields.length === 0,
      missingFields,
      errorMessage: missingFields.length
        ? `Missing required fields: ${missingFields.join(', ')}.
        Required attributes:
          - data-embed-id="your_embed_id" or data-placement-id="your_placement_id"
          - data-api-key="your_api_key"`
        : undefined,
    }
  }

  setLegacyConfig(config: LegacySDKConfig): void {
    // Validate legacy config
    const validation = this.validateLegacyConfig(config)
    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'Invalid configuration')
    }

    this.legacyConfig = config
  }

  getLegacyConfig(): LegacySDKConfig {
    if (!this.legacyConfig) {
      throw new Error('Legacy configuration not set.')
    }
    return this.legacyConfig
  }

  setConfig(config: EmbedConfig): void {
    // Validate required fields for modern API
    if (!config.elementId) {
      throw new Error('elementId is required')
    }

    // Set defaults
    this.config = {
      ...config,
      style: config.style || EmbedStyle.FEED,
      theme: config.theme || 'light',
      showHeader: config.showHeader !== false, // default true
      allowInteractions: config.allowInteractions !== false, // default true
      showComments: config.showComments !== false, // default true
      showReactions: config.showReactions !== false, // default true
      maxHeight: config.maxHeight || 600,
      autoResize: config.autoResize !== false, // default true
    }
  }

  getConfig(): EmbedConfig {
    if (!this.config) {
      throw new Error('Configuration not set. Call Genuin.init() first.')
    }
    return this.config
  }

  updateConfig(updates: Partial<EmbedConfig>): void {
    if (!this.config) {
      throw new Error('Configuration not set. Call Genuin.init() first.')
    }
    this.config = { ...this.config, ...updates }
  }

  isInitialized(): boolean {
    return this.config !== null
  }

  isLegacyInitialized(): boolean {
    return this.legacyConfig !== null
  }

  reset(): void {
    this.config = null
    this.legacyConfig = null
  }

  // Utility methods for common configuration checks
  shouldShowHeader(): boolean {
    return this.getConfig().showHeader ?? true
  }

  shouldAllowInteractions(): boolean {
    return this.getConfig().allowInteractions ?? true
  }

  // Generate unique instance ID like legacy SDK
  generateInstanceId(): string {
    return `sdk-instance-${Date.now()}-${Math.floor(Math.random() * 1000000) + 1}`
  }

  // Check if container is already initialized (prevent double init)
  isContainerInitialized(container: HTMLElement): boolean {
    return container.getAttribute('data-initialized') === 'true'
  }

  // Mark container as initialized
  markContainerInitialized(container: HTMLElement, instanceId: string): void {
    container.setAttribute('data-initialized', 'true')
    container.setAttribute('data-instance-id', instanceId)
  }
}
