import { Switch } from '@/components/ui/switch'
import {
  getUserSettings,
  NotificationType,
  updateNotificationSettings,
} from '../api'
import { Loader } from '@/components/loader'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/context/react-query'
import { getQueryKeyForUserSettings } from '@/utils/constants/keys'
import { useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Analytics } from '@/analytics'

export function NotificationSwitch() {
  const { data: notificationSettings, isLoading, isError } = getUserSettings()
  const { mutate: mutateNotificationSettings, isPending: isMutating } =
    useMutation({
      mutationFn: updateNotificationSettings,
    })

  const handleCheckedChange = useCallback((value: boolean) => {
    const payload = {
      roundtable_notification: value,
    }
    mutateNotificationSettings(payload, {
      onSuccess: async (res) => {
        if (res) {
          updateNotificationSettingsInClient(payload)

          if (value) {
            toast({
              description: 'Group Notifications have been turned on.',
            })
          } else {
            toast({
              description: 'Group Notifications have been turned off.',
            })
          }
          Analytics.track(Analytics.EventNames.NotificationSettingsModified)
        }
      },
      onError: () => {
        toast({
          description:
            'Something went wrong. Please try again after some time.',
        })
      },
    })
  }, [])

  if (isLoading || isMutating) return <Loader className='h-4 w-4' />

  if (isError || !notificationSettings) return

  return (
    <Switch
      checked={notificationSettings.roundtable_notification}
      onCheckedChange={handleCheckedChange}
    />
  )
}

function updateNotificationSettingsInClient(
  payload: Partial<NotificationType>,
) {
  type QueryData = ReturnType<typeof getUserSettings>['data']
  queryClient.setQueryData<QueryData>(
    getQueryKeyForUserSettings(),
    (oldData: QueryData) => {
      if (!oldData) return
      return {
        ...oldData,
        roundtable_notification: payload.roundtable_notification ?? false,
      }
    },
  )
}
