'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import icLock from '@icons/icLock.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { TopStickyBar } from './top-bar'
import { getLoopCohosts, getLoopSubscribers, subscribeLoop } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { ListItem } from '@components/common/list-item'
import { LoopVideos } from './loop-videos'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { openModal } from '@lib/utils'
import { DownloadDialog } from '@components/common/download-dialog'
import { useGenuinOptions } from '@lib/stores/genuin-options'

interface Props {
  loopDetails: LoopDetailsType
}

// TODO: Improve this component.
export function MainComponent({ loopDetails }: Props) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const [isLoopSubscribed, setIsLoopSubscribed] = useState(false)
  const user = useGenuinOptions().user

  if (loopDetails)
    return (
      <>
        <TopStickyBar.desktop
          defaultOpen={false}
          isOpen={!detailsInView}
          loopName={loopDetails.group.group_name ?? ''}
          shareString={loopDetails.community.share_string}
          communitySlug={loopDetails.community.slug}
          chatId={loopDetails.chat_id}
          isLoopSubscribed={isLoopSubscribed}
          setIsLoopSubscribed={setIsLoopSubscribed}
        />
        <main className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto pl-6">
          <span className="w-1/2">
            <p className="mt-6 text-title-1-bold">{loopDetails.group.group_name}</p>
            <p className="my-1 line-clamp-2 w-1/2 break-words text-body-1-med">{loopDetails.group.group_description}</p>
            <div className="my-3 w-1/2 rounded-xl border border-monochrome-9 p-4">
              <span className="flex" ref={detailsDivRef}>
                <span className="flex-1">
                  <p className="text-body-1-demi text-monochrome">Created by</p>
                  <Link href={{ pathname: PATH_NAME.profile(loopDetails.owner.nickname) }}>
                    <div className="my-2 flex items-center">
                      <CustomAvatar
                        fallbackString={loopDetails.owner.name ?? ''}
                        imageUrl={loopDetails.owner.profile_image ?? ''}
                        isAvatar={loopDetails.owner.is_avatar}
                        className="h-8 w-8"
                      />
                      <p className="ml-1 text-body-1-bold">@{loopDetails.owner.nickname}</p>
                    </div>
                  </Link>
                </span>
                <span className="flex-1">
                  <p className="text-body-1-demi text-monochrome">Posted in</p>
                  <Link href={{ pathname: PATH_NAME.community(loopDetails.community.slug) }}>
                    <div className="my-2 flex items-center">
                      <CustomAvatar
                        imageUrl={loopDetails.community.dp ?? ''}
                        fallbackString={loopDetails.community.name}
                        isAvatar={false}
                        className="h-8 w-8"
                      />
                      <p className="ml-1 text-body-1-bold">{loopDetails.community.name}</p>
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
              {!loopDetails.private && (
                <Button
                  size="custom"
                  className={`${isLoopSubscribed && 'border border-primary '}`}
                  variant={isLoopSubscribed ? 'outline' : 'default'}
                  onClick={
                    user
                      ? async () => {
                          !isLoopSubscribed && (await subscribeLoop(loopDetails.chat_id, true))
                          setIsLoopSubscribed((prev) => !prev)
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

              {loopDetails.private && (
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
                className="border border-primary p-0.5"
                onClick={async () => {
                  const currentURL = new URL(window.location.href)
                  currentURL.searchParams.set('community', `${loopDetails.community.share_string}`)
                  currentURL.searchParams.set('utm_source', 'app_web')
                  await shareFn({
                    shareLink: currentURL.href,
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }}>
                <Image src={icShare} alt="share" className="h-6 w-6" />
              </Button>
            </span>
          </span>

          {loopDetails.private ? (
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
                <LoopVideos slug={loopDetails.chat_slug} />
              </div>
              <div className="snap-y snap-proximity overflow-auto scroll-smooth py-2">
                <LoopCollaborators slug={loopDetails.chat_slug} />
                <LoopSubscribers slug={loopDetails.chat_slug} />
              </div>
            </div>
          )}

          <Toaster />
        </main>
      </>
    )
}

function LoopCollaborators({ slug }: { slug: string }) {
  const { data, isLoading } = getLoopCohosts(slug, 'members')
  const cohosts = data?.users

  //  TODO: Implement shimmer.
  if (isLoading) return <Loader size="md" />

  if (cohosts && cohosts.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-3-bold">Collaborators</p>
        <div className="h-full w-full overflow-auto">
          {cohosts.map((item: any, index: any) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.user.nickname) }}>
              <ListItem
                title={item.user.name ?? ''}
                subtitle={'@' + item.user.nickname}
                description={item.user.bio || ''}
                image={item.user.profile_image || ''}
                isAvatar={item.user.is_avatar || ''}
              />
            </Link>
          ))}
        </div>
      </div>
    )
}

function LoopSubscribers({ slug }: { slug: string }) {
  const { data, isLoading } = getLoopSubscribers(slug, 'subscribers')
  const subscribers = data?.users

  // TODO: Implement shimmer.
  if (isLoading) return <Loader size="md" />

  if (subscribers && subscribers.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-3-bold">Subscribers</p>
        <div className="h-full w-full overflow-auto">
          {subscribers.map((item: any, index: any) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.user.nickname) }}>
              <ListItem
                title={item.user.name ?? ''}
                subtitle={'@' + item.user.nickname}
                description={item.user.bio || ''}
                image={item.user.profile_image || ''}
                isAvatar={item.user.is_avatar || ''}
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
            <p className="text-title-2-bold">{obj.value}</p>
            <p className="text-body-1-med text-monochrome">{obj.key}</p>
          </div>
        )
      })}
    </div>
  )
}
