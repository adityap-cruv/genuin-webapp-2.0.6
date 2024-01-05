'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import { generateDeepLink, openGeneratedLink } from '@lib/utils'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { getLoopCohosts, getLoopSubscribers } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { TopStickyBar } from '../../../@desktop/loop/[slug]/top-bar'
import { LoopVideos } from './loop-videos'

let loopDetailsModule: LoopDetailsType

interface Props {
  loopDetails: LoopDetailsType
}

// todo this page needs to be decoupled.
export function MainComponent({ loopDetails }: Props) {
  loopDetailsModule = loopDetails
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
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
      <>
        <TopBar />
        <TopStickyBar.mobile
          defaultOpen={false}
          isOpen={!detailsInView}
          loopName={loopDetails.group.group_name ?? ''}
          shareString={loopDetails.share_string}
          communitySlug={loopDetails.community.slug}
        />
        <div className="hide-scrollbar absolute inset-0 mt-navbar flex h-full w-full flex-col gap-y-2 overflow-auto p-4 md:flex-row md:gap-x-2">
          <div className="w-full">
            <div ref={detailsDivRef}>
              <p className="line-clamp-1 text-title-xl">{loopDetails.group.group_name}</p>
              <p className="my-2 line-clamp-2 break-words text-body-lg">{loopDetails.group.group_description}</p>
            </div>
            <div className=" my-3 rounded-lg border border-solid border-monochrome-9 p-4">
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
                      <p className="ml-1 text-title-sm">@{loopDetails.owner.nickname}</p>
                    </div>
                  </Link>
                </div>
                <div className="flex flex-1 flex-col items-start">
                  <p className="text-body-sm text-secondary">Posted in</p>
                  {/* todo change to community data */}
                  <Link href={{ pathname: PATH_NAME.community(loopDetails.community.slug) }}>
                    <div className="my-2 flex items-center">
                      <div className="bg-red-400 h-6 w-6">
                        <CustomAvatar
                          className="h-full w-full"
                          imageUrl={loopDetails.community.dp ?? ''}
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
                size="custom"
                onClick={() => {
                  generateDeepLink({
                    action: 'subscribe',
                    contentType: 'loop',
                    description: ldDescription,
                    title: loopDetails.group.group_name,
                    previewImage: null,
                    fromUserName: null,
                    pathName:
                      window.location.pathname +
                      `?community_id=${loopDetails.community.share_string}&utm_source=app_web`,
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
                <p className="px-4 py-1 text-title-3-demi">Subscribe</p>
              </Button>

              {/* Hidden by requirement. */}
              {/* <Button size="custom" variant="outline" className="border-primary px-4">
                <span className="flex items-center">
                  <Image src={icQuestion} alt="question" />
                  <p className="py-2 text-body-sm text-primary">Q&A</p>
                </span>
              </Button> */}

              <Button
                variant="outline"
                size="custom"
                className="border border-primary p-0.5"
                onClick={async () => {
                  const currentURL = new URL(window.location.href)
                  currentURL.searchParams.set('community_id', `${loopDetails.community.share_string}`)
                  currentURL.searchParams.set('utm_source', 'app_web')
                  await shareFn({
                    shareLink: currentURL.href,
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }}>
                <Image src={icShare} alt="share" className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <LoopTabs />
        </div>
      </>
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
      <hr className="border-t border-monochrome-9" />
      <TabsContent value="Loops">
        <LoopVideos slug={loopDetailsModule.chat_slug} />
      </TabsContent>
      <TabsContent value="About">
        <LoopCollaborators slug={loopDetailsModule.chat_slug} />
      </TabsContent>
      <TabsContent value="Members">
        <LoopSubscribers slug={loopDetailsModule.chat_slug} />
      </TabsContent>
    </Tabs>
  )
}

function LoopCollaborators({ slug }: { slug: string }) {
  const { data, isLoading } = getLoopCohosts(slug, 'members')
  const cohosts = data?.users

  if (isLoading) return <Loader className="pt-32" size="md" />

  if (cohosts && cohosts.length === 0)
    return (
      <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No collaborators yet</div>
    )

  if (cohosts && cohosts.length !== 0)
    return (
      <div className="h-full pt-3">
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
      </div>
    )
}

function LoopSubscribers({ slug }: any) {
  const { data, isLoading } = getLoopSubscribers(slug, 'subscribers')
  const subscribers = data?.users

  if (isLoading) return <Loader className="pt-32" size="md" />

  if (subscribers && subscribers.length === 0)
    return <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No subscribers yet</div>

  if (subscribers && subscribers.length !== 0)
    return (
      <div className="h-full pt-3">
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
      <CustomAvatar className="h-12 w-12 bg-red-40" fallbackString={title} imageUrl={image} isAvatar={isAvatar} />
      <div className="mx-2">
        <p className="line-clamp-1 text-body-1-bold">{title}</p>
        {userName && <p className="line-clamp-1 text-body-1-demi">{userName}</p>}
        {subtitle && <p className="line-clamp-1 text-cap-1-demi text-monochrome-black/60">{subtitle}</p>}
      </div>
    </div>
  )
}
