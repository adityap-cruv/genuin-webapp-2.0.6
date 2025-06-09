import { axiosInstance } from "src/react-query/axios-instance";
import { getQueryKeyForGuidelines } from "src/react-query/keys/guidelines";
import { useQuery } from "@tanstack/react-query";

// Type definitions
export interface GuideLineType {
  title: string;
  description: string;
}

export interface GuideLineSchema {
  brandId: number;
  isDefaultId: boolean;
}

/**
 * Fetches brand guidelines from the API
 * @param params Guidelines request parameters
 * @returns Promise with guidelines data
 */
async function getBrandGuidelines(params: GuideLineSchema): Promise<GuideLineType[]> {
  try {
    const response = await axiosInstance.get('/api/v3/brand/guidelines', {
      params: {
        brand_id: params.brandId,
        is_default: params.isDefaultId,
      },
    });
    
    return response.data.data;
  } catch (error: any) {
    console.error('Guidelines API Error:', error.response?.data?.code);
    throw new Error(`Failed to fetch guidelines: ${error.response?.data?.message || 'Unknown error'}`);
  }
}

/**
 * React hook for fetching brand guidelines
 * @param params Guidelines parameters including brandId and isDefaultId
 * @returns Mutation object for handling guidelines fetching
 */
export function useGuidelines(params: GuideLineSchema) {
    return useQuery({
        queryKey: getQueryKeyForGuidelines(params.brandId),
        queryFn: () => getBrandGuidelines(params),
        enabled: !!params.brandId,
    });
}