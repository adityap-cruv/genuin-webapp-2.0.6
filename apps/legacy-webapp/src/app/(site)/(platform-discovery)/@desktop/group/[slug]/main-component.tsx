'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import Image from 'next/image'
import icLock from '@icons/icLock.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { TopStickyBar } from './top-bar'
import { getLoopCohosts, getLoopDetails } from '@lib/api/loop'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { ListItem } from '@components/common/list-item'
import { LoopVideos } from './loop-videos'
import { Toaster } from '@components/ui/toaster'
import { openModal } from '@lib/utils'
import Loading from './loading'
import Error from '../../error'
import { Shimmer } from '@components/ui/shimmer'
import { LockIcon } from '@icons/LockIcon'
import { LoopPrivacyInfo } from '@components/common/loop-privacy-info'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import BrandBadgeIcon from '@/components/common/brand-badge-icon'
import { useSearchParams } from 'next/navigation'
import { joinAsCollaboratorDeepLink } from '@/lib/get-deeplink'
import { ReadMore } from '@/components/common/read-more'
import { NOT_FOUND_ERROR_CODES } from '@/lib/constants'
import EmptyView from '@/components/common/empty-view'
import ShareButton from '@/components/common/actions/share-button'
import SubscriptionButton from '@/components/common/actions/subscription-button'
import { getAudioUrlForCommunity, useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKeyForLoopDetails } from '@/lib/utils/react-query/keys'

interface Props {
  loopDetails: LoopDetailsType
}

export function LoopDetails({ slug }: { slug: string }) {
  const { data, isLoading, error } = getLoopDetails(slug)
  const { shouldShowIHeartDemo, setAudioUrl } = useIHeartDemoStates()

  useEffect(() => {
    if (!shouldShowIHeartDemo) return
    if (!data) return
    const communitySlug = (data as LoopDetailsType).community.slug
    const audioUrl = getAudioUrlForCommunity(communitySlug)
    if (!audioUrl) return
    setAudioUrl(audioUrl)
  }, [shouldShowIHeartDemo, data])

  if (isLoading) return <Loading />

  if (error) {
    if ((error as Error).message === NOT_FOUND_ERROR_CODES.group) {
      return <EmptyView type="group" />
    } else {
      return <Error />
    }
  }
  if (data) return <MainComponent loopDetails={data} />
}

