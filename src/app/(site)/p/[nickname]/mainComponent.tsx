'use client'
import { useEffect } from 'react'
import { NavBar } from './navBar'
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { getAvatarFallback } from '@lib/utils'
import { TabIcons } from '@components/profile/tabIcons'
import { useProfileStore } from '@components/states/profile/profileState'
import { VideosTab } from '@components/profile/videosTab'
import { ProfileTabs } from '@components/profile/tabs/profileTabs'

interface CompProps {
  profileData: any
}

export const MainComponent = ({ profileData }: CompProps) => {
  const setProfileData: any = useProfileStore((state) => state.setProfileData)

  useEffect(() => {
    setProfileData(profileData)
  }, [profileData])

  return <Desktop />
}

const Desktop = () => {
  const profileData: any = useProfileStore((state) => state.profileData)
  return (
    <>
      <NavBar />
      <div className="container flex h-full w-full flex-col md:flex-row">
        <div className="w-full pt-2 md:w-[30%]">
          <Avatar className="bg-slate-500 h-20 w-20">
            <AvatarImage src={profileData.profile_image}></AvatarImage>
            <AvatarFallback>{getAvatarFallback(profileData?.name)}</AvatarFallback>
          </Avatar>
          <p className="line-clamp-1 text-title-lg">@{profileData.nickname}</p>
          <p className="line-clamp-5 text-body-lg">{profileData.bio || ''}</p>
        </div>
        <ProfileTabs />
      </div>
    </>
  )
}
