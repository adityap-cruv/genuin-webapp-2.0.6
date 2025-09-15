import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";

export async function deleteDrafts(postIds: string[]) {
  return await axiosInstance
    .delete(API_PATHS.DELETE_DRAFT, {
      data: {
        draft_video_ids: postIds,
      },
    })
    .then(() => {
      return "Drafts deleted successfully";
    })
    .catch((e) => {
      throw new Error("Failed to delete drafts");
    });
}

/**
 * Custom hook to use the delete drafts mutation.
 */
export function useDeleteDraftsMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: deleteDrafts,
    onError,
    onSuccess,
  });
}
