'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import { generateDeepLink, getLoopAndCommunityShareString, openGeneratedLink, openModal } from '@lib/utils'
import Image from 'next/image'
import icLock from '@icons/icLock.svg'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { getLoopCohosts, subscribeLoop, getLoopSubscribers, getLoopDetails } from '@lib/api/loop'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { TopStickyBar } from '../../../@desktop/loop/[slug]/top-bar'
import { LoopVideos } from './loop-videos'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { ShareIcon } from '@icons/share-icon'
import { useSearchParams } from 'next/navigation'
import Loading from './loading'
import Error from '../../error'
import { Shimmer } from '@components/ui/shimmer'
import { LockIcon } from '@icons/LockIcon'
import { LoopPrivacyInfo } from '@components/common/loop-privacy-info'
import { PrivateModal } from '@components/common/modals/private'
import Analytics from '@services/analytics'

let loopDetailsModule: LoopDetailsType

interface Props {
  loopDetails: LoopDetailsType
}

export function LoopDetails({ slug }: { slug: string }) {
  const { data, isLoading } = getLoopDetails(slug)

  if (isLoading) return <Loading />
  if (data) return <MainComponent loopDetails={data} />
  if (!isLoading && !data) return <Error />
}

// TODO: this page needs to be decoupled.
export function MainComponent({ loopDetails }: Props) {
  loopDetailsModule = loopDetails
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const [isLoopSubscribed, setIsLoopSubscribed] = useState(!!loopDetails.is_subscriber)
  const { embed, user } = useGenuinOptions()
  const searchParams = Object.fromEntries(useSearchParams())

  function toggleLoopSubscription() {
    const newValue = !isLoopSubscribed
    void subscribeLoop(loopDetails.chat_id, newValue).then((res) => {
      if (res.code === 200) {
        setIsLoopSubscribed(newValue)
      }
    })
  }

  const handleSubscribeClick = () => {
    generateDeepLink({
      action: 'subscribe',
      contentType: 'loop',
      description: ldDescription,
      title: loopDetails.group.group_name,
      previewImage: null,
      fromUserName: null,
      pathName: window.location.pathname,
      // sourceId: loopDetails.share_string,
      utmCampaign: 'share',
      utmMedium: 'web',
      utmSource: window.location.hostname,
      community: getLoopAndCommunityShareString(loopDetails.share_url).communityShareString,
      searchParams,
    })
      .then((generatedLink) => {
        openGeneratedLink(generatedLink)
      })
      .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))

    void Analytics.track({
      eventName: `subscription_clicked`,
      properties: {
        loop_id: loopDetails.chat_id,
        loop_slug: loopDetails.slug,
        loop_name: loopDetails.group.group_name ?? '',
      },
    })
  }

  const ldDescription = `${
    loopDetails.group?.group_description !== null &&
    loopDetails.group.group_description !== undefined &&
    loopDetails.group.group_description.replace(/\s+/g, '') !== ''
      ? loopDetails.group.group_description + ' | '
      : ''
  } • Join ${loopDetails.group.group_name} to talk about it`

  return (
    <>
      <TopBar />
      <TopStickyBar.mobile
        defaultOpen={false}
        isOpen={!detailsInView}
        loopName={loopDetails.group.group_name ?? ''}
        shareUrl={loopDetails.share_url}
        communitySlug={loopDetails.community.slug}
        isLoopSubscribed={loopDetails.is_subscriber}
      />
      <div
        className="hide-scrollbar absolute inset-0 mt-navbar flex w-full flex-col gap-y-2 overflow-auto p-4 md:flex-row md:gap-x-2"
        style={{ height: 'calc(100% - 74px)' }}>
        <div className="w-full">
          <div ref={detailsDivRef}>
            <p className="line-clamp-1 text-title-1-bold text-secondary">{loopDetails.group.group_name}</p>
            <LoopPrivacyInfo
              actionId={loopDetails?.actions?.[0]?.action_id ?? 0}
              accessTypeId={loopDetails?.actions?.[0]?.access_type_id ?? 0}
            />
            <p className="my-2 line-clamp-2 break-words text-title-3-demi text-secondary">
              {loopDetails.group.group_description}
            </p>
          </div>
          <div className=" my-3 overflow-hidden rounded-lg border border-solid border-tertiary-200 p-4">
            <div className="flex gap-x-2">
              <div className="flex flex-1 flex-col items-start">
                <p className="text-body-1-demi text-tertiary">Created by</p>
                <Link href={{ pathname: PATH_NAME.profile(loopDetails.owner.username) }}>
                  <div className="my-2 flex items-center">
                    <div className="bg-red-400 h-6 w-6 shrink-0">
                      <CustomAvatar
                        className="h-full w-full"
                        fallbackString={loopDetails.owner.name ?? ''}
                        imageUrl={loopDetails.owner.profile_image ?? ''}
                        isAvatar={loopDetails.owner.is_avatar}
                      />
                    </div>
                    <p className="ml-1 line-clamp-1 break-all text-body-1-bold text-secondary">
                      @{loopDetails.owner.username}
                    </p>
                  </div>
                </Link>
              </div>
              <div className="flex flex-1 flex-col items-start">
                <p className="text-body-1-demi text-tertiary">Posted in</p>
                {/* todo change to community data */}
                <Link href={{ pathname: PATH_NAME.community(loopDetails.community.slug) }}>
                  <div className="my-2 flex items-center">
                    <div className="bg-red-400 h-6 w-6 shrink-0">
                      <CustomAvatar
                        className="h-full w-full"
                        imageUrl={loopDetails.community.dp ?? ''}
                        fallbackString={loopDetails.community.name ?? ''}
                        isAvatar={false}
                      />
                    </div>
                    <p className="ml-1 line-clamp-1 break-all text-body-1-bold text-secondary">
                      {loopDetails.community.name}
                    </p>
                    {loopDetails.community.type === 2 && (
                      <>
                        <PrivateModal>
                          <LockIcon className="ml-1 h-4 w-4 stroke-tertiary" />
                        </PrivateModal>
                      </>
                    )}
                  </div>
                </Link>
              </div>
            </div>
            <Stats
              statsData={[
                { key: 'Post', value: loopDetails.group.no_of_videos ?? 0 },
                { key: 'Collaborator', value: loopDetails.group.no_of_members ?? 0 },
                { key: 'Subscribers', value: loopDetails.group.no_of_subscribers ?? 0 },
              ]}
            />
          </div>

          <div className="flex items-center gap-x-2">
            {loopDetails.is_view_allowed && !embed && (
              <Button size="custom" onClick={handleSubscribeClick}>
                <p className="px-4 py-1 text-title-3-demi text-monochrome-white">Subscribe</p>
              </Button>
            )}
            {loopDetails.is_view_allowed && embed && (
              <Button
                size="custom"
                className={`${isLoopSubscribed && 'border border-primary '}`}
                variant={isLoopSubscribed ? 'outline' : 'default'}
                onClick={
                  user
                    ? () => {
                        toggleLoopSubscription()
                      }
                    : () => {
                        openModal({
                          title: 'Get the Genuin app',
                          subtitle: (
                            <>
                              Get the app to subscribe to
                              <span className="font-bold"> {loopDetails.group.group_name}</span> Loop.
                            </>
                          ),
                        })
                      }
                }>
                <p className={`px-4 py-1 text-title-3-demi ${isLoopSubscribed && 'text-primary'}`}>
                  {isLoopSubscribed ? 'Subscribed' : 'Subscribe'}
                </p>
              </Button>
            )}

            {!loopDetails.is_view_allowed && (
              <Button
                size="custom"
                variant="outline"
                className="border border-primary"
                onClick={() => {
                  generateDeepLink({
                    contentType: 'loop',
                    description: ldDescription,
                    title: loopDetails.group.group_name,
                    previewImage: null,
                    fromUserName: null,
                    pathName: window.location.pathname,
                    // sourceId: loopDetails.share_string,
                    utmCampaign: 'share',
                    utmMedium: 'web',
                    utmSource: window.location.hostname,
                    community: getLoopAndCommunityShareString(loopDetails.share_url).communityShareString,
                    searchParams,
                  })
                    .then((generatedLink) => {
                      openGeneratedLink(generatedLink)
                    })
                    .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                }}>
                <p className="px-4 py-1 text-title-3-bold text-primary" style={{ fontSize: '15px' }}>
                  Join as collaborator
                </p>
              </Button>
            )}

            {/* Hidden by requirement. */}
            {/* <Button size="custom" variant="outline" className="border-primary px-4">
                <span className="flex items-center">
                  <Image src={icQuestion} alt="question" />
                  <p className="py-2 text-body-1-demi text-primary">Q&A</p>
                </span>
              </Button> */}

            <Button
              variant="outline"
              size="custom"
              className="border border-primary p-0.5"
              onClick={async () => {
                const currentURL = new URL(loopDetails.share_url)
                currentURL.searchParams.set('utm_source', 'app_web')
                await shareFn({
                  shareLink: currentURL.href,
                  toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                })
              }}>
              <ShareIcon className="h-6 w-6 fill-primary" />
            </Button>
          </div>
        </div>
        <hr className="border-t border-tertiary-200" />
        {!loopDetails.is_view_allowed ? (
          <div
            className="mt-4 flex w-full items-center justify-center overflow-hidden"
            style={{ height: 'calc(100% - 220px)' }}>
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 rounded-full bg-tertiary-200 p-6">
                <Image src={icLock} alt="share" className="h-16 w-16" />
              </div>
              <p className="text-center text-title-2-demi">
                This Loop is visible to its
                <br /> Collaborators only
              </p>
            </div>
          </div>
        ) : (
          <LoopTabs />
        )}
      </div>
    </>
  )
}

