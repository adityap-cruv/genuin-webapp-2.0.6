'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import { generateDeepLink, openGeneratedLink } from '@lib/utils'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { Toaster } from '@components/ui/toaster'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { getLoopCohosts, getLoopVideos } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import { PlayerModal } from '@components/common/player-modal'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'

let loopDetailsModule: LoopDetailsType

interface Props {
  loopDetails: LoopDetailsType
}

// todo this page needs to be decoupled.
export function Mobile({ loopDetails }: Props) {
  loopDetailsModule = loopDetails
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
          <p className="line-clamp-1 text-title-xl">{loopDetails.group.group_name}</p>
          <p className="line-clamp-3 py-2 text-body-lg">{loopDetails.group.group_description}</p>

          <div className=" my-3 rounded border-solid p-4" style={{ border: '1px solid grey' }}>
            <div className="flex">
              <div className="flex flex-1 flex-col items-start">
                <p className="text-body-sm text-secondary">Created by</p>
                <Link href={{ pathname: PATH_NAME.profile(loopDetails.owner.nickname) }}>
                  <div className="my-2 flex items-center">
                    <div className="bg-red-400 h-6 w-6">
                      <CustomAvatar
                        className="h-full w-full"
                        fallbackString={loopDetails.owner.name ?? ''}
                        imageUrl={loopDetails.owner.profile_image ?? ''}
                        isAvatar={loopDetails.owner.is_avatar}
                      />
                    </div>
                    <p className="ml-1 text-title-sm">@{loopDetails.owner.name}</p>
                  </div>
                </Link>
              </div>
              <div className="flex flex-1 flex-col items-start">
                <p className="text-body-sm text-secondary">Posted in</p>
                {/* todo change to community data */}
                <Link href={{ pathname: PATH_NAME.community(loopDetails.community.handle) }}>
                  <div className="my-2 flex items-center">
                    <div className="bg-red-400 h-6 w-6">
                      <CustomAvatar
                        className="h-full w-full"
                        imageUrl={loopDetails.community.dp}
                        fallbackString={loopDetails.community.name}
                        isAvatar={false}
                      />
                    </div>
                    <p className="ml-1 text-title-sm">{loopDetails.community.name}</p>
                  </div>
                </Link>
              </div>
            </div>
            <Stats
              statsData={[
                { key: 'Post', value: loopDetails.group.no_of_videos },
                { key: 'Collaborator', value: loopDetails.group.no_of_members },
                { key: 'Subscribers', value: loopDetails.group.no_of_subscribers },
              ]}
            />
          </div>

          <div className="flex items-center gap-x-2">
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

            <Button size="sm">
              <p className="text-title-sm text-monochrome-white">Join as Collaborator</p>
            </Button>

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

        <LoopTabs />
        <Toaster />
      </div>
    )
}

function LoopTabs() {
  return (
    <Tabs defaultValue="Loops">
      <TabsList className="sticky flex max-w-min">
        <TabsTrigger value="Loops">
          <p className="text-title-md">Posts</p>
        </TabsTrigger>
        <TabsTrigger value="About">
          <p className="text-title-md">Collaborators</p>
        </TabsTrigger>
        <TabsTrigger value="Members">
          <p className="text-title-md">Subscribers</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Loops">
        <HorizontalVideosList loopId={loopDetailsModule.share_string} />
      </TabsContent>
      <TabsContent value="About">
        <Cohosts loopId={loopDetailsModule.share_string} />
      </TabsContent>
      <TabsContent value="Members">
        <LoopSubscribers loopId={loopDetailsModule.share_string} />
      </TabsContent>
    </Tabs>
  )
}

function LoopSubscribers({ loopId }: any) {
  const { data, isLoading, isError } = getLoopCohosts(loopDetailsModule.chat_id, 'subscribers')
  return (
    <div className="h-full pt-3">
      {isLoading && <Loader className="pt-32" size="md" />}
      {isError && <div>Something went wrong...</div>}
      {data && data.length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No subscribers yet</div>
      )}
      {data && data.length !== 0 && (
        <div className="h-full w-full overflow-auto">
          {data.map((item: any, index: any) => (
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
    <div className="mt-2 flex justify-start">
      {statsData.map((obj, index) => {
        return (
          <div key={index} className="flex items-center">
            <p className="mr-1 text-title-lg">{obj.value}</p>
            <p className="mr-4 text-body-sm text-secondary">{obj.key}</p>
          </div>
        )
      })}
    </div>
  )
}

// todo check where is divRef.
function HorizontalVideosList({ loopId }: { loopId: string }) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getLoopVideos(loopId)
  const { scrollYProgress } = useScroll({ container: divRef })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(2)) > 0.8) {
      if (!isFetchingNextPage) void fetchNextPage()
    }
  })

  return (
    <div className="relative mt-4 h-full w-full">
      {isLoading && <Loader className="pt-32" size="md" />}
      {data?.pages.flatMap((page) => page.videos).length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {data?.pages
          .flatMap((page) => page.videos)
          .map((item, index) => (
            <PlayerModal key={index} videoDetails={item}>
              <div
                className="relative duration-300 hover:scale-95"
                style={{
                  height: '320px',
                  // width: '169px'
                }}>
                <Image
                  src={item.video.thumbnail ?? ''}
                  alt={item.video.description ?? ''}
                  className="h-full w-full rounded-xl object-fill"
                  fill
                />
                {/* <p className="absolute left-2 top-2 text-title-sm text-monochrome-white">
                    {item.video?.metadata.duration + 's'}
                  </p> */}
                <div className="bg-red-400 absolute bottom-2 left-2 flex h-6 w-6 items-center">
                  <CustomAvatar
                    className="h-full w-full bg-red-40"
                    imageUrl={item.owner.profile_image}
                    isAvatar={item.owner.is_avatar}
                    fallbackString={item.owner.nickname}
                  />
                  <p className="ml-1 text-body-sm text-monochrome-white">@{item.owner.nickname}</p>
                </div>
              </div>
            </PlayerModal>
          ))}
      </div>
      {hasNextPage && (
        <div className="botom-0 absolute z-10 h-2 w-full bg-gradient-to-l from-monochrome-white to-transparent opacity-90" />
      )}
    </div>
  )
}

function Cohosts({ loopId }: { loopId: string }) {
  const { data, isLoading, isError } = getLoopCohosts(loopDetailsModule.chat_id, 'members')
  return (
    <div className="h-full pt-3">
      {isLoading && <Loader className="pt-32" size="md" />}
      {isError && <div>Something went wrong...</div>}
      {data && data.length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No collaborators yet</div>
      )}
      {data && data.length !== 0 && (
        <div className="h-full w-full overflow-auto">
          {data.map((item: any, index: any) => (
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
    <div className="flex items-center gap-x-1 rounded-sm p-1 hover:bg-monochrome-9">
      <CustomAvatar className="h-12 w-12 bg-red-40" fallbackString={userName} imageUrl={image} isAvatar={isAvatar} />
      <div className="mx-2">
        <p className="line-clamp-1 text-title-sm">{title}</p>
        {userName && <p className="line-clamp-1 text-title-sm">{userName}</p>}
        {subtitle && <p className="line-clamp-1 text-cap-lg text-monochrome-black/60">{subtitle}</p>}
      </div>
    </div>
  )
}
