import { ACCESS_TOKEN_KEY } from '../const'
import { APIService } from './api'
import { AuthUser } from '../type'
import { ErrorHandler, ErrorType } from './errors'
import { LegacySDKConfig } from './config'

export class TokenManager {
  private static instance: TokenManager
  private apiService: APIService
  private errorHandler: ErrorHandler

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
   * Store access token in localStorage
   */
  setAccessToken(token: string): void {
    try {
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
      localStorage.removeItem(ACCESS_TOKEN_KEY)
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
    brandId?: number
    params?: LegacySDKConfig['params']
  }): Promise<AuthUser | null> {
    try {
      let user: AuthUser | null = null

      // If explicit token provided, use it
      if (config?.token && config?.brandId) {
        user = await this.apiService.getAuthenticatedUserDetails(
          config.token,
          config.brandId,
          config.params,
        )

        if (user) {
          user.autoLoginToken = config.token
          // Store token for future use
          this.setAccessToken(config.token)
        }
      }
      // Otherwise, check for existing session
      else if (this.hasAccessToken()) {
        const profileResponse = await this.apiService.getMiniProfile()
        user = profileResponse.data
      }

      // Remove token if authentication failed
      if (!user) {
        this.removeAccessToken()
      }

      return user
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
  }

  /**
   * Handle authentication from config (like legacy SDK)
   */
  async handleConfigAuth(config: {
    token?: string
    brand_id?: number
    params?: LegacySDKConfig['params']
  }): Promise<AuthUser | null> {
    // Remove token if not provided (like legacy SDK)
    if (!config.token) {
      this.removeAccessToken()
      return null
    }

    // Get user with provided config
    return await this.getCurrentUser({
      token: config.token,
      brandId: config.brand_id,
      params: config.params,
    })
  }
}
