import { USER_DATA_KEY } from '@/constants'
import { APIService } from './api'
import { AuthUser } from '@genuin/components/types/auth'
import { ErrorHandler, ErrorType } from './errors'
import { getKsCbRequestStatus } from '@/utils/auth'
import { EventManager, SDKEventType } from './events'

/**
 * This class will only manage single user toke for its lifetime.
 */
export class TokenManager {
  private static instance: TokenManager
  private apiService: APIService
  private errorHandler: ErrorHandler
  private eventManager: EventManager
  private cachedUser: AuthUser | null = null

  private constructor() {
    this.apiService = APIService.getInstance()
    this.errorHandler = ErrorHandler.getInstance()
    this.eventManager = EventManager.getInstance()
    this.setupAuthEventListeners()
  }

  /**
   * Sets up event listeners for authentication-related events
   * @private
   */
  private setupAuthEventListeners(): void {
    // Listen for authentication refresh failures
    this.eventManager.on(
      SDKEventType.AUTHENTICATION_REFRESH_FAILED,
      async (event) => {
        try {
          if (event.payload && typeof event.payload === 'object') {
            // Clear user from local storage
            this.clearAuth()

            // Attempt to get fresh user details using the autoLoginToken
            const freshUserData = await this.getCurrentUser(event.payload)

            // Set user back to the provider
            if (freshUserData) {
              this.eventManager.emit(
                SDKEventType.SDK_AUTHENTICATE_USER,
                freshUserData,
              )
            }
          }
        } catch (error) {
          console.error(
            'TokenManager: Error during auto re-authentication after refresh failure:',
            error,
          )
        }
      },
    )

    // Listen for authentication user updates
    this.eventManager.on(
      SDKEventType.AUTHENTICATION_CACHED_USER_UPDATE,
      (event) => {
        try {
          if (event.payload && typeof event.payload === 'object') {
            this.setUserData(event.payload)
          }
        } catch (error) {
          console.error(
            'TokenManager: Error handling AUTHENTICATION_CACHED_USER_UPDATE event:',
            error,
          )
        }
      },
    )
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
   * Store user data in localStorage
   */
  setUserData(userData: AuthUser): void {
    try {
      const currentUserData = this.getUserData()
      // Clear cached user if the user data has changed
      if (currentUserData && currentUserData.id !== userData.id) {
        this.cachedUser = null
      }
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    } catch (error) {
      console.warn('Failed to store user data:', error)
    }
  }

  /**
   * Get user data from localStorage
   */
  getUserData(): AuthUser | null {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.warn('Failed to get user data:', error)
      return null
    }
  }

  /**
   * Remove user data from localStorage
   */
  removeUserData(): void {
    try {
      localStorage.removeItem(USER_DATA_KEY)
      this.cachedUser = null
    } catch (error) {
      console.warn('Failed to remove user data:', error)
    }
  }

  /**
   * Check if user data exists in localStorage
   */
  hasUserData(): boolean {
    return this.getUserData() !== null
  }

  /**
   * Get current authenticated user
   * Handles both token-based and session-based authentication
   * Now checks local storage first to skip API calls when possible
   */
  async getCurrentUser(config?: {
    token?: string
    brandId: number
    params?: any
  }): Promise<AuthUser | null> {
    try {
      // Return cached user if available
      if (this.cachedUser) {
        return this.cachedUser
      }

      // Check local storage for user data first
      const storedUserData = this.getUserData()

      if (storedUserData) {
        // remove stored data and fetch fresh data
        if (config?.token && storedUserData.autoLoginToken !== config.token) {
          console.log(
            'Token mismatch detected, removing stored data and fetching fresh',
          )
          this.removeUserData()
        } else {
          // Set cached user and return it
          this.cachedUser = storedUserData
          console.log('Using stored user data, skipping API call')
          return this.cachedUser
        }
      }

      // If explicit token provided, fetch user data from API
      if (config?.token && config?.brandId) {
        const userData = await this.apiService.getAuthenticatedUserDetails(
          config.token,
          config.brandId,
          config.params,
        )

        if (userData) {
          // Store user data in local storage
          this.setUserData(userData)

          // Cache the user
          this.cachedUser = userData
          return this.cachedUser
        }
      }
      // Otherwise, check for existing session using mini profile
      else if (this.hasUserData()) {
        const token = this.getUserData()?.accessToken
        if (token) {
          const profileResponse = await this.apiService.getMiniProfile()
          if (profileResponse.data && token) {
            const parsedUser = this.parseUserResponse({
              apiUser: profileResponse.data,
              accessToken: token,
              refreshToken: token,
            })

            // Store user data in local storage
            this.setUserData(parsedUser)

            // Cache the user
            this.cachedUser = parsedUser
            return parsedUser
          }
        }
      }

      // Remove token and user data if authentication failed
      this.removeUserData()
      return null
    } catch (error) {
      this.errorHandler.handleError(
        ErrorType.AUTHENTICATION_ERROR,
        `Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error instanceof Error ? error : undefined },
      )

      // Remove invalid token and user data
      this.removeUserData()
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
    this.removeUserData()
    this.cachedUser = null
  }
}
