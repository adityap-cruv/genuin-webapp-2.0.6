import {
  EmbedDataType,
  PlacementDataResponse,
} from '@genuin/components/context/embed/embed.types'
import { apiService } from './api'
import { parsePlacementToEmbedData } from '@/utils'

export class PlacementManager {
  private placements: Map<string, EmbedDataType> = new Map()
  private static instance: PlacementManager

  private constructor() {}

  static getInstance(): PlacementManager {
    if (!PlacementManager.instance) {
      PlacementManager.instance = new PlacementManager()
    }
    return PlacementManager.instance
  }

  async getPlacementData(placementId: string): Promise<EmbedDataType | null> {
    if (this.placements.has(placementId)) {
      return this.placements.get(placementId) || null
    }

    const placementData = await apiService.getPlacementData(placementId)
    const parsedPlacementData = parsePlacementToEmbedData(placementData)

    if (parsedPlacementData) {
      this.placements.set(placementId, parsedPlacementData)
    }

    return parsedPlacementData
  }
}
