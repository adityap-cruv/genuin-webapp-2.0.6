'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { Switch } from '@components/ui/switch'
import { useEffect, useState } from 'react'
import { NotificationsSettings, Settings } from '@lib/api/settings'
import { Loader } from '@components/ui/loader'
import { useRouter } from 'next/navigation'
import Analytics from '@services/analytics'

export default function MainComponent() {
  const isMobile = useGenuinOptions().isMobile
  const [settingsData, setSettingsData] = useState<{ roundtable_notification: boolean } | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await Settings()
        setSettingsData(data)
      } catch (error) {
        throw new Error()
      }
    }
    void fetchSettings()
  }, [])

  if (!settingsData)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )
  if (settingsData)
    return <Notifications settingsData={settingsData} setSettingsData={setSettingsData} isMobile={isMobile} />
}

function Notifications({
  settingsData,
  setSettingsData,
  isMobile,
}: {
  settingsData: { roundtable_notification: boolean }
  setSettingsData: any
  isMobile: boolean
}) {
  const router = useRouter()

  async function onToggle(value: boolean) {
    const { status } = await NotificationsSettings({
      roundtable_notification: value,
    })
    if (status) {
      setSettingsData((prevSettingsData: any) => ({
        ...prevSettingsData,
        roundtable_notification: value,
      }))
      void Analytics.track({
        eventName: 'Notification Settings Modified',
        properties: {},
      })
    }
  }

  return (
    <div>
      <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
        {isMobile && (
          <Image
            src={icBack}
            alt="back"
            onClick={() => {
              router.back()
              void Analytics.track({
                eventName: 'Settings Closed',
                properties: {},
              })
            }}
          />
        )}
        <p className="text-title-2-bold">Notifications</p>
        <div></div>
      </div>
      {isMobile && <hr className="bg-monochrome-black/10" />}
      {settingsData && (
        <div className={`${isMobile ? 'm-4 my-6' : 'mx-8 my-4'} flex items-center justify-between`}>
          <p>Loops</p>
          <Switch
            checked={settingsData.roundtable_notification}
            onCheckedChange={(value) => {
              void onToggle(value)
            }}
          />
        </div>
      )}
    </div>
  )
}
