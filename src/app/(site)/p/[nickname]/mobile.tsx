import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar'
import { getAvatarFallback, abbreviateNumber, generateDeepLink, openGeneratedLink } from '@lib/utils'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icMessage from '@icons/icMessage.svg'
import icShare from '@icons/icShareBlue.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import dynamic from 'next/dynamic'
import { Loader } from '@components/ui/loader'
const NavBar = dynamic(async () => await import('@components/common/nav-bar').then((comp) => comp.NavBar))
const ProfileTabs = dynamic(
  async () => await import('@components/pages/profile/tabs/profile-tabs').then((comp) => comp.ProfileTabs),
  {
    loading({ isLoading }) {
      return <Loader size="md" />
    },
  }
)

interface CompProps {
  profileData: any
}

export function Mobile({ profileData }: CompProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  return (
    <>
      <NavBar variant="light" />
      <div className="my-3 mt-body h-body w-full">
        <div className="px-2">
          <div className="flex w-full items-center justify-between">
            <Avatar className="bg-slate-500 h-20 w-20 bg-red-40">
              <AvatarImage src={profileData?.profile_image}></AvatarImage>
              <AvatarFallback className="text-white text-title-lg">
                {getAvatarFallback(profileData?.name)}
              </AvatarFallback>
            </Avatar>
            <Stats profileData={profileData} />
          </div>
          <p className="line-clamp-1 pt-2 text-title-lg">@{profileData?.nickname}</p>
          <p className="line-clamp-5 pb-2 text-body-lg">{profileData?.bio || ''}</p>
          <div className="my-2">
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
                  .then((generatedLink) => {
                    openGeneratedLink(generatedLink)
                  })
                  .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
              }}>
              <Image src={icMessage} alt="messsage" className="pr-1" />
              <p className="text-title-sm text-primary">Message</p>
            </Button>
            {/* todo create deep link for this share button */}
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
    </>
  )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="flex w-full justify-between pl-4">
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
