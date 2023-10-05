'use client'
import { useEffect } from 'react'
import { NavBar } from '@components/common/nav-bar'
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { getAvatarFallback } from '@lib/utils'
import { useProfileStore } from '@components/states/profile/profileState'
import { ProfileTabs } from '@components/pages/profile/tabs/profile-tabs'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icMessage from '@icons/icMessage.svg'
import icShare from '@icons/icShare.svg'
import { useResponsive } from '@hooks/useResponsive'
import { isMobile } from 'react-device-detect'

interface CompProps {
  profileData: any
}

export const MainComponent = ({ profileData }: CompProps) => {
  const setProfileData: any = useProfileStore((state) => state.setProfileData)
  const { isMd = !isMobile } = useResponsive()

  useEffect(() => {
    setProfileData(profileData)
  }, [profileData])

  return (
    <>
      <NavBar variant="light" />
      <div className="container mt-body flex h-body w-full flex-col overflow-auto overflow-x-clip md:flex-row md:overflow-clip ">
        <div className="mx-2 my-3 w-full md:w-1/3">
          <div className="flex items-center">
            <Avatar className="h-20 w-20 bg-slate-500">
              <AvatarImage src={profileData?.profile_image}></AvatarImage>
              <AvatarFallback>{getAvatarFallback(profileData?.name)}</AvatarFallback>
            </Avatar>
            <div className="w-full">{!isMd && <Stats />}</div>
          </div>
          <p className="line-clamp-1 text-title-lg">@{profileData?.nickname}</p>
          <p className="line-clamp-5 text-body-lg">{profileData?.bio || ''}</p>
          {isMd && <Stats />}
          <div className="my-2">
            <Button variant="outline" size="sm" outlineColor="genuin-blue">
              <Image src={icMessage} alt="messsage" className="pr-1" />
              <p className="text-title-sm text-primary">Message</p>
            </Button>
            <Button variant="outline" size="sm" outlineColor="genuin-blue" className="mx-2">
              <Image src={icShare} alt="share" height={22} width={22} />
            </Button>
          </div>
        </div>
        <ProfileTabs />
      </div>
    </>
  )
}

// todo create function to normalize the count
function Stats() {
  return (
    <div className="m-1 ml-0 flex justify-evenly p-1 pl-0">
      <div>
        <p className="text-title-lg">3.3k</p>
        <p className="text-cap-lg text-secondary">Views</p>
      </div>
      <div>
        <p className="text-title-lg">3.3k</p>
        <p className="text-cap-lg text-secondary">Videos</p>
      </div>
      <div>
        <p className="text-title-lg">3.3k</p>
        <p className="text-cap-lg text-secondary">Replies</p>
      </div>
    </div>
  )
}
