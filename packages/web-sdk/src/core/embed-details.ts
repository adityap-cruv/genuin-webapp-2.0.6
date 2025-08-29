import { apiService } from './api'

export type EmbedDetailsType = {
  name: string
  style: string
  type: string
  brand_id: string
  customization: any
  embed_id: string
  environment: string
}

class EmbedDetails {
  static instance: EmbedDetails
  private embedDetailsList: Record<string, EmbedDetailsType> = {}
  private constructor() {}

  public static getInstance(): EmbedDetails {
    if (!EmbedDetails.instance) {
      EmbedDetails.instance = new EmbedDetails()
    }
    return EmbedDetails.instance
  }

  public async getEmbedDetails(embedId: string) {
    if (this.embedDetailsList[embedId]) {
      return this.embedDetailsList[embedId]
    }

    const embedDetails = await apiService.fetchEmbedData(embedId)

    this.embedDetailsList[embedId] = embedDetails

    return embedDetails
  }
}

export const embedDetails = EmbedDetails.getInstance()
