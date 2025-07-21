import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";


type NotificationType = {
  conversation_alarm_notification?: boolean | null
  message_notification?: boolean | null
  roundtable_notification?: boolean
}

export async function notificationsSettings(
  payload: Partial<NotificationType>
): Promise<{ status: boolean; data: any }> {
  return await axiosInstance
    .patch(API_PATHS.UPDATE_NOTIFICATION_SETTINGS, payload)
    .then((res) => {
      return { status: res.status === 200, data: res.data.data }
    })
    .catch((e) => {
      throw new Error()
    })
}
