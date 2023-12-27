'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import icQuestion from '@icons/icQuestion.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { TopBar } from './top-bar'
import { getLoopCohosts, getLoopSubscribers, getLoopVideos } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

interface Props {
  loopDetails: LoopDetailsType
}

export function MainComponent({ loopDetails }: Props) {
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })

  if (loopDetails)
    return (
      <>
        <TopBar
          defaultOpen={false}
          isOpen={!detailsInView}
          loopName={loopDetails.group.group_name ?? ''}
          shareString={loopDetails.share_string}
        />
        <main className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto pl-6">
          <span className="w-1/2">
            <p className="mt-6 text-title-xl">{loopDetails.group.group_name}</p>
            <p className="my-2 line-clamp-2 w-1/2 text-body-sm" style={{ fontWeight: 500 }}>
              {loopDetails.group.group_description}
            </p>
            <div className="my-4 w-1/2 rounded-xl border border-monochrome-9 p-4">
              <span className="flex" ref={detailsDivRef}>
                <span className="flex-1">
                  <p className="text-body-sm text-monochrome">Created by</p>
                  <Link href={{ pathname: PATH_NAME.profile(loopDetails.owner.nickname) }}>
                    <div className="my-2 flex items-center">
                      <CustomAvatar
                        fallbackString={loopDetails.owner.name ?? ''}
                        imageUrl={loopDetails.owner.profile_image ?? ''}
                        isAvatar={loopDetails.owner.is_avatar}
                        className="h-8 w-8"
                      />
                      <p className="ml-1 text-title-sm">@{loopDetails.owner.nickname}</p>
                    </div>
                  </Link>
                </span>
                <span className="flex-1">
                  <p className="text-body-sm text-monochrome">Posted in</p>
                  <Link href={{ pathname: PATH_NAME.community(loopDetails.community.handle) }}>
                    <div className="my-2 flex items-center">
                      <CustomAvatar
                        imageUrl={loopDetails.community.dp}
                        fallbackString={loopDetails.community.name}
                        isAvatar={false}
                        className="h-8 w-8"
                      />
                      <p className="ml-1 text-title-sm">{loopDetails.community.name}</p>
                    </div>
                  </Link>
                </span>
              </span>
              <Stats
                statsData={[
                  { key: 'Posts', value: loopDetails.group.no_of_videos },
                  { key: 'Collaborators', value: loopDetails.group.no_of_members },
                  { key: 'Subscribers', value: loopDetails.group.no_of_subscribers },
                ]}
              />
            </div>
            <span className="my-2 flex items-center gap-x-3">
              <Button size="custom">
                <p className="px-4 py-2 text-body-sm" style={{ fontWeight: 500 }}>
                  Subscribe
                </p>
              </Button>
              <Button size="custom" variant="outline" className="border-primary px-4">
                <span className="flex items-center">
                  <Image src={icQuestion} alt="question" />
                  <p className="py-2 text-body-sm text-primary">Q&A</p>
                </span>
              </Button>
              <Button variant="outline" size="custom" className=" border-primary p-1">
                <Image src={icShare} alt="share" className="h-7 w-7" />
              </Button>
            </span>
          </span>
          <div className="grid w-full grid-cols-2 gap-4 overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
            <div className="snap-y snap-proximity overflow-auto scroll-smooth">
              <LoopVideos loopId={loopDetails.share_string} />
            </div>
            <div className="snap-y snap-proximity overflow-auto scroll-smooth py-2">
              <Cohosts chatId={loopDetails.chat_id} />
              <LoopSubscribers chatId={loopDetails.chat_id} />
            </div>
          </div>
        </main>
      </>
    )
}

