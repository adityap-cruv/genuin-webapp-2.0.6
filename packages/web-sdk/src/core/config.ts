import { EmbedConfig, EmbedStyle } from '../types/embed'

export interface LegacySDKConfig {
  embed_id: string
  api_key: string
  token?: string
  brand_id?: number
  subdomain?: string
  brand_colors?: string
  name?: string
  contextualParams?: {
    page_context?: string | null
    geo?: {
      lat?: string | null
      long?: string | null
    }
    url?: string | null
  }
  brand_ids?: number[]
  params?: string
  video?: string
  action?: string
  authInfo?: any
  style?: string
  type?: string
  live_customization_data?: any
  embed?: number
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
  validateLegacyConfig(config: { embed_id?: string; api_key?: string }): {
    isValid: boolean
    missingFields: string[]
    errorMessage?: string
  } {
    const missingFields = []
    if (!config.embed_id) missingFields.push('embed_id')
    if (!config.api_key) missingFields.push('api_key')

    return {
      isValid: missingFields.length === 0,
      missingFields,
      errorMessage: missingFields.length
        ? `Missing required fields: ${missingFields.join(', ')}. Please pass the config object this format:
        window.genuin.init({
          embed_id: 'your_embed_id',
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
    const embedId = div.getAttribute('data-embed-id')
    const apiKey = div.getAttribute('data-api-key')

    if (!embedId) missingFields.push('data-embed-id')
    if (!apiKey) missingFields.push('data-api-key')

    return {
      isValid: missingFields.length === 0,
      missingFields,
      errorMessage: missingFields.length
        ? `Missing required fields: ${missingFields.join(', ')}.
        Required attributes:
        - data-embed-id="your_embed_id"
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