function LoopTabs() {
  return (
    <Tabs defaultValue="Loops">
      <TabsList className="sticky flex max-w-min">
        <TabsTrigger value="Loops">
          <p className="text-title-3-bold">Posts</p>
        </TabsTrigger>
        <TabsTrigger value="About">
          <p className="text-title-3-bold">Collaborators</p>
        </TabsTrigger>
        <TabsTrigger value="Members">
          <p className="text-title-3-bold">Subscribers</p>
        </TabsTrigger>
      </TabsList>
      <hr className="border-t border-tertiary-200" />
      <TabsContent value="Loops">
        <LoopVideos
          community={{
            handle: loopDetailsModule.community.handle,
            shareUrl: loopDetailsModule.community.share_url ?? '',
            id: loopDetailsModule.community.community_id,
            slug: loopDetailsModule.community.slug,
            name: loopDetailsModule.community.name,
          }}
          loop={{
            id: loopDetailsModule.chat_id,
            slug: loopDetailsModule.slug,
            name: loopDetailsModule.group.group_name,
          }}
        />
      </TabsContent>
      <TabsContent value="About">
        <LoopCollaborators slug={loopDetailsModule.slug} />
      </TabsContent>
      <TabsContent value="Members">
        <LoopSubscribers slug={loopDetailsModule.slug} />
      </TabsContent>
    </Tabs>
  )
}

