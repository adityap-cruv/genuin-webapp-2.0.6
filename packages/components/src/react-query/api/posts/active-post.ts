import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { PayloadDraftPost } from "./video-draft";


//------------------------Move draft to active video------------------------

export async function videoPost(payload: PayloadDraftPost) {
  return await axiosInstance
    .post(API_PATHS.DRAFT_TO_ACTIVE_POST, payload)
    .then((res) => ({ res }))
    .catch(() => {
      throw new Error("Failed to draft video");
    });
}

/**
 * Custom hook to use the edit draft video posts mutation.
 */
export function usePostVideoMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof videoPost>>) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: videoPost,
    onError,
    onSuccess,
  });
}


//------------------------Get active video------------------------

export async function getActiveVideo(payload: PayloadDraftPost) {
  return await axiosInstance
    .get(`${API_PATHS.ACTIVE_POST}/${payload.uuid}`)
    .then((res) => ({ res }))
    .catch(() => {
      throw new Error("Failed to get draft video");
    });
}

/**
 * Custom hook to use the draft video posts mutation.
 */
export function useGetActiveVideoMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof getActiveVideo>>) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: getActiveVideo,
    onError,
    onSuccess,
  });
}

//------------------------Edit active video------------------------

export async function editActiveVideo(payload: PayloadDraftPost) {
  return await axiosInstance
    .patch(API_PATHS.EDIT_ACTIVE_POST, payload)
    .then((res) => ({ res }))
    .catch(() => {
      throw new Error("Failed to get draft video");
    });
}

/**
 * Custom hook to use the draft video posts mutation.
 */
export function useEditActiveVideoMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof editActiveVideo>>) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: editActiveVideo,
    onError,
    onSuccess,
  });
}
