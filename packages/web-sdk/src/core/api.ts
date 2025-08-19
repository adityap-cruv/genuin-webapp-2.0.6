import { API_BASE_URL } from '../const'
import { ErrorHandler, ErrorType } from './errors'
import { type AuthUser } from '../type'
import { type BrandDetailsConfigType } from '../type'

export type BrandDetailsResponse = BrandDetailsConfigType

export interface EmbedDataResponse {
  name: string
  style: string
  type: string
  brand_id: string
  customization: any
  embed_id: string
  environment: string
  // Add other properties as needed
}

export class APIService {
  private static instance: APIService
  private errorHandler: ErrorHandler

  private constructor() {
    this.errorHandler = ErrorHandler.getInstance()
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService()
    }
    return APIService.instance
  }

  /**
   * Fetch brand details using API key
   * Critical for SDK initialization - provides brand_id, subdomain, colors, etc.
   */
  async fetchBrandDetails(apiKey: string): Promise<BrandDetailsResponse> {
    try {
      const searchParams = new URLSearchParams()
      searchParams.set('api_key', apiKey)

      const response = await fetch(
        `${API_BASE_URL}/api/v3/brand/detail?${searchParams}`,
      )

      if (!response.ok) {
        throw new Error(
          `Brand API failed: ${response.status} ${response.statusText}`,
        )
      }

      const data = await response.json()
      return data.data as BrandDetailsResponse
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.API_ERROR,
        `Failed to fetch brand details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { apiKey: apiKey.substring(0, 8) + '...', originalError: error },
      )
      throw new Error(sdkError.message)
    }
  }

  /**
   * Fetch embed configuration data
   * Required for embed customization and display settings
   */
  async fetchEmbedData(embedId: string): Promise<EmbedDataResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v3/embed?id=${embedId}`)

      if (!response.ok) {
        throw new Error(
          `Embed API failed: ${response.status} ${response.statusText}`,
        )
      }

      const data = await response.json()
      return data.data as EmbedDataResponse
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.API_ERROR,
        `Failed to fetch embed data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { embedId, originalError: error },
      )
      throw new Error(sdkError.message)
    }
  }

  /**
   * Get authenticated user details using token
   * Used for personalized content and authentication
   */
  async getAuthenticatedUserDetails(
    token: string,
    brandId: number,
    params?: string,
  ): Promise<AuthUser | null> {
    try {
      // Implementation would depend on the actual auth API endpoint
      // This is a placeholder for the legacy functionality
      const response = await fetch(`${API_BASE_URL}/api/v3/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Brand-ID': brandId.toString(),
          ...(params && { 'X-Params': params }),
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - return null instead of throwing
          return null
        }
        throw new Error(
          `Auth API failed: ${response.status} ${response.statusText}`,
        )
      }

      const data = await response.json()
      const user = data.data as AuthUser
      if (user) {
        user.autoLoginToken = token
      }
      return user
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.AUTHENTICATION_ERROR,
        `Failed to authenticate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { brandId, originalError: error },
      )
      // For auth errors, we log but don't throw - return null instead
      console.warn(sdkError.message)
      return null
    }
  }

  /**
   * Get mini profile from stored access token
   * Used when user has previous session
   */
  async getMiniProfile(): Promise<{ data: AuthUser | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v3/auth/profile`, {
        credentials: 'include', // Include cookies/session data
      })

      if (!response.ok) {
        return { data: null }
      }

      const data = await response.json()
      return { data: data.data as AuthUser }
    } catch (error) {
      console.warn('Failed to get mini profile:', error)
      return { data: null }
    }
  }

  /**
   * Validate API key by making a test request
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      await this.fetchBrandDetails(apiKey)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Validate embed ID by checking if it exists
   */
  async validateEmbedId(embedId: string): Promise<boolean> {
    try {
      await this.fetchEmbedData(embedId)
      return true
    } catch (error) {
      return false
    }
  }
}
