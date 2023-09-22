'use client'
import { useProfileStore } from '@/components/states/profileState'
import { useEffect } from 'react'
import { NavBar } from './navBar'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CompProps {
  mobile: boolean
  profileData: any
}

export const MainComponent = ({ mobile, profileData }: CompProps) => {
  const setProfileData: any = useProfileStore((state) => state.setProfileData)

  useEffect(() => {
    setProfileData(profileData)
  }, [profileData])

  return false ? <Mobile /> : <Desktop />
}

const Mobile = () => {
  return <div>Output from main Component from mobile.</div>
}

const Desktop = () => {
  const profileData: any = useProfileStore((state) => state.profileData)
  console.log('data::', profileData)
  return (
    <>
      <NavBar />
      <div className="container flex h-full w-full bg-blue-70">
        <div className="w-[25%] pt-2">
          <Avatar className="h-20 w-20 bg-slate-500">
            <AvatarImage src={profileData.profile_image}></AvatarImage>
            <AvatarFallback>{}</AvatarFallback> // todo figure-out fallback
          </Avatar>
          <p className="text-title-lg">@{profileData.nickname}</p>
          <p className="text-body-lg">{profileData.bio}</p>
        </div>
        <div className="w-full pl-10">
          <Tabs defaultValue="all">
            <TabsList className="flex w-full">
              <TabsTrigger value="all">all</TabsTrigger>
              <TabsTrigger value="public">public</TabsTrigger>
              <TabsTrigger value="loop">loop</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div>This is for all</div>
            </TabsContent>
            <TabsContent value="public">
              <div>This is for public</div>
            </TabsContent>
            <TabsContent value="loop">
              <div>this is for loop</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
