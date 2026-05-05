import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";

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

  async getPlacementData(placementId: string, styleId: string): Promise<EmbedDataType | null> {
    if (this.placements.has(placementId)) {
      return this.placements.get(placementId) || null;
    }

    const placementData = await apiService.getPlacementData(placementId);
    const parsedPlacementData = parsePlacementToEmbedData(placementData, styleId);
    if (parsedPlacementData) {
      this.placements.set(placementId, parsedPlacementData);
    }

    return parsedPlacementData;
  }
}
