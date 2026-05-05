import type { AxiosInstance } from "axios";

import { API_PATHS } from "@genuin/components/react-query/paths";

type NotificationType = {
  conversation_alarm_notification?: boolean | null;
  message_notification?: boolean | null;
  roundtable_notification?: boolean;
};

export async function notificationsSettings(
  payload: Partial<NotificationType>,
  axios: AxiosInstance
): Promise<{ status: boolean; data: any }> {
  return await axios
    .patch(API_PATHS.UPDATE_NOTIFICATION_SETTINGS, payload)
    .then((res) => {
      return { status: res.status === 200, data: res.data.data };
    })
    .catch((_e) => {
      throw new Error();
    });
}
