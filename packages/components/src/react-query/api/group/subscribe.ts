import { useMutation } from "@tanstack/react-query";
import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";
import type { AxiosInstance } from "axios";

/**
 * Function to subscribe or unsubscribe from a group.
 * @param params - Object containing chatId and subscribe parameters.
 * @param params.chatId - The UUID of the group to subscribe or unsubscribe from.
 * @param params.subscribe - Whether to subscribe or unsubscribe from the group.
 * @returns
 */
async function postSubscribeLoop({
  chatId,
  subscribe,
}: {
  chatId: string;
  subscribe: boolean;
}, axiosInstance: AxiosInstance) {
  return await axiosInstance
    .post(API_PATHS.GROUP_SUBSCRIBE, {
      chat_id: chatId,
      subscribe,
    })
    .then(() => {
      return subscribe;
    })
    .catch((e) => {
      throw new Error(
        e.response?.data?.message || "Failed to subscribe to group"
      );
    });
}

/**
 * Custom hook to use the subscribe mutation for a group.
 * @param onSuccess - Callback function to execute on successful subscription.
 * @param onError - Callback function to execute on error.
 * @returns Mutation object for subscribing or unsubscribing from a group.
 */
export function useSubscribeGroupMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (params: Awaited<ReturnType<typeof postSubscribeLoop>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (params: { chatId: string; subscribe: boolean }) => postSubscribeLoop(params, axiosInstance),
    onError,
    onSuccess,
  });
}
