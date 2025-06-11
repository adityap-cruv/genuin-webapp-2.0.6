import { axiosInstance } from "src/react-query/axios-instance";
import { getQueryKeyForGuidelines } from "@react-query/keys/authentication";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_PATHS } from "@react-query/paths";

// Type definitions
export type GuideLineType = {
  title: string;
  description: string;
};

type GuidelinProps = {
  brandId: number;
  isDefaultId: boolean;
};

/**
 * Fetches brand guidelines from the API
 * @param params Guidelines request parameters
 * @returns Promise with guidelines data
 */
async function getBrandGuidelines({
  brandId,
  isDefaultId,
}: GuidelinProps): Promise<GuideLineType[]> {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH_GET_GUIDELINES, {
      params: {
        brand_id: brandId,
        is_default: isDefaultId,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error("Guidelines API Error:", error.response?.data?.code);
    throw new Error(
      `Failed to fetch guidelines: ${error.response?.data?.message || "Unknown error"}`
    );
  }
}

/**
 * React hook for fetching brand guidelines
 * @param params Guidelines parameters including brandId and isDefaultId
 * @returns Mutation object for handling guidelines fetching
 */
export function useGetGuidelines(params: GuidelinProps) {
  return useQuery({
    queryKey: getQueryKeyForGuidelines(params.brandId),
    queryFn: () => getBrandGuidelines(params),
    enabled: !!params.brandId,
  });
}

export async function acceptBrandGuidelines() {
  return await axiosInstance
    .post(API_PATHS.AUTH_ACCEPT_GUIDELINES)
    .then((res) => {
      return true;
    })
    .catch((e) => {
      throw new Error(
        `Failed to accept guidelines: ${e.response?.data?.message || "Unknown error"}`
      );
    });
}

export function useAcceptGuidelinesMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (
    response: Awaited<ReturnType<typeof acceptBrandGuidelines>>
  ) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: acceptBrandGuidelines,
    onSuccess,
    onError,
  });
}