// TODO: Improve this component.
export function MainComponent({ loopDetails }: Props) {
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef as React.RefObject<HTMLElement>, { amount: 0.6 })
  const searchParams = Object.fromEntries(useSearchParams())
  const queryClient = useQueryClient()

  const ldDescription = `${
    loopDetails.group?.group_description !== null &&
    loopDetails.group.group_description !== undefined &&
    loopDetails.group.group_description.replace(/\s+/g, '') !== ''
      ? loopDetails.group.group_description + ' | '
      : ''
  } • Join ${loopDetails.group.group_name} to talk about it`

  return (
    <>
      <TopStickyBar.desktop
        defaultOpen={false}
        isOpen={!detailsInView}
        loopName={loopDetails.group.group_name ?? ''}
        shareUrl={loopDetails.share_url}
        communitySlug={loopDetails.community.slug}
        isSubscribed={loopDetails.is_subscriber}
        ldDescription={ldDescription}
        slug={loopDetails.slug}
        chatId={loopDetails.chat_id}
      />
      <main className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto pl-6">
        <div className="mt-6 flex justify-between">
          <p className="text-title-1-bold text-secondary">{loopDetails.group.group_name}</p>
          <div className="flex items-center gap-x-3">
            {loopDetails.is_view_allowed && (
              <SubscriptionButton
                isSubscribed={loopDetails.is_subscriber}
                chatId={loopDetails.chat_id}
                groupName={loopDetails.group.group_name ?? ''}
                ldDescription={ldDescription}
                shareUrl={loopDetails.share_url}
                slug={loopDetails.slug}
                key={loopDetails.chat_id}
                onSuccess={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: getQueryKeyForLoopDetails(loopDetails.slug),
                    type: 'all',
                  })
                }}
              />
            )}

            {!loopDetails.is_view_allowed && (
              <Button
                size="custom"
                variant="outline"
                className="border-primary border"
                onClick={async () => {
                  await joinAsCollaboratorDeepLink({ ldDescription, loopDetails, searchParams }).then(
                    (generatedLink) => {
                      openModal({
                        deepLink: generatedLink,
                        subtitle: (
                          <>
                            Download app to Join as Member to
                            <span className="font-bold"> {loopDetails.group.group_name}</span> Group.
                          </>
                        ),
                      })
                    }
                  )
                }}>
                <p className="text-title-3-bold text-primary px-4 py-1" style={{ fontSize: '15px' }}>
                  Join as Member
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

            <ShareButton url={loopDetails.share_url} />
          </div>
        </div>
        <LoopPrivacyInfo
          actionId={loopDetails?.actions?.[0]?.action_id ?? 0}
          accessTypeId={loopDetails?.actions?.[0]?.access_type_id ?? 0}
        />
        <span className="w-1/2">
          <ReadMore.dynamic
            position="outside"
            text={loopDetails.group.group_description ?? ''}
            maxLines={2}
            className="text-body-1-med text-secondary my-1 w-1/2 break-words"
          />
          <div className="border-tertiary-200 my-3 w-1/2 rounded-xl border p-4">
            <span className="flex gap-x-2" ref={detailsDivRef}>
              <span className="flex-1">
                <p className="text-cap-1-demi text-tertiary">Created by</p>
                <Link
                  href={{
                    pathname: loopDetails.owner.brand?.brand_slug
                      ? PATH_NAME.brand(loopDetails.owner.brand.brand_slug)
                      : PATH_NAME.profile(loopDetails.owner.username),
                  }}>
                  <div className="my-2 flex items-center gap-1">
                    <CustomAvatar
                      fallbackString={loopDetails.owner.name ?? ''}
                      imageUrl={loopDetails.owner.profile_image ?? ''}
                      isAvatar={loopDetails.owner.is_avatar}
                      className="h-8 w-8"
                    />
                    <p className="text-body-1-bold text-secondary line-clamp-1 break-all">
                      @{loopDetails.owner.username}
                    </p>
                    {loopDetails.owner.brand && (
                      <BrandBadgeIcon userLogoType={loopDetails.owner.brand?.brand_user_logo ?? 1} variant="dark" />
                    )}
                  </div>
                </Link>
              </span>
              <span className="flex-1">
                <p className="text-cap-1-demi text-tertiary">Posted in</p>
                <div className="my-2 flex items-center">
                  <Link href={{ pathname: PATH_NAME.community(loopDetails.community.slug) }}>
                    <div className="flex items-center">
                      <CustomAvatar
                        imageUrl={loopDetails.community.dp ?? ''}
                        fallbackString={loopDetails.community.name ?? ''}
                        isAvatar={false}
                        className="h-8 w-8"
                      />
                      <p className="text-body-1-bold text-secondary ml-1 line-clamp-1 break-all">
                        {loopDetails.community.name}
                      </p>
                    </div>
                  </Link>
                  {loopDetails.community.type === 2 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <LockIcon className="stroke-tertiary z-10 ml-1 h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-monochrome-black w-64">
                          <p className="text-cap-1-med text-monochrome-white text-center">
                            This community is private. Only people approved by it's moderators can see and participate
                            in this community.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </span>
            </span>
            <Stats
              statsData={[
                { key: 'Posts', value: loopDetails.group.no_of_videos ?? 0 },
                { key: 'Members', value: loopDetails.group.no_of_members ?? 0 },
                // { key: 'Subscribers', value: loopDetails.group.no_of_subscribers ?? 0 },
              ]}
            />
          </div>
        </span>

        {!loopDetails.is_view_allowed ? (
          <div
            className="mt-4 flex w-full items-center justify-center overflow-hidden"
            style={{ height: 'calc(100% - 320px)', backgroundColor: '#F9F9F9' }}>
            <div className="flex flex-col items-center justify-center">
              <Image src={icLock} alt="share" className="h-16 w-16" />
              <p className="text-title-2-demi text-center">
                This Group is visible to its
                <br /> Members only
              </p>
            </div>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-4 overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
            <div className="h-full snap-y snap-proximity overflow-auto scroll-smooth">
              <LoopVideos slug={loopDetails.slug} />
            </div>
            <div className="snap-y snap-proximity overflow-auto scroll-smooth py-2">
              <LoopCohosts slug={loopDetails.slug} />
            </div>
          </div>
        )}

        <Toaster />
      </main>
    </>
  )
}

// TODO: think about pagination
function LoopCohosts({ slug }: { slug: string }) {
  const { data, isLoading } = getLoopCohosts(slug)
  const cohosts = data?.pages.flatMap((item: any) => item.members)

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

  if (cohosts && cohosts.length !== 0)
    return (
      <div>
        <p className="text-title-3-bold my-2">Members</p>
        <div className="h-full w-full overflow-auto">
          {cohosts.map((item, index) => {
            if (!item.nickname)
              return (
                <ListItem
                  key={index}
                  title={item.name ?? ''}
                  subtitle={'+' + item.phone}
                  description={item.bio ?? ''}
                  image={item.profile_image_m ?? item.profile_image}
                  isAvatar={item.is_avatar}
                  brand={item.brand ? { ...item.brand, brand_user_logo: item.brand.brand_user_logo ?? 1 } : null}
                  isOwner={false}
                />
              )
            return (
              <Link
                key={index}
                href={{
                  pathname: item.brand ? PATH_NAME.brand(item.brand.brand_slug) : PATH_NAME.profile(item.nickname),
                }}>
                <ListItem
                  title={item.name ?? ''}
                  subtitle={'@' + item.nickname}
                  description={item.bio ?? ''}
                  image={item.profile_image_m ?? item.profile_image}
                  isAvatar={item.is_avatar}
                  brand={item.brand ? { ...item.brand, brand_user_logo: item.brand.brand_user_logo ?? 1 } : null}
                  isOwner={false}
                />
              </Link>
            )
          })}
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
            <p className="text-title-2-bold text-secondary">{obj.value}</p>
            <p className="text-body-1-med text-tertiary">{obj.key}</p>
          </div>
        )
      })}
    </div>
  )
}
