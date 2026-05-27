import type { EmbedDataType, PlacementDataResponse } from "@genuin/components/context/embed/embed.types";
import { DEVICE_ID_KEY_FOR_LOCAL_STORAGE, getNewDeviceId } from "@genuin/components/lib/utils/device-id";
import { encryptText } from "@genuin/components/lib/utils/encryption";
import internalStorageManager from "@genuin/components/lib/utils/internal-storage-manager";
import type { AuthUser } from "@genuin/components/types/auth";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";

import type { SingleEmbedDataConfig } from "@/type";

import { API_BASE_URL } from "../constants";

import { ErrorHandler, ErrorType } from "./errors";

// Lazy load parseUserData to avoid pulling in react-query on init
// Will be imported dynamically when needed

export type BrandDetailsResponse = BrandDetailsConfigType;

export class APIService {
  private static instance: APIService;
  private errorHandler: ErrorHandler;
  private sdkVersion: string | undefined = window.genuin?.version;

  private getRequestHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      ...additionalHeaders,
      ...(this.sdkVersion ? { "x-sdk-version": this.sdkVersion } : {}),
    };
  }

  private constructor() {
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  /**
   * Fetch brand details using API key
   * Critical for SDK initialization - provides brand_id, subdomain, colors, etc.
   */
  async fetchBrandDetails(apiKey: string): Promise<BrandDetailsResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("api_key", apiKey);

      const response = await fetch(`${API_BASE_URL}/goservices/brand/details?${searchParams}`, {
        headers: this.getRequestHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Brand API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data as BrandDetailsResponse;
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.API_ERROR,
        `Failed to fetch brand details: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          apiKey: apiKey.substring(0, 8) + "...",
          originalError: error instanceof Error ? error : new Error(String(error)),
        }
      );
      throw new Error(sdkError.message);
    }
  }

  /**
   * Fetch embed configuration data
   * Required for embed customization and display settings
   */
  async fetchEmbedData(config: Partial<SingleEmbedDataConfig>): Promise<EmbedDataType> {
    try {
      // Pass initialized sponsorshipIds to the embed API so backend can prioritize/override them
      const sponsorshipParams = new URLSearchParams();
      if (config.initSponsorshipId && config.initSponsorshipId.length > 0) {
        for (const id of config.initSponsorshipId) {
          sponsorshipParams.append("sponsorship_id", id);
        }
      }
      const response = await fetch(
        `${API_BASE_URL}/goservices/embed?id=${config.embedId}${sponsorshipParams.toString() ? `&${sponsorshipParams.toString()}` : ""}`,
        {
          headers: this.getRequestHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Embed API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data as EmbedDataType;
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.API_ERROR,
        `Failed to fetch embed data: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          embedId: config.embedId,
          originalError: error instanceof Error ? error : new Error(String(error)),
        }
      );
      throw new Error(sdkError.message);
    }
  }

  /**
   * Fetch placement configuration data
   * Required for embed customization and display settings
   */
  async getPlacementData(config: Partial<SingleEmbedDataConfig>): Promise<PlacementDataResponse> {
    try {
      // Pass initialized sponsorshipIds to the placement API so backend can prioritize/override them
      const sponsorshipParams = new URLSearchParams();
      if (config.initSponsorshipId && config.initSponsorshipId.length > 0) {
        for (const id of config.initSponsorshipId) {
          sponsorshipParams.append("sponsorship_id", id);
        }
      }
      const response = await fetch(
        `${API_BASE_URL}/goservices/placement?placement_id=${config.placementId}${sponsorshipParams.toString() ? `&${sponsorshipParams.toString()}` : ""}`,
        {
          headers: this.getRequestHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Placement API failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.data as PlacementDataResponse;
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.API_ERROR,
        `Failed to fetch placement data: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          embedId: config.placementId,
          originalError: error instanceof Error ? error : new Error(String(error)),
        }
      );
      throw new Error(sdkError.message);
    }
  }

  /**
   * Initializes and stores a unique device ID for the current session.
   *
   * This function ensures that a valid `deviceId` is always available and persisted
   * in the correct storage context — `internalStorageManager` when running inside
   * an iframe, or `localStorage` otherwise.
   *
   *  Why we regenerate the device ID:
   * In the **auto-login** flow, the SDK’s `baseContext` might not have been created yet.
   * Since device ID generation usually happens inside that context, the `deviceId`
   * remains empty (""). To handle this edge case, we explicitly generate a new
   * device ID here to guarantee availability even before `baseContext` is initialized.
   */
  async initDeviceId(isInIframe: boolean): Promise<string | undefined> {
    const newDeviceId = await new Promise<string | undefined>((resolve) => {
      getNewDeviceId((deviceId) => {
        resolve(deviceId);
      });
    });
    if (!newDeviceId) return undefined;
    if (isInIframe) {
      internalStorageManager.setItem(DEVICE_ID_KEY_FOR_LOCAL_STORAGE, newDeviceId);
    } else {
      localStorage.setItem(DEVICE_ID_KEY_FOR_LOCAL_STORAGE, JSON.stringify(newDeviceId));
    }
    return newDeviceId;
  }

  /**
   * Get authenticated user details using token
   * Used for personalized content and authentication
   */
  async getAuthenticatedUserDetails(
    token: string,
    brandId: number,
    isInIframe: boolean,
    userParams?: Record<string, any>
  ): Promise<AuthUser | null> {
    try {
      const deviceId = await this.initDeviceId(isInIframe);

      if (!deviceId) return null;

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
      };

      // Implementation based on auth.ts reference
      const response = await fetch(`${API_BASE_URL}/api/v4/sso/autologin`, {
        method: "POST",
        headers: this.getRequestHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          encrypted_device_id: await encryptText(deviceId, true),
          token,
          brand_id: brandId,
          device_type: 3,
          login_source: 1,
          ...userParamsBody,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - return null instead of throwing
          return null;
        }
        throw new Error(`Auth API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const accessToken = response.headers.get("Gn-Access-Token") || token;
      const refreshToken = response.headers.get("Gn-Refresh-Token") || token;
      let user;
      if (data) {
        // Lazy load parseUserData to avoid pulling in react-query on init
        const { parseUserData } = await import("@genuin/components/react-query/api/authentication/parser");
        user = parseUserData(data.data, accessToken, refreshToken, token);
      }
      return user as AuthUser;
    } catch (error) {
      const sdkError = this.errorHandler.handleError(
        ErrorType.AUTHENTICATION_ERROR,
        `Failed to authenticate user: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          brandId,
          originalError: error instanceof Error ? error : new Error(String(error)),
        }
      );
      // For auth errors, we log but don't throw - return null instead
      console.warn(sdkError.message);
      return null;
    }
  }

  /**
   * Get mini profile from stored access token
   * Used when user has previous session
   */
  async getMiniProfile(): Promise<{ data: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v3/auth/profile`, {
        headers: this.getRequestHeaders(),
        credentials: "include", // Include cookies/session data
      });

      if (!response.ok) {
        return { data: null };
      }

      const data = await response.json();
      return { data: data.data };
    } catch (error) {
      console.warn("Failed to get mini profile:", error);
      return { data: null };
    }
  }

  /**
   * Validate API key by making a test request
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      await this.fetchBrandDetails(apiKey);
      return true;
    } catch (_error) {
      return false;
    }
  }
}

export const apiService = APIService.getInstance();
