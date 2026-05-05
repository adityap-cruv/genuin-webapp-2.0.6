import axios from "axios";

import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";
import { NEXT_PUBLIC_API_URL } from "@genuin/components/lib/utils/env";
import { API_PATHS } from "@genuin/components/react-query/paths";

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
export function emitRefreshFailedEvent(payload?: { token?: string; brandId: number; params?: any }): void {
  SDKEventEmitter.emit(SDKEventName.AUTH_REFRESH_FAILED, payload || {});
}

// Utility function to emit user update event
export function emitCachedUserUpdateEvent(userData: any): void {
  SDKEventEmitter.emit(SDKEventName.CACHED_USER_UPDATE, userData);
}
