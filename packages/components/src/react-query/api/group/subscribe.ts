import { axiosInstance } from "@react-query/axios-instance";
import { API_PATHS } from "@react-query/paths";
import { useMutation } from "@tanstack/react-query";

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
}) {
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
  return useMutation({
    mutationFn: postSubscribeLoop,
    onError,
    onSuccess,
  });
}
