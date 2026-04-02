import { NEXT_PUBLIC_API_URL } from "@genuin/components/lib/utils/env";
import axios, { AxiosInstance } from "axios";

type BrandInstanceConfig = {
  instance: AxiosInstance;
  refCount: number;
  brandIdInterceptorId: number;
  authInterceptorId: number | null;
};

/**
 * Registry for managing brand-scoped axios instances.
 * Each brand gets its own axios instance with the x-brand-id header pre-configured.
 * Reference counting ensures proper cleanup when embeds unmount.
 * 
 * In case of user wants to set some data to all instances (e.g. auth token), it can be done via new methods on this registry, which will handle adding/removing interceptors as needed.
 */
class AxiosInstanceRegistry {
  private instances = new Map<number, BrandInstanceConfig>();
  private globalAuthToken: string | null = null;

  private getSdkVersion(): string | undefined {
    try {
      const sdkVersion = window?.genuin?.version;
      if (typeof sdkVersion === "string" && sdkVersion.trim().length > 0) {
        return sdkVersion;
      }
    } catch {
      // Accessing window can throw in non-browser environments.
    }

    return undefined;
  }

  /**
   * Get or create an axios instance for a brand.
   * If an instance already exists for this brand, it increments the reference count.
   */
  getOrCreateInstance(brandId: number): AxiosInstance {
    const existing = this.instances.get(brandId);
    if (existing) {
      existing.refCount++;
      return existing.instance;
    }

    const instance = axios.create({ baseURL: NEXT_PUBLIC_API_URL });

    // Set brand header for all requests from this instance
    const brandIdInterceptorId = instance.interceptors.request.use((config) => {
      config.headers["x-brand-id"] = brandId;

      const sdkVersion = this.getSdkVersion();
      if (sdkVersion) {
        config.headers["x-sdk-version"] = sdkVersion;
      }

      return config;
    });

    const config: BrandInstanceConfig = {
      instance,
      refCount: 1,
      brandIdInterceptorId,
      authInterceptorId: null,
    };

    // If there's a global auth token, apply it to this new instance
    if (this.globalAuthToken) {
      config.authInterceptorId = instance.interceptors.request.use(
        (reqConfig) => {
          reqConfig.headers.Authorization = `Bearer ${this.globalAuthToken}`;
          return reqConfig;
        }
      );
    }

    this.instances.set(brandId, config);

    return instance;
  }

  /**
   * Release an instance when an embed unmounts.
   * Decrements reference count and cleans up if no more references.
   */
  releaseInstance(brandId: number): void {
    const config = this.instances.get(brandId);
    if (config) {
      config.refCount--;
      if (config.refCount <= 0) {
        // Cleanup interceptors
        config.instance.interceptors.request.eject(config.brandIdInterceptorId);
        if (config.authInterceptorId !== null) {
          config.instance.interceptors.request.eject(config.authInterceptorId);
        }
        this.instances.delete(brandId);
      }
    }
  }

  /**
   * Set auth token on ALL brand instances.
   * Used when user logs in on any embed.
   */
  setAuthTokenOnAll(token?: string): boolean {
    const normalizedToken = token ?? null;

    // No-op when token is unchanged to avoid re-registering interceptors
    // and triggering unnecessary downstream query invalidations.
    if (this.globalAuthToken === normalizedToken) {
      return false;
    }

    this.globalAuthToken = normalizedToken;

    for (const [, config] of this.instances) {
      // Eject previous auth interceptor
      if (config.authInterceptorId !== null) {
        config.instance.interceptors.request.eject(config.authInterceptorId);
        config.authInterceptorId = null;
      }

      // Add new interceptor if token provided
      if (normalizedToken) {
        config.authInterceptorId = config.instance.interceptors.request.use(
          (reqConfig) => {
            reqConfig.headers.Authorization = `Bearer ${normalizedToken}`;
            return reqConfig;
          }
        );
      }
    }

    return true;
  }

  /**
   * Clear auth token from all instances.
   */
  clearAuthTokenFromAll(): boolean {
    return this.setAuthTokenOnAll(undefined);
  }

  /**
   * Get instance for a brand without incrementing ref count.
   * Returns undefined if no instance exists for this brand.
   */
  getInstance(brandId: number): AxiosInstance | undefined {
    return this.instances.get(brandId)?.instance;
  }

  /**
   * Check if an instance exists for a brand.
   */
  hasInstance(brandId: number): boolean {
    return this.instances.has(brandId);
  }

  /**
   * Get all active brand IDs.
   */
  getActiveBrandIds(): number[] {
    return Array.from(this.instances.keys());
  }
}

export const axiosRegistry = new AxiosInstanceRegistry();
