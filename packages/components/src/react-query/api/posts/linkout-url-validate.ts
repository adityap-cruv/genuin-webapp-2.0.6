import { useMutation } from "@tanstack/react-query";

import { axiosInstance } from "@genuin/components/context/axios/context";
import { API_PATHS } from "@genuin/components/react-query/paths";

interface ValidateUrlPayload {
  url: string;
  platform: "web";
  is_linkout: true;
  brand_id: number;
}

interface ValidateUrlResponse {
  code: number;
  message: string;
  data: {
    reason: string;
    valid_url: boolean;
  };
  url: string; // Return URL of payload param
}

/**
 * Validates a linkout URL
 */
export async function validateLinkoutUrl(payload: ValidateUrlPayload): Promise<ValidateUrlResponse> {
  try {
    const response = await axiosInstance.post(API_PATHS.LINKOUT_URL_VALIDATE, payload);

    if (!response.data) {
      throw new Error(response.data.message || "Failed to validate URL");
    }

    return { ...response.data, url: payload.url };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to validate linkout URL");
  }
}

/**
 * Custom hook to use the linkout URL validation mutation.
 */
export function useValidateLinkoutUrlMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ValidateUrlResponse) => void;
  onError?: (error: Error) => void;
} = {}) {
  return useMutation({
    mutationFn: validateLinkoutUrl,
    onError,
    onSuccess,
  });
}
