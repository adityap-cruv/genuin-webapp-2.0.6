import { useMutation } from "@tanstack/react-query";
import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";
import type { AxiosInstance } from "axios";

export type PayloadDraftPost = {
  aspect_ratio?: string;
  duration?: string;
  resolution?: string;
  size?: string;
  chat_id?: string;
  cv_id?: string;
  video_name?: string;
  thumbnail_name?: string;
  video_thumbnail?: string;
  meta_data?: { contains_external_videos: false; media_type: "video" };

  // optional field
  uuid?: string;
  description_text?: string | null;
  description_data?: string | null;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
  language?: string;
  linkouts?: [
    {
      cta_link: string;
      cta_text: string;
      links?: [
        {
          image: string;
          link: string;
          position: 1;
          title: string;
        },
      ];
    },
  ];
};

//------------------------create draft video------------------------

export async function createDraftVideo(
  payload: PayloadDraftPost,
  axiosInstance: AxiosInstance,
) {
  return await axiosInstance
    .post(API_PATHS.DRAFT_POST, payload)
    .then((res) => ({ res }))
    .catch(() => {
      throw new Error("Failed to draft video");
    });
}

/**
 * Custom hook to use the draft video posts mutation.
 */
export function useCreateDraftVideoMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof createDraftVideo>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (payload: PayloadDraftPost) =>
      createDraftVideo(payload, axiosInstance),
    onError,
    onSuccess,
  });
}

//------------------------edit video draft------------------------

export async function editDraftVideoPatch(
  payload: PayloadDraftPost,
  axiosInstance: AxiosInstance,
) {
  return await axiosInstance
    .patch(API_PATHS.DRAFT_POST, payload)
    .then((res) => ({ res }))
    .catch(() => {
      throw new Error("Failed to draft video");
    });
}

/**
 * Custom hook to use the draft video posts mutation.
 */
export function useEditDraftVideoMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof editDraftVideoPatch>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (payload: PayloadDraftPost) =>
      editDraftVideoPatch(payload, axiosInstance),
    onError,
    onSuccess,
  });
}

//------------------------Get draft video------------------------

export async function getDraftVideo(
  payload: PayloadDraftPost,
  axiosInstance: AxiosInstance,
) {
  return await axiosInstance
    .get(`${API_PATHS.DRAFT_POST}/${payload.uuid}`)
    .then((res) => ({ res }))
    .catch(() => {
      throw new Error("Failed to get draft video");
    });
}

/**
 * Custom hook to use the draft video posts mutation.
 */
export function useGetDraftVideoMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: Awaited<ReturnType<typeof getDraftVideo>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (payload: PayloadDraftPost) =>
      getDraftVideo(payload, axiosInstance),
    onError,
    onSuccess,
  });
}
