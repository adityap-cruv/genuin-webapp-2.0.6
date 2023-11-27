'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import { generateDeepLink, getAvatarFallback, openGeneratedLink } from '@lib/utils'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import dynamic from 'next/dynamic'
import { DownloadDialog } from '@components/common/download-dialog'
import { Toaster } from '@components/ui/toaster'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { isMobile } from 'react-device-detect'
// todo configure loader for dynamic imports
const Cohosts = dynamic(async () => await import('@components/pages/loop/cohosts').then((comp) => comp.Cohosts))
const HorizontalVideosList = dynamic(
  async () => await import('@components/pages/loop/horizontal-video-list').then((comp) => comp.HorizontalVideosList)
)

interface Props {
  loopDetails: LoopDetailsType
}

export function Desktop({ loopDetails }: Props) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const ldDescription = `${
    loopDetails.group?.group_description !== null &&
    loopDetails.group.group_description !== undefined &&
    loopDetails.group.group_description.replace(/\s+/g, '') !== ''
      ? loopDetails.group.group_description + ' | '
      : ''
  } • Join ${loopDetails.group.group_name} to talk about it`

  if (loopDetails)
    return (
      <div className="flex h-full w-full flex-col gap-y-2 md:flex-row md:gap-x-2">
        <div className="w-full  md:max-w-[20%]">
          <div className="flex items-center">
            <Avatar className="h-20 w-20 bg-red-40">
              <AvatarImage src={loopDetails.group.dp ?? undefined} />
              <AvatarFallback>
                <p className="text-title-xl text-new-off-white">
                  {getAvatarFallback(loopDetails.group.group_name ?? undefined)}
                </p>
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="line-clamp-1 text-title-lg">{loopDetails.group.group_name}</p>
          <p className="line-clamp-3 text-body-lg">{loopDetails.group.group_description}</p>
          <Stats
            statsData={[
              { key: 'views', value: loopDetails.group.no_of_views },
              { key: 'Videos', value: loopDetails.group.no_of_videos },
              { key: 'Subscribers', value: loopDetails.group.no_of_subscribers },
            ]}
          />
          <div className="flex items-center gap-x-2">
            {isMobile ? (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    generateDeepLink({
                      action: 'subscribe',
                      contentType: 'loop',
                      description: ldDescription,
                      title: loopDetails.group.group_name,
                      previewImage: null,
                      fromUserName: null,
                      pathName: window.location.pathname,
                      sourceId: loopDetails.share_string,
                      utmCampaign: 'share',
                      utmMedium: 'web',
                      utmSource: window.location.hostname,
                    })
                      .then((generatedLink) => {
                        openGeneratedLink(generatedLink)
                      })
                      .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                  }}>
                  <p className="text-title-sm text-monochrome-white">Subscribe</p>
                </Button>
              </>
            ) : (
              <>
                <DownloadDialog title="Get the Genuin app" subtitle="Get the app to Subscribe" asChild={false}>
                  <Button size="sm">
                    <p className="text-title-sm text-monochrome-white">Subscribe</p>
                  </Button>
                </DownloadDialog>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              outlineColor="genuin-blue"
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
        <div className="flex w-full flex-col md:max-w-[80%]">
          <HorizontalVideosList loopId={loopDetails.share_string} />
          <Cohosts loopId={loopDetails.share_string} />
        </div>
        <Toaster />
      </div>
    )
}

function Stats({
  statsData,
}: {
  /**
   * Here statsData accept array of object in which you pass key the statTitle, and
   * value which accepts value of stat
   */
  statsData: Array<{ key: string; value: number }>
}) {
  return (
    <div className="m-1 ml-0 flex justify-between p-1 pl-0">
      {statsData.map((obj, index) => {
        return (
          <div key={index} className="flex flex-col items-center">
            <p className="text-title-lg">{obj.value}</p>
            <p className="text-cap-lg text-secondary">{obj.key}</p>
          </div>
        )
      })}
    </div>
  )
}
