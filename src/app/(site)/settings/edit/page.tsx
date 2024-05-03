'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { fetchUserData } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import { useEffect, useState } from 'react'
import { type ProfileDetailsType } from '@lib/schemas/profile/profile'
import { Toaster } from '@components/ui/toaster'
import { EditProfile } from './edit-profile'

export default function Component() {
  const { isMobile, user } = useGenuinOptions((state) => ({ isMobile: state.isMobile, user: state.user }))
  const [profileData, setProfileData] = useState<ProfileDetailsType | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await fetchUserData(user?.nickname ?? '')
        setProfileData(data)
      } catch (error) {
        throw new Error()
      }
    }
    void fetchSettings()
  }, [])

  if (!profileData)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )
  if (profileData)
    return (
      <>
        <EditProfile profileData={profileData} isMobile={isMobile} />
        <Toaster />
      </>
    )
}
