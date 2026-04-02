import { API_PATHS } from "@genuin/components/react-query/paths";
import type { AxiosInstance } from "axios";

type FeedbackType = {
  email?: string | null;
  message?: string | null;
  type?: string;
};

export type { FeedbackType };

export async function feedback(
  payload: Partial<FeedbackType>,
  axios: AxiosInstance
): Promise<{ status: boolean; data: any }> {
  return await axios
    .post(API_PATHS.CONTACT_US, payload)
    .then((res) => {
      return { status: res.status === 200, data: res.data.data };
    })
    .catch((e) => {
      throw new Error(
        `Failed to accept guidelines: ${e.response?.data?.message || "Unknown error"}`
      );
    });
}
