'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import { getAvatarFallback } from '@lib/utils'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { getLoopCohosts, getLoopVideos } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import { useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

let loopIdModule: string = ''
interface Props {
  loopDetails: LoopDetailsType
}
// todo work on this when api gets updated.
// todo optimize this page load.
export function MainComponent({ loopDetails }: Props) {
  loopIdModule = loopDetails.share_string
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
          <HorizontalVideosList />
          <Cohosts />
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

// todo we can create hook which accepts containerRef, callback to be called, and direction in which we should call callback.
function HorizontalVideosList() {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getLoopVideos(loopIdModule)
  const { scrollXProgress } = useScroll({ container: divRef })

  useMotionValueEvent(scrollXProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(2)) > 0.8) {
      if (!isFetchingNextPage) fetchNextPage()
    }
  })

  return (
    <div className="relative h-1/3 w-full">
      <div className="h-full w-full overflow-y-hidden overflow-x-scroll scroll-smooth whitespace-nowrap" ref={divRef}>
        {isLoading && <Loader size="md" />}
        {data &&
          data.pages
            .flatMap((page) => page.videos)
            .map((item, index) => {
              return (
                <Link
                  key={index}
                  href={{ pathname: PATH_NAME.video(item.video.share_string), query: { l: item.loop.share_string } }}>
                  <div
                    className="relative mx-1 inline-block duration-300 hover:scale-95"
                    style={{
                      height: divRef.current?.getBoundingClientRect().height,
                      width: (divRef.current?.getBoundingClientRect().height ?? 0) * (9 / 16),
                    }}>
                    <Image
                      src={item.video.thumbnail || ''}
                      alt={item.video.description || ''}
                      className="object-fill"
                      fill
                    />
                    <p className="absolute left-1 top-1 text-title-sm text-monochrome-white">
                      {item.video?.metadata.duration + 's'}
                    </p>
                  </div>
                </Link>
              )
            })}
      </div>
      {hasNextPage && (
        <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-monochrome-white to-transparent opacity-90" />
      )}
    </div>
  )
}

function Cohosts() {
  const { data, isLoading, isError } = getLoopCohosts(loopIdModule)
  return (
    <div className="h-2/3 pt-3">
      <p className="text-title-lg">Co-Hosts</p>
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong...</div>}
      {data && (
        <div className="grid h-full w-full columns-2 grid-cols-2 overflow-auto pb-11 md:grid-cols-3 xl:grid-cols-4">
          {data.members.map((member, index) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(member.nickname) }}>
              <CohostTile
                image={member.profile_image || ''}
                subtitle={member.bio || ''}
                title={'@' + member.nickname}
                userName={member.name ?? 'Un Known'}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

interface CohostTileProps {
  image: string
  title: string
  subtitle: string
  userName: string
}

function CohostTile({ image, title, subtitle, userName }: CohostTileProps) {
  return (
    <div className="relative m-1 h-44 rounded-md border-2  border-secondary duration-300 hover:scale-95 md:h-44 lg:h-52">
      <div className="flex h-full w-full flex-col items-center justify-center p-2">
        <Avatar className="h-20 w-20 bg-red-40">
          <AvatarImage src={image} />
          <AvatarFallback>
            <p className="text-title-xl text-monochrome-white">{getAvatarFallback(userName)}</p>
          </AvatarFallback>
        </Avatar>
        <p className="my-1 line-clamp-1 break-all text-center text-title-sm">{title}</p>
        <p className="line-clamp-3 break-all text-center text-cap-lg lg:line-clamp-4">{subtitle}</p>
      </div>
    </div>
  )
}