// TODO: Add pagination in this component
function LoopCollaborators({ slug }: { slug: string }) {
  const { data, isLoading } = getLoopCohosts(slug)
  const cohosts = data?.pages.flatMap((item) => item.members)

  if (isLoading)
    return (
      <>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="m-2 flex items-center justify-center">
            <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
            <div className="ml-2 w-full">
              <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
              <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
              <Shimmer className="my-1 h-4 w-full rounded-full" />
            </div>
          </div>
        ))}
      </>
    )

  if (!cohosts || cohosts.length === 0)
    return (
      <div className="flex h-full w-full items-center justify-center pt-32 text-title-3-bold text-tertiary">
        No collaborators yet
      </div>
    )

  return (
    <div className="h-full pt-3">
      <div className="h-full w-full overflow-auto">
        {cohosts.map((item, index) => {
          if (!item.nickname)
            return (
              <CohostTile
                image={item.profile_image}
                subtitle={item.bio ?? ''}
                title={'+' + item.phone ?? ''}
                userName={item.name ?? ''}
                isAvatar={item.is_avatar}
              />
            )
          return (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.nickname) }}>
              <CohostTile
                image={item.profile_image}
                subtitle={item.bio ?? ''}
                title={'@' + item.nickname}
                userName={item.name ?? ''}
                isAvatar={item.is_avatar}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// TODO: Add pagination in this component
function LoopSubscribers({ slug }: any) {
  const { data, isLoading } = getLoopSubscribers(slug)
  const subscribers = data?.pages.flatMap((item) => item.subscribers)

  if (isLoading)
    return (
      <>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="m-2 flex items-center justify-center">
            <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
            <div className="ml-2 w-full">
              <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
              <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
              <Shimmer className="my-1 h-4 w-full rounded-full" />
            </div>
          </div>
        ))}
      </>
    )

  if (!subscribers || subscribers.length === 0)
    return (
      <div className="flex h-full w-full items-center justify-center pt-32 text-title-3-bold text-tertiary">
        No subscribers yet
      </div>
    )

  return (
    <div className="h-full pt-3">
      <div className="h-full w-full overflow-auto">
        {subscribers.map((item, index) => (
          <Link key={index} href={{ pathname: PATH_NAME.profile(item.nickname) }}>
            <CohostTile
              image={item.profile_image}
              subtitle={item.bio ?? ''}
              title={'@' + item.nickname}
              userName={item.name ?? ''}
              isAvatar={item.is_avatar}
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
            <p className="mr-1 text-title-2-bold">{obj.value}</p>
            <p className="mr-4 text-body-1-demi">{obj.key}</p>
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
    <div className="flex items-center gap-x-1 rounded-lg p-2">
      <CustomAvatar className="h-12 w-12 bg-red-40" fallbackString={title} imageUrl={image} isAvatar={isAvatar} />
      <div className="mx-2">
        <p className="line-clamp-1 text-body-1-bold">{title}</p>
        {userName && <p className="line-clamp-1 text-body-1-demi">{userName}</p>}
        {subtitle && <p className="line-clamp-1 text-cap-1-demi text-tertiary">{subtitle}</p>}
      </div>
    </div>
  )
}
