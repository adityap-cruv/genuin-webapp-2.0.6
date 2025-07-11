import { getDeviceId } from "@genuin/components/lib/utils/device-id";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { useMutation } from "@tanstack/react-query";
import { LOGIN_SOURCE } from "./constants";
import { encryptText } from "@genuin/components/lib/utils/encryption";
import { parseUserData } from "./parser";
import { NEXT_PUBLIC_REDIRECT_URI } from "@genuin/components/lib/utils/env";

const DEVICE_TYPE_WEB = 3;

async function getUrlToRedirectForSSO({
  thirdPartyId,
}: {
  thirdPartyId: "google" | "apple" | string;
}) {
  try {
    // TODO: Update the redirect URI to a dynamic one if needed
    const res = await axiosInstance.get(API_PATHS.AUTH_GET_REDIRECTION_URL, {
      params: {
        thirdPartyId,
        redirectURIOnProviderDashboard: NEXT_PUBLIC_REDIRECT_URI,
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

/**
 * Get user data for SSO (Single Sign-On).
 * @param code - The authorization code received from the provider.
 * @param provider - The name of the provider (e.g., "google", "apple").
 * @returns A promise that resolves to the user data or undefined.
 */
export async function getUserDataForSSO({
  code,
  provider,
}: {
  code: string;
  provider: string;
}) {
  const deviceId = getDeviceId();
  // TODO: Update the deviceId to a dynamic one if needed
  return await axiosInstance
    .post(API_PATHS.AUTH_AUTO_LOGIN, {
      encrypted_device_id: encryptText(deviceId, true),
      login_source: LOGIN_SOURCE.web,
      // login source is web according to backend.
      device_type: DEVICE_TYPE_WEB,
      thirdPartyId: provider,
      redirectURIInfo: {
        redirectURIOnProviderDashboard: NEXT_PUBLIC_REDIRECT_URI,
        redirectURIQueryParams: {
          code,
        },
      },
    })
    .then((res) => {
      const accessToken = res.headers["gn-access-token"];
      const refreshToken = res.headers["gn-refresh-token"];
      const data = res.data.data;
      const user = data
        ? parseUserData(data, accessToken, refreshToken)
        : undefined;
      return { user };
    })
    .catch((e) => {
      console.error("Error in getUserDataForSSO:", e);
      throw new Error("Something went wrong, please try again later");
    });
}

/**
 * Hook to get user data for SSO (Single Sign-On).
 * @param param0 - onSuccess: Callback function to handle success response with user data.
 * @returns
 */
export function useGetUserDataForSSOMutation({
  onSuccess,
  onError,
}: {
  onSuccess: (props: Awaited<ReturnType<typeof getUserDataForSSO>>) => void;
  onError: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: getUserDataForSSO,
    onSuccess,
    onError,
  });
}
