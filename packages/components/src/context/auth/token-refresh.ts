import axios from "axios";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { NEXT_PUBLIC_API_URL } from "@genuin/components/lib/utils/env";

export async function performTokenRefresh(
  accessToken?: string,
  refreshToken?: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  if (!accessToken || !refreshToken || !NEXT_PUBLIC_API_URL) {
    return null;
  }

  try {
    const response = await axios
      .create({
        baseURL: NEXT_PUBLIC_API_URL,
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

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error(String(error));
  }
}

// Utility function to emit refresh failure event
export function emitRefreshFailedEvent(payload?: {
  autoLoginToken?: string;
  brandId?: number;
  params?: any;
}): void {
  if (typeof window !== "undefined" && window.genuin?.emit) {
    try {
      window.genuin.emit("auth:refresh_failed", payload);
    } catch (eventError) {
      console.warn("Failed to emit refresh failed event:", eventError);
    }
  }
}

// Utility function to emit user update event
export function emitCachedUserUpdateEvent(userData: any): void {
  if (typeof window !== "undefined" && window.genuin?.emit) {
    try {
      window.genuin.emit("auth:cached_user_update", userData);
    } catch (eventError) {
      console.warn("Failed to emit user update event:", eventError);
    }
  }
}
