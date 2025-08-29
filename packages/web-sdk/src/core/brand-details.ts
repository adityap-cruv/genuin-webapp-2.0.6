import { BrandDetailsConfigType } from '@/type'
import { apiService, APIService } from './api'

class BrandDetails {
  private static instance: BrandDetails
  private brandDetailsList: Record<string, BrandDetailsConfigType> = {}

  private constructor() {}

  public static getInstance(): BrandDetails {
    if (!BrandDetails.instance) {
      BrandDetails.instance = new BrandDetails()
    }
    return BrandDetails.instance
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
export const brandDetails = BrandDetails.getInstance()
