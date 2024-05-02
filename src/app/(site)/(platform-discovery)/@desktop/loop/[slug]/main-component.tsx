'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import Image from 'next/image'
import icLock from '@icons/icLock.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { TopStickyBar } from './top-bar'
import { getLoopCohosts, getLoopDetails, getLoopSubscribers, subscribeLoop } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { ListItem } from '@components/common/list-item'
import { LoopVideos } from './loop-videos'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { openModal } from '@lib/utils'
import { ShareIcon } from '@icons/share-icon'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import Loading from './loading'
import Error from '../../error'
import { Shimmer } from '@components/ui/shimmer'

interface Props {
  loopDetails: LoopDetailsType
}

export function LoopDetails({ slug }: { slug: string }) {
  const { data, isLoading } = getLoopDetails(slug)

  if (isLoading) return <Loading />
  if (data) return <MainComponent loopDetails={data} />
  if (!isLoading && !data) return <Error />
}

// TODO: Improve this component.
export function MainComponent({ loopDetails }: Props) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const [isLoopSubscribed, setIsLoopSubscribed] = useState(!!loopDetails.is_subscriber)
  const user = useGenuinOptions().user

  function toggleLoopSubscription() {
    const newValue = !isLoopSubscribed
    void subscribeLoop(loopDetails.chat_id, newValue).then((res) => {
      if (res.code === 200) {
        setIsLoopSubscribed(newValue)
      }
    })
  }

  return (
    <>
      <TopStickyBar.desktop
        defaultOpen={false}
        isOpen={!detailsInView}
        loopName={loopDetails.group.group_name ?? ''}
        shareUrl={loopDetails.share_url}
        communitySlug={loopDetails.community.slug}
        chatId={loopDetails.chat_id}
        isLoopSubscribed={isLoopSubscribed}
        toggleSuscription={toggleLoopSubscription}
      />
      <main className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto pl-6">
        <div className="mt-6 flex justify-between">
          <p className="text-title-1-bold text-secondary">{loopDetails.group.group_name}</p>
          <div className="flex items-center gap-x-3">
            {loopDetails.is_view_allowed && (
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
                  openModal({
                    title: 'Get the Genuin app',
                    subtitle: (
                      <>
                        Get the app to Join as collaborator to
                        <span className="font-bold"> {loopDetails.group.group_name}</span> Loop.
                      </>
                    ),
                  })
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
              className="border border-primary p-0.5 hover:border-primary-600"
              onClick={async () => {
                const currentURL = new URL(loopDetails.share_url)
                currentURL.searchParams.set('utm_source', 'app_web')
                await shareFn({
                  shareLink: currentURL.href,
                  toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                })
              }}>
              <ShareIcon className="h-6 w-6 fill-primary hover:fill-primary-600" />
            </Button>
          </div>
        </div>
        <span className="w-1/2">
          <p className="my-1 line-clamp-2 w-1/2 break-words text-body-1-med text-secondary">
            {loopDetails.group.group_description}
          </p>
          <div className="my-3 w-1/2 rounded-xl border border-tertiary-200 p-4">
            <span className="flex gap-x-2" ref={detailsDivRef}>
              <span className="flex-1">
                <p className="text-body-1-demi text-tertiary">Created by</p>
                <Link href={{ pathname: PATH_NAME.profile(loopDetails.owner.username) }}>
                  <div className="my-2 flex items-center">
                    <CustomAvatar
                      fallbackString={loopDetails.owner.name ?? ''}
                      imageUrl={loopDetails.owner.profile_image ?? ''}
                      isAvatar={loopDetails.owner.is_avatar}
                      className="h-8 w-8"
                    />
                    <p className="ml-1 line-clamp-1 break-all text-body-1-bold text-secondary">
                      @{loopDetails.owner.username}
                    </p>
                  </div>
                </Link>
              </span>
              <span className="flex-1">
                <p className="text-body-1-demi text-tertiary">Posted in</p>
                <Link href={{ pathname: PATH_NAME.community(loopDetails.community.slug) }}>
                  <div className="my-2 flex items-center">
                    <CustomAvatar
                      imageUrl={loopDetails.community.dp ?? ''}
                      fallbackString={loopDetails.community.name ?? ''}
                      isAvatar={false}
                      className="h-8 w-8"
                    />
                    <p className="ml-1 line-clamp-1 break-all text-body-1-bold text-secondary">
                      {loopDetails.community.name}
                    </p>
                  </div>
                </Link>
              </span>
            </span>
            <Stats
              statsData={[
                { key: 'Posts', value: loopDetails.group.no_of_videos ?? 0 },
                { key: 'Collaborators', value: loopDetails.group.no_of_members ?? 0 },
                { key: 'Subscribers', value: loopDetails.group.no_of_subscribers ?? 0 },
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
              <p className="text-center text-title-2-demi">
                This Loop is visible to its
                <br /> Collaborators only
              </p>
            </div>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-4 overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
            <div className="h-full snap-y snap-proximity overflow-auto scroll-smooth">
              <LoopVideos
                community={{
                  handle: loopDetails.community.handle,
                  slug: loopDetails.community.slug,
                  id: loopDetails.community.community_id,
                  name: loopDetails.community.name,
                  profileImage: loopDetails.community.dp,
                }}
                loop={{
                  id: loopDetails.chat_id,
                  slug: loopDetails.slug,
                  name: loopDetails.group.group_name,
                }}
              />
            </div>
            <div className="snap-y snap-proximity overflow-auto scroll-smooth py-2">
              <LoopCohosts slug={loopDetails.slug} />
              <LoopSubscribers slug={loopDetails.slug} />
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

  if (cohosts && cohosts.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-3-bold">Collaborators</p>
        <div className="h-full w-full overflow-auto">
          {cohosts.map((item, index) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.nickname) }}>
              <ListItem
                title={item.name ?? ''}
                subtitle={'@' + item.nickname}
                description={item.bio ?? ''}
                image={item.profile_image}
                isAvatar={item.is_avatar}
              />
            </Link>
          ))}
        </div>
      </div>
    )
}

// TODO: think about pagination
function LoopSubscribers({ slug }: { slug: string }) {
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

  if (subscribers && subscribers.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-3-bold">Subscribers</p>
        <div className="h-full w-full overflow-auto">
          {subscribers.map((item, index) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.nickname) }}>
              <ListItem
                title={item.name ?? ''}
                subtitle={'@' + item.nickname}
                description={item.bio ?? ''}
                image={item.profile_image}
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
