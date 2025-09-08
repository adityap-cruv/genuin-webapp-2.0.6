import { ACCESS_TOKEN_KEY } from '../constants'
import { APIService } from './api'
import { AuthUser } from '@genuin/components/types/auth'
import { ErrorHandler, ErrorType } from './errors'
import { LegacySDKConfig } from './config'
import { getKsCbRequestStatus } from '@/utils/auth'

/**
 * This class will only manage single user toke for its lifetime.
 */
export class TokenManager {
  private static instance: TokenManager
  private apiService: APIService
  private errorHandler: ErrorHandler
  private cachedUser: AuthUser | null = null

  private constructor() {
    this.apiService = APIService.getInstance()
    this.errorHandler = ErrorHandler.getInstance()
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  /**
   * Parse API user response to AuthUser type
   */
  private parseUserResponse({
    apiUser,
    accessToken,
    refreshToken,
    autoLoginToken,
  }: {
    apiUser: any
    accessToken: string
    refreshToken: string
    autoLoginToken?: string
  }): AuthUser {
    return {
      id: apiUser.user_id,
      bio: apiUser.bio,
      email: apiUser.email,
      phoneNumber: apiUser.phone,
      isAvatar: apiUser.is_avatar,
      name: apiUser.name,
      nickname: apiUser.nickname,
      image: apiUser.profile_image,
      accessToken,
      ksCbRequestStatus: getKsCbRequestStatus(apiUser.ks_cb_request_status),
      isBrandSystemUser: apiUser.is_brand_system_user,
      brandId: apiUser.brand_id,
      hasTopics: !apiUser.onboarding_topics,
      usernameSet: !apiUser.is_username_generated,
      brandGuidelines: apiUser.brand_guidelines,
      refreshToken,
      autoLoginToken,
    }
  }

  /**
   * Store access token in localStorage
   */
  setAccessToken(token: string): void {
    try {
      const currentToken = this.getAccessToken()
      if (currentToken && currentToken !== token) {
        this.cachedUser = null
      }
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } catch (error) {
      console.warn('Failed to store access token:', error)
    }
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY)
    } catch (error) {
      console.warn('Failed to get access token:', error)
      return null
    }
  }

  /**
   * Remove access token from localStorage
   */
  removeAccessToken(): void {
    try {
      const token = this.getAccessToken()
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      if (token) {
        this.cachedUser = null
      }
    } catch (error) {
      console.warn('Failed to remove access token:', error)
    }
  }

  /**
   * Check if user has a stored access token
   */
  hasAccessToken(): boolean {
    return this.getAccessToken() !== null
  }

  /**
   * Get current authenticated user
   * Handles both token-based and session-based authentication
   */
  async getCurrentUser(config?: {
    token?: string
    brandId: number
    params?: LegacySDKConfig['params']
  }): Promise<AuthUser | null> {
    try {
      if (this.cachedUser) {
        return this.cachedUser
      }
      // If explicit token provided, check cache first
      if (config?.token && config?.brandId) {
        const apiResponse = await this.apiService.getAuthenticatedUserDetails(
          config.token,
          config.brandId,
          config.params,
        )

        if (apiResponse) {
          // Store token for future use
          this.setAccessToken(config.token)
          const parsedUser = this.parseUserResponse({
            apiUser: apiResponse.user,
            accessToken: apiResponse.accessToken,
            refreshToken: apiResponse.refreshToken,
            autoLoginToken: apiResponse.autoLoginToken,
          })
          // Cache the user
          this.cachedUser = parsedUser
          return parsedUser
        }
      }
      // Otherwise, check for existing session
      else if (this.hasAccessToken()) {
        const token = this.getAccessToken()
        if (token) {
          const profileResponse = await this.apiService.getMiniProfile()
          if (profileResponse.data && token) {
            const parsedUser = this.parseUserResponse({
              apiUser: profileResponse.data,
              accessToken: token,
              refreshToken: token,
            })
            // Cache the user
            this.cachedUser = parsedUser
            return parsedUser
          }
        }
      }

      // Remove token if authentication failed
      this.removeAccessToken()
      return null
    } catch (error) {
      this.errorHandler.handleError(
        ErrorType.AUTHENTICATION_ERROR,
        `Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error instanceof Error ? error : undefined },
      )

      // Remove invalid token
      this.removeAccessToken()
      return null
    }
  }

  getCachedUser() {
    return this.cachedUser
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    this.removeAccessToken()
    this.cachedUser = null
  }

  /**
   * Handle authentication from config (like legacy SDK)
   */
  // async handleConfigAuth(config: {
  //   token?: string
  //   brand_id?: number
  //   params?: LegacySDKConfig['params']
  // }): Promise<AuthUser | null> {
  //   // Remove token if not provided (like legacy SDK)
  //   if (!config.token) {
  //     this.removeAccessToken()
  //     return null
  //   }

  //   // Get user with provided config
  //   return await this.getCurrentUser({
  //     token: config.token,
  //     brandId: config.brand_id,
  //     params: config.params,
  //   })
  // }
}
