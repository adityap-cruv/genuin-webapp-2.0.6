import { API_PATHS } from "../../paths";
import type { AxiosInstance } from "axios";

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
    const response = await axiosInstance.post(API_PATHS.BACKEND_ANALYTICS, {
      event: eventName,
      properties: payload,
    });

    return true;
  } catch (e) {
    // ignore analytics's service error silently
    return false;
  }
}
