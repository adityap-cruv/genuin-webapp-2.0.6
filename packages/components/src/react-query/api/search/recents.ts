import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { validateRecentsResponse } from "./types";
import { getQueryKeyForRecents } from "../../keys/search";

// Shared constants for recent search content types
export const RECENT_SEARCH_CONTENT_TYPE: Record<
  "text" | "community" | "loop" | "user" | "video",
  number
> = {
  community: 3,
  loop: 4,
  text: 1,
  user: 2,
  video: 5,
};

export async function fetchRecents() {
  try {
    const response = await axiosInstance.get(API_PATHS.SEARCH_RECENT);
    return validateRecentsResponse(response?.data?.data?.recent_searches);
  } catch (error) {
    throw new Error("Something went wrong in recent searches API.");
  }
}

export function useRecents() {
  return useQuery({
    queryKey: getQueryKeyForRecents(),
    queryFn: fetchRecents,
  });
}

export async function deleteRecent(id?: string, all?: boolean) {
  try {
    const response = await axiosInstance.delete(API_PATHS.SEARCH_RECENT, {
      params: { id, delete_all: all },
    });

    const resData: any = response.data;
    if (resData.code !== 200) {
      throw new Error("Something went wrong while deleting recent search.");
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function useDeleteRecent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, all }: { id?: string; all?: boolean }) =>
      deleteRecent(id, all),
    onSuccess: () => {
      // Invalidate and refetch recents
      queryClient.invalidateQueries({ queryKey: getQueryKeyForRecents() });
    },
  });
}

// This is low priority api - no need to handle error and success strictly
export function postRecents(type: number, id?: string, text?: string) {
  const response = axiosInstance.post(API_PATHS.SEARCH_RECENT, {
    type,
    text,
    search_content_id: id,
  });

  response
    .then((res) => {
      // Handle success if needed
    })
    .catch((e) => {
      // Silent fail for this low priority endpoint
    });

  return response;
}
