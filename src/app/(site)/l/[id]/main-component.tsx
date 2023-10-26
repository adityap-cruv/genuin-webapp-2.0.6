'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import { getAvatarFallback } from '@lib/utils'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import dynamic from 'next/dynamic'
//todo configure loader for dynamic imports
const Cohosts = dynamic(() => import('@components/pages/loop/cohosts').then((comp) => comp.Cohosts))
const HorizontalVideosList = dynamic(() =>
  import('@components/pages/loop/horizontal-video-list').then((comp) => comp.HorizontalVideosList)
)

interface Props {
  loopDetails: LoopDetailsType
}
// todo work on this when api gets updated.
// todo optimize this page load.
export function MainComponent({ loopDetails }: Props) {
  if (loopDetails)
    return (
      <div className="flex h-full w-full flex-col gap-y-2 md:flex-row md:gap-x-2">
        <div className="w-full  md:max-w-[20%]">
          <Avatar className="h-20 w-20 bg-red-40">
            <AvatarImage src={loopDetails.group.dp || undefined} />
            <AvatarFallback>{getAvatarFallback(loopDetails.group.group_name || undefined)}</AvatarFallback>
          </Avatar>
          <p className="line-clamp-1 break-all text-title-lg">{loopDetails.group.group_name}</p>
          <p className="line-clamp-3 break-all text-body-lg">{loopDetails.group.group_description}</p>
          <Stats
            statsData={[
              { key: 'views', value: loopDetails.group.no_of_views },
              { key: 'Videos', value: loopDetails.group.no_of_videos },
              { key: 'Subscribers', value: loopDetails.group.no_of_subscribers },
            ]}
          />
          <div className="flex items-center gap-x-2">
            <Button size="sm">
              <p className="text-title-sm text-monochrome-white">Subscribe</p>
            </Button>
            <Button size="sm" variant="outline" outlineColor="genuin-blue">
              <Image src={icShare} alt="share" height={22} width={22} />
            </Button>
          </div>
        </div>
        <div className="flex w-full flex-col md:max-w-[80%]">
          <HorizontalVideosList loopId={loopDetails.share_string} />
          <Cohosts loopId={loopDetails.share_string} />
        </div>
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
  statsData: { key: string; value: number }[]
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
