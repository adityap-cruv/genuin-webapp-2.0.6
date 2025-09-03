import { API_PATHS } from "@genuin/components/react-query/paths";
import axios from "axios";

let refreshInProgress: Promise<{
  accessToken: string;
  refreshToken: string;
} | null> | null = null;

export async function refreshTokens(
  updateUser: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>,
  accessToken?: string,
  refreshToken?: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  if (refreshInProgress) return refreshInProgress;

  refreshInProgress = performTokenRefresh(
    updateUser,
    accessToken,
    refreshToken
  ).finally(() => {
    refreshInProgress = null;
  });

  return refreshInProgress;
}

async function performTokenRefresh(
  updateUser: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>,
  accessToken?: string,
  refreshToken?: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  if (!accessToken || !refreshToken || !process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  try {
    const response = await axios
      .create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        timeout: 10000,
      })
      .post(
        API_PATHS.AUTH_REFRESH_TOKEN,
        { "gn-access-token": accessToken },
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
          },
        }
      );

    const newAccessToken = response.headers["gn-access-token"];
    const newRefreshToken = response.headers["gn-refresh-token"];

    if (!newAccessToken || !newRefreshToken) return null;

    await updateUser({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch {
    return null;
  }
}
