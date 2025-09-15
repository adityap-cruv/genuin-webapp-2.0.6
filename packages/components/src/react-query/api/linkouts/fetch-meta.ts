import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";

type PayloadFetchMetaPost = {
    url: string
}

export async function fetchMetaPost(payload: PayloadFetchMetaPost) {
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
  return useMutation({
    mutationFn: fetchMetaPost,
    onError,
    onSuccess,
  });
}