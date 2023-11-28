import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { getAvatarFallback, abbreviateNumber } from '@lib/utils'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icMessage from '@icons/icMessage.svg'
import icShare from '@icons/icShareBlue.svg'
import { DownloadDialog } from '@components/common/download-dialog'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import dynamic from 'next/dynamic'
import { NavBar } from '@components/common/nav-bar'
const ProfileTabs = dynamic(
  async () => await import('@components/pages/profile/tabs/profile-tabs').then((comp) => comp.ProfileTabs)
)

interface CompProps {
  profileData: any
}

export function Desktop({ profileData }: CompProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  return (
    <>
      <NavBar variant="light" isMobile={false} />
      <div className="mt-body flex h-body w-full flex-col overflow-auto overflow-x-clip md:container md:flex-row md:overflow-clip ">
        <div className="my-3 w-full px-2 md:w-1/3 md:px-0">
          <div className="flex w-full items-center justify-between md:flex-col md:items-start">
            <Avatar className="bg-slate-500 h-20 w-20 bg-red-40">
              <AvatarImage src={profileData?.profile_image} />
              <AvatarFallback className="text-white text-title-lg">
                {getAvatarFallback(profileData?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="mx-4 block md:hidden">
              <Stats profileData={profileData} />
            </div>
          </div>
          <p className="line-clamp-1 pt-2 text-title-lg">@{profileData?.nickname}</p>
          <p className="line-clamp-5 pb-2 text-body-lg">{profileData?.bio || ''}</p>
          <div className="hidden md:block">
            <Stats profileData={profileData} />
          </div>
          <div className="my-2">
            <DownloadDialog title="Get the Genuin app" subtitle="Get the app to Message" asChild={true}>
              <Button variant="outline" size="sm" outlineColor="genuin-blue">
                <Image src={icMessage} alt="messsage" className="pr-1" />
                <p className="text-title-sm text-primary">Message</p>
              </Button>
            </DownloadDialog>
            <Button
              variant="outline"
              size="sm"
              outlineColor="genuin-blue"
              className="mx-2"
              onClick={async () =>
                await shareFn({
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
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-10 p-1 pl-0">
      <div className="flex flex-col items-center">
        <p className="text-title-lg">{abbreviateNumber(profileData?.views) || 0}</p>
        <p className="text-cap-lg text-secondary">Views</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-title-lg">{abbreviateNumber(profileData?.videos) || 0}</p>
        <p className="text-cap-lg text-secondary">Videos</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-title-lg">{abbreviateNumber(profileData?.replies) || 0}</p>
        <p className="text-cap-lg text-secondary">Replies</p>
      </div>
    </div>
  )
}
