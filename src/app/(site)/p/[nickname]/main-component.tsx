'use client'
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { abbreviateNumber, generateDeepLink, getAvatarFallback, openGeneratedLink } from '@lib/utils'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icMessage from '@icons/icMessage.svg'
import icShare from '@icons/icShareBlue.svg'
import { useResponsive } from '@hooks/useResponsive'
import dynamic from 'next/dynamic'
import { DownloadDialog } from '@components/common/download-dialog'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
const ProfileTabs = dynamic(() =>
  import('@components/pages/profile/tabs/profile-tabs').then((comp) => comp.ProfileTabs)
)
const NavBar = dynamic(() => import('@components/common/nav-bar').then((comp) => comp.NavBar))

interface CompProps {
  profileData: any
  isMobile: any
}

export const MainComponent = ({ profileData, isMobile }: CompProps) => {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const { isMd = !isMobile } = useResponsive()
  return (
    <>
      <NavBar variant="light" />
      <div className="container mt-body flex h-body w-full flex-col overflow-auto overflow-x-clip md:flex-row md:overflow-clip ">
        <div className="mx-2 my-3 w-full md:w-1/3">
          <div className="flex items-center">
            <Avatar className="bg-slate-500 h-20 w-20">
              <AvatarImage src={profileData?.profile_image}></AvatarImage>
              <AvatarFallback>{getAvatarFallback(profileData?.name)}</AvatarFallback>
            </Avatar>
            <div className="w-full">{!isMd && <Stats profileData={profileData} />}</div>
          </div>
          <p className="line-clamp-1 text-title-lg">@{profileData?.nickname}</p>
          <p className="line-clamp-5 text-body-lg">{profileData?.bio || ''}</p>
          {isMd && <Stats profileData={profileData} />}
          {/* //todo change button layout */}
          <div className="my-2">
            {isMobile ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  outlineColor="genuin-blue"
                  onClick={() => {
                    generateDeepLink({
                      action: 'dm',
                      contentType: 'profile',
                      description: profileData?.bio,
                      pathName: window.location.pathname,
                      previewImage: null,
                      sourceId: profileData?.nickname,
                      title: profileData?.nickname,
                      utmCampaign: 'share',
                      utmMedium: 'web',
                      utmSource: window.location.hostname,
                      fromUserName: null,
                    })
                      .then((generatedLink) => openGeneratedLink(generatedLink))
                      .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                  }}>
                  <Image src={icMessage} alt="messsage" className="pr-1" />
                  <p className="text-title-sm text-primary">Message</p>
                </Button>
              </>
            ) : (
              <>
                <DownloadDialog title="Get the Genuin app" subtitle="Get the app to Message" asChild={false}>
                  <Button variant="outline" size="sm" outlineColor="genuin-blue">
                    <Image src={icMessage} alt="messsage" className="pr-1" />
                    <p className="text-title-sm text-primary">Message</p>
                  </Button>
                </DownloadDialog>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              outlineColor="genuin-blue"
              className="mx-2"
              onClick={() =>
                shareFn({
                  shareLink: window.location.href,
                  toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                })
              }>
              <Image src={icShare} alt="share" height={22} width={22} />
            </Button>
          </div>
        </div>
        {profileData && <ProfileTabs />}
      </div>
      <Toaster />
    </>
  )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="m-1 ml-0 flex justify-evenly p-1 pl-0">
      <div>
        <p className="text-title-lg">{abbreviateNumber(profileData?.views) || 0}</p>
        <p className="text-cap-lg text-secondary">Views</p>
      </div>
      <div>
        <p className="text-title-lg">{abbreviateNumber(profileData?.videos) || 0}</p>
        <p className="text-cap-lg text-secondary">Videos</p>
      </div>
      <div>
        <p className="text-title-lg">{abbreviateNumber(profileData?.replies) || 0}</p>
        <p className="text-cap-lg text-secondary">Replies</p>
      </div>
    </div>
  )
}
