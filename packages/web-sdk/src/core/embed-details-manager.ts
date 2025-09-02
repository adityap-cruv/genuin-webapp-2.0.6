import { BrandDetailsConfigType } from '@/type'
import { EmbedDataType } from '@genuin/components/context/embed/embed.types'
import { apiService } from './api'

export class EmbedDetailsManager {
  static instance: EmbedDetailsManager
  private embedDetailsList: Record<string, EmbedDataType> = {}
  private constructor() {}

  public static getInstance(): EmbedDetailsManager {
    if (!EmbedDetailsManager.instance) {
      EmbedDetailsManager.instance = new EmbedDetailsManager()
    }
    return EmbedDetailsManager.instance
  }

  public async getEmbedDetails(
    embedId: string,
    brandDetails: BrandDetailsConfigType,
  ) {
    if (this.embedDetailsList[embedId]) {
      return this.embedDetailsList[embedId]
    }

    const embedDetails = await apiService.fetchEmbedData(embedId)

    this.embedDetailsList[embedId] = Object.assign(embedDetails, {
      brandDetails,
    })

    return embedDetails
  }
}

export const embedDetails = EmbedDetailsManager.getInstance()
