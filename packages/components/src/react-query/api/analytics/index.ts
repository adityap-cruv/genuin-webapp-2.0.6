import { axiosInstance } from "../../axios-instance";
import { API_PATHS } from "../../paths";

export async function sendAnalyticsToBackend({
  eventName,
  payload,
}: {
  eventName: string;
  payload: Record<string, unknown>;
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
