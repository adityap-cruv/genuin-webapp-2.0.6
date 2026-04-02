import { EmbedDataType, LiveCustomizationTools } from '@genuin/components/context/embed/embed.types'
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

  async getPlacementData(
    placementId: string,
    styleId: string,
  ): Promise<EmbedDataType | null> {
    if (this.placements.has(placementId)) {
      return this.placements.get(placementId) || null
    }

    const placementData = await apiService.getPlacementData(placementId)
    const parsedPlacementData = parsePlacementToEmbedData(
      placementData,
      styleId,
    )

    console.log('[PlacementManager] Fetched placement data:', {
      placementId,
      hasOctoSettings: !!(placementData as unknown as LiveCustomizationTools)?.octo_settings,
      octoSettings: (placementData as unknown as LiveCustomizationTools)?.octo_settings,
      parsedHasLiveCustomizationTools: !!parsedPlacementData?.live_customization_tools,
    })

    if (parsedPlacementData) {
      this.placements.set(placementId, parsedPlacementData)
    }

    return parsedPlacementData
  }
}
