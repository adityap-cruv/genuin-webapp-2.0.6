import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import type { BrandDetailsConfigType } from "@genuin/components/context/embed/embed.types";

import type { SingleEmbedDataConfig } from "@/type";

import { apiService } from "./api";

export class EmbedDetailsManager {
  static instance: EmbedDetailsManager;
  private embedDetailsList: Record<string, EmbedDataType> = {};
  private constructor() {}

  public static getInstance(): EmbedDetailsManager {
    if (!EmbedDetailsManager.instance) {
      EmbedDetailsManager.instance = new EmbedDetailsManager();
    }
    return EmbedDetailsManager.instance;
  }

  public async getEmbedDetails(config: Partial<SingleEmbedDataConfig>, _brandDetails: BrandDetailsConfigType) {
    if (!config.embedId) return {} as EmbedDataType;
    if (this.embedDetailsList[config.embedId]) {
      return this.embedDetailsList[config.embedId] ?? ({} as EmbedDataType);
    }

    // Pass full config (including initSponsorshipId) to the API so backend can include/override sponsorshipId
    const embedDetails = await apiService.fetchEmbedData(config);

    this.embedDetailsList[config.embedId] = Object.assign(embedDetails, {
      embed_id: config.embedId,
    });

    return embedDetails;
  }
}

export const embedDetails = EmbedDetailsManager.getInstance();
