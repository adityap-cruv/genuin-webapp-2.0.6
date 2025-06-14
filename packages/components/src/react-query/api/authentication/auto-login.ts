import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { useMutation } from "@tanstack/react-query";

async function getUrlToRedirectForSSO({
  thirdPartyId,
}: {
  thirdPartyId: "google" | "apple" | string;
}) {
  try {
    const res = await axiosInstance.get(API_PATHS.AUTH_GET_REDIRECTION_URL, {
      params: {
        thirdPartyId,
        redirectURIOnProviderDashboard:
          "https://nodejs.qa.begenuin.com/api/v4/thirdparty/callback",
      },
    });
    return res.data.data.url;
  } catch (e) {
    throw new Error("Something went wrong, please try again later");
  }
}

/**
 * Mutation hook to get the redirection URL for SSO (Single Sign-On).
 * @param param0 - onSuccess: Callback function to handle success response with the redirection URL.
 * @returns
 */
export function useGetRedirectionUrlForSSOMutation({
  onSuccess,
  onError,
}: {
  onSuccess: (url: string) => void;
  onError: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: getUrlToRedirectForSSO,
    onSuccess,
    onError,
  });
}
