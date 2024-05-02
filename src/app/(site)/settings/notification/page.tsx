'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { Switch } from '@components/ui/switch'
import { useEffect, useState } from 'react'
import { NotificationsSettings, Settings } from '@lib/api/settings'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

export default function Component() {
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

  async function onToggle(value: boolean) {
    try {
      const { status } = await NotificationsSettings({
        roundtable_notification: value,
      })
      if (status) {
        setSettingsData((prevSettingsData) => ({
          ...prevSettingsData,
          roundtable_notification: value,
        }))
      }
    } catch (error) {
      throw new Error()
    }
  }

  return (
    <div>
      <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
        {isMobile && (
          <Link href={PATH_NAME.home()}>
            <Image src={icBack} alt="back" />
          </Link>
        )}
        <p className="text-title-2-bold">Notifications</p>
        <div></div>
      </div>
      {isMobile && <hr className="bg-monochrome-9" />}
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
