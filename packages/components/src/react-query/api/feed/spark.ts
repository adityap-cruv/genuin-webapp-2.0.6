import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";

const TYPE_MAPPING = {
  VIDEO: 2,
  COMMENT: 3,
};

/**
 *
 * @param contentId comment/video id
 * @param type video or comment.
 * @param reaction reacted or not.
 * @returns
 */
async function videoReaction(
  {
    contentId,
    type,
    reaction,
  }: {
    contentId: string;
    type: "VIDEO" | "COMMENT";
    reaction: boolean;
  },
  axiosInstance: AxiosInstance
) {
  return await axiosInstance
    .post(API_PATHS.FEED_SPARK, {
      content_id: contentId,
      type: TYPE_MAPPING[type],
      spark: reaction,
    })
    .then((res) => {
      if (res.status === 200) {
        return reaction;
      }
      throw new Error(`Unexpected response status: ${res.status} - ${res.statusText}`);
    })
    .catch((e) => {
      throw new Error(`Failed to ${reaction ? "react" : "unreact"} to content: ${e.message}`);
    });
}

/**
 * Custom hook to handle video sparking (reacting or unreacting).
 * @param param0 - The parameters for the mutation.
 * @returns
 */
export function useVideoReationMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (props: Awaited<ReturnType<typeof videoReaction>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (props: { contentId: string; type: "VIDEO" | "COMMENT"; reaction: boolean }) =>
      videoReaction(props, axiosInstance),
    onSuccess,
    onError,
  });
}
