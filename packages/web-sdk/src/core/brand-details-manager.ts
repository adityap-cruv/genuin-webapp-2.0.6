import { BrandDetailsConfigType } from '@/type'
import { apiService } from './api'
import { ErrorType } from './errors'
import { error } from 'console'

export class BrandDetailsManager {
  private static instance: BrandDetailsManager
  private brandDetailsList: Record<string, BrandDetailsConfigType> = {}

  private constructor() {}

  public static getInstance(): BrandDetailsManager {
    if (!BrandDetailsManager.instance) {
      BrandDetailsManager.instance = new BrandDetailsManager()
    }
    return BrandDetailsManager.instance
  }

  public async getBrandDetails(apiKey: string) {
    if (this.brandDetailsList[apiKey]) {
      return this.brandDetailsList[apiKey]
    }

    const brandDetails = await apiService.fetchBrandDetails(apiKey)

    this.brandDetailsList[apiKey] = brandDetails

    return brandDetails
  }
}

/**
 * Singleton instance of BrandDetails.
 */
export const brandDetailsManager = BrandDetailsManager.getInstance()
