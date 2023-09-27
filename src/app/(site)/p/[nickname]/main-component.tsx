'use client'
import { useEffect } from 'react'
import { NavBar } from './nav-bar'
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { getAvatarFallback } from '@lib/utils'
import { useProfileStore } from '@components/states/profile/profileState'
import { ProfileTabs } from '@components/profile/tabs/profile-tabs'

interface CompProps {
  profileData: any
}

export const MainComponent = ({ profileData }: CompProps) => {
  const setProfileData: any = useProfileStore((state) => state.setProfileData)
  // const profileData: any = useProfileStore((state) => state.profileData)

  useEffect(() => {
    setProfileData(profileData)
  }, [profileData])

  return (
    <>
      <NavBar />
      <div className="container mt-body flex h-body w-full flex-col overflow-clip md:flex-row">
        <div className="mx-2 my-3 w-full md:w-1/3">
          <Avatar className="bg-slate-500 h-20 w-20">
            <AvatarImage src={profileData?.profile_image}></AvatarImage>
            <AvatarFallback>{getAvatarFallback(profileData?.name)}</AvatarFallback>
          </Avatar>
          <p className="line-clamp-1 text-title-lg">@{profileData?.nickname}</p>
          <p className="line-clamp-5 text-body-lg">{profileData?.bio || ''}</p>
        </div>
        <div className="h-full w-full">
          <ProfileTabs />
        </div>
      </div>
    </>
  )
}
