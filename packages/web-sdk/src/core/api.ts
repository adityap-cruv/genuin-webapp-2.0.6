import { API_BASE_URL } from '../const'
import { ErrorHandler, ErrorType } from './errors'
import { type AuthUser } from '../type'
import { type BrandDetailsConfigType } from '../type'
import { encryptText } from '@genuin/components/lib/utils/encryption'
import { getDeviceId } from '@genuin/components/lib/utils/device-id'
import {
  EmbedDataType,
  PlacementDataResponse,
} from '@genuin/components/context/embed/embed.types'
import { parseUserData } from '@genuin/components/react-query/api/authentication/parser'

export type BrandDetailsResponse = BrandDetailsConfigType

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
        `${API_BASE_URL}/goservices/brand/details?${searchParams}`,
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
        {
          apiKey: apiKey.substring(0, 8) + '...',
          originalError:
            error instanceof Error ? error : new Error(String(error)),
        },
      )
      throw new Error(sdkError.message)
    }
  }

  /**
   * Fetch embed configuration data
   * Required for embed customization and display settings
   */
  async fetchEmbedData(embedId: string): Promise<EmbedDataType> {
    try {
      const response = await fetch(`${API_BASE_URL}/goservices/embed?id=${embedId}`)

      if (!response.ok) {
        throw new Error(
          `Embed API failed: ${response.status} ${response.statusText}`,
        )
      }

      const data = await response.json()
      return data.data as EmbedDataType
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.API_ERROR,
        `Failed to fetch embed data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          embedId,
          originalError:
            error instanceof Error ? error : new Error(String(error)),
        },
      )
      throw new Error(sdkError.message)
    }
  }

  /**
   * Fetch placement configuration data
   * Required for embed customization and display settings
   */
  async fetchPlacementData(
    placementId: string,
  ): Promise<PlacementDataResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/goservices/placement?placement_id=${placementId}`,
      )

      if (!response.ok) {
        throw new Error(
          `Placement API failed: ${response.status} ${response.statusText}`,
        )
      }
      const data = await response.json()
      return data.data as PlacementDataResponse
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.API_ERROR,
        `Failed to fetch placement data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          embedId: placementId,
          originalError:
            error instanceof Error ? error : new Error(String(error)),
        },
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
    userParams?: Record<string, any>,
  ): Promise<AuthUser | null> {
    try {
      const deviceId = getDeviceId()

      // Build user parameters based on reference implementation
      const userParamsBody = {
        ...(userParams?.name && {
          name: userParams.name,
        }),
        ...(userParams?.nickname && {
          nickname: userParams.nickname,
        }),
        ...(userParams?.email && {
          email: userParams.email,
        }),
        ...(userParams?.mobile && {
          mobile: userParams.mobile,
        }),
        ...(userParams?.profileImage && {
          profile_image: userParams.profileImage,
        }),
        ...(userParams?.brandUserIdentity && {
          brand_user_identity: userParams.brandUserIdentity,
        }),
      }

      // Implementation based on auth.ts reference
      const response = await fetch(`${API_BASE_URL}/api/v4/sso/autologin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encrypted_device_id: encryptText(deviceId, true),
          token,
          brand_id: brandId,
          device_type: 3,
          login_source: 1,
          ...userParamsBody,
        }),
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
      const accessToken = response.headers.get('Gn-Access-Token') || token
      const refreshToken = response.headers.get('Gn-Refresh-Token') || token
      let user;
      if (data) {
        user = parseUserData(data.data, accessToken, refreshToken, token);
      }
      return user as AuthUser
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.AUTHENTICATION_ERROR,
        `Failed to authenticate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          brandId,
          originalError:
            error instanceof Error ? error : new Error(String(error)),
        },
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
