import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";

import type { SingleEmbedDataConfig } from "@/type";
import { parsePlacementToEmbedData } from "@/utils";

import { apiService } from "./api";

export class PlacementManager {
  private placements: Map<string, EmbedDataType> = new Map();
  private static instance: PlacementManager;

  private constructor() {}

  static getInstance(): PlacementManager {
    if (!PlacementManager.instance) {
      PlacementManager.instance = new PlacementManager();
    }
    return PlacementManager.instance;
  }

  async getPlacementData(config: Partial<SingleEmbedDataConfig>, styleId: string): Promise<EmbedDataType | null> {
    if (!config.placementId) return null;
    const placementId = config.placementId;
    if (this.placements.has(placementId)) {
      return this.placements.get(placementId) || null;
    }

    // Pass full config (including initSponsorshipId) to the API so backend can include/override sponsorshipId
    const placementData = await apiService.getPlacementData(config);
    const parsedPlacementData = parsePlacementToEmbedData(placementData, styleId);
    if (parsedPlacementData) {
      this.placements.set(placementId, parsedPlacementData);
    }

    return parsedPlacementData;
  }
}