function LoopVideos({ loopId }: any) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getLoopVideos(loopId)

  const handleSeeMoreClick = () => {
    void fetchNextPage()
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <p className="my-2 text-title-md">Posts</p>
      {isLoading && <Loader size="md" />}
      {data?.pages.flatMap((page) => page.videos).length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="my-4 grid grid-cols-2 gap-4">
        {data?.pages
          .flatMap((page) => page.videos)
          .map((item, index) => (
            <div key={index} className="relative aspect-reel w-full duration-300 hover:cursor-pointer">
              <Image
                src={item.video.thumbnail ?? ''}
                alt={item.video.description ?? ''}
                className="h-full w-full rounded-xl object-fill"
                fill
              />
              {/* <p className="absolute left-2 top-2 text-title-sm text-monochrome-white">
                  {item.video?.metadata.duration + 's'}
                </p> */}
              <div className="absolute bottom-2 left-2">
                <div className="flex h-6 w-6 items-center">
                  <CustomAvatar
                    className="h-full w-full bg-red-40"
                    imageUrl={item.owner.profile_image}
                    isAvatar={item.owner.is_avatar}
                    fallbackString={item.owner.nickname}
                  />
                  <p className="ml-1 text-body-sm text-monochrome-white">@{item.owner.nickname}</p>
                </div>
                <p className="ml-1 line-clamp-2 text-body-sm text-monochrome-white">{item.video.description}</p>
              </div>
            </div>
          ))}
      </div>
      {isFetchingNextPage && <Loader size="md" />}
      {hasNextPage && (
        <p
          className="text-blue-500 flex w-full cursor-pointer justify-center py-4 text-cap-lg text-monochrome"
          onClick={handleSeeMoreClick}>
          See More
        </p>
      )}
    </div>
  )
}

function Cohosts({ chatId }: any) {
  const { data, isLoading, isError } = getLoopCohosts(chatId, 'members')
  const cohosts = data?.users

  return (
    <div>
      <p className="my-2 text-title-md">Collaborators</p>
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong...</div>}
      {cohosts && cohosts.length === 0 && (
        <div className="flex items-center justify-center text-title-md text-secondary">No collaborators yet</div>
      )}
      {cohosts && cohosts.length !== 0 && (
        <div className="h-full w-full overflow-auto">
          {cohosts.map((item: any, index: any) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.user.nickname) }}>
              <CohostTile
                image={item.user.profile_image || ''}
                subtitle={item.user.bio || ''}
                title={'@' + item.user.nickname}
                userName={item.user.name ?? 'Unknown'}
                isAvatar={item.user.is_avatar}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function LoopSubscribers({ chatId }: any) {
  const { data, isLoading, isError } = getLoopSubscribers(chatId, 'subscribers')
  const subscribers = data?.users
  return (
    <div>
      <p className="my-2 text-title-md">Subscribers</p>
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong...</div>}
      {subscribers.length === 0 && (
        <div className="flex items-center justify-center text-title-md text-secondary">No subscribers yet</div>
      )}
      {subscribers && subscribers.length !== 0 && (
        <div className="h-full w-full overflow-auto">
          {subscribers.map((item: any, index: any) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.user.nickname) }}>
              <CohostTile
                image={item.user.profile_image || ''}
                subtitle={item.user.bio || ''}
                title={'@' + item.user.nickname}
                userName={item.user.name ?? 'Unknown'}
                isAvatar={item.user.is_avatar}
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
  isAvatar: boolean
}

function CohostTile({ image, title, subtitle, userName, isAvatar }: CohostTileProps) {
  return (
    <div className="flex items-center gap-x-1 rounded-lg p-2 hover:bg-monochrome-10">
      <CustomAvatar className="h-12 w-12 bg-red-40" fallbackString={userName} imageUrl={image} isAvatar={isAvatar} />
      <div className="mx-2">
        <p className="line-clamp-1 text-body-sm">{title}</p>
        {userName && (
          <p className="line-clamp-1 text-body-sm" style={{ fontWeight: 500 }}>
            {userName}
          </p>
        )}
        {subtitle && (
          <p className="line-clamp-1 text-body-sm text-monochrome-black/60" style={{ fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
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
  statsData: Array<{ key: string; value: number }>
}) {
  return (
    <div className="flex justify-start gap-x-4 pt-3">
      {statsData.map((obj, index) => {
        return (
          <div key={index} className="flex items-center gap-x-1">
            <p className="text-title-lg">{obj.value}</p>
            <p className="text-body-sm text-monochrome" style={{ fontWeight: 500 }}>
              {obj.key}
            </p>
          </div>
        )
      })}
    </div>
  )
}
