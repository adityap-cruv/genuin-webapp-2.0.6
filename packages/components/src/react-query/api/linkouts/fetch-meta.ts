import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";

type PayloadFetchMetaPost = {
  url: string;
};

export async function fetchMetaPost(payload: PayloadFetchMetaPost, axiosInstance: AxiosInstance) {
  return await axiosInstance
    .post(API_PATHS.FETCH_META_DATA, payload)
    .then((res) => ({ res }))
    .catch(() => {
      throw new Error("Failed to fetch meta data");
    });
}

/**
 * Custom hook to use the fetch meta data posts mutation.
 */
export function usePostFetchMetaMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof fetchMetaPost>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (payload: PayloadFetchMetaPost) => fetchMetaPost(payload, axiosInstance),
    onError,
    onSuccess,
  });
}
