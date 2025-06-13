import { axiosInstance } from "@react-query/axios-instance";
import { API_PATHS } from "@react-query/paths";
import { useMutation } from "@tanstack/react-query";

export const sendGetAppLink = async (payload: {
  email?: string;
  mobile?: string;
  query_params?: string;
}) => {
  try {
    const res = await axiosInstance.post(
      API_PATHS.SEND_DOWNLOAD_APP_LINK,
      payload
    );
    return res?.data || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error resolving deep link:", error);
    return null;
  }
};

export function useSendGetAppLinkMutation({
  onError,
  onSuccess,
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  return useMutation({
    mutationFn: sendGetAppLink,
    onError,
    onSuccess,
  });
}
