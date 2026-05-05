import type { AxiosInstance } from "axios";

import { API_PATHS } from "../../paths";

export async function sendAnalyticsToBackend({
  eventName,
  payload,
  axiosInstance,
}: {
  eventName: string;
  payload: Record<string, unknown>;
  axiosInstance: AxiosInstance;
}) {
  try {
    const _response = await axiosInstance.post(API_PATHS.BACKEND_ANALYTICS, {
      event: eventName,
      properties: payload,
    });

    return true;
  } catch (_e) {
    // ignore analytics's service error silently
    return false;
  }
}
