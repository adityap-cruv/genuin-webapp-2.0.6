import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";

export const sendGetAppLink = async (
  payload: {
    email?: string;
    mobile?: string;
    query_params?: string;
  },
  axiosInstance: AxiosInstance
) => {
  try {
    const res = await axiosInstance.post(API_PATHS.SEND_DOWNLOAD_APP_LINK, payload);
    return res?.data || null;
  } catch (error) {
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
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (payload: { email?: string; mobile?: string; query_params?: string }) =>
      sendGetAppLink(payload, axiosInstance),
    onError,
    onSuccess,
  });
}
