'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { TopBar } from './top-bar'
import { getLoopCollaborators, getLoopSubscribers } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { ListItem } from '@components/common/list-item'
import { LoopVideos } from '@components/common/loop-videos'
import { DownloadDialog } from '@components/common/download-dialog'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'

interface Props {
  loopDetails: LoopDetailsType
}

export function MainComponent({ loopDetails }: Props) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
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
            <p className="mt-6 text-title-1-bold">{loopDetails.group.group_name}</p>
            <p className="my-1 line-clamp-2 w-1/2 text-body-1-med">{loopDetails.group.group_description}</p>
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
                  <Link href={{ pathname: PATH_NAME.community(loopDetails.community.handle) }}>
                    <div className="my-2 flex items-center">
                      <CustomAvatar
                        imageUrl={loopDetails.community.dp}
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
              <DownloadDialog
                title="Get the Genuin app"
                subtitle={
                  <>
                    Get the app to subscribe to<span className="font-bold"> {loopDetails.group.group_name}</span> Loop.
                  </>
                }
                asChild>
                <Button size="custom">
                  <p className="px-4 py-1 text-title-3-demi">Subscribe</p>
                </Button>
              </DownloadDialog>

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
                onClick={async () =>
                  await shareFn({
                    shareLink: window.location.href,
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }>
                <Image src={icShare} alt="share" className="h-6 w-6" />
              </Button>
            </span>
          </span>
          <div className="grid w-full grid-cols-2 gap-4 overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
            <div className="h-full snap-y snap-proximity overflow-auto scroll-smooth">
              <LoopVideos loopId={loopDetails.share_string} />
            </div>
            <div className="snap-y snap-proximity overflow-auto scroll-smooth py-2">
              <LoopCollaborators loopId={loopDetails.share_string} />
              <LoopSubscribers loopId={loopDetails.share_string} />
            </div>
          </div>
          <Toaster />
        </main>
      </>
    )
}

function LoopCollaborators({ loopId }: any) {
  const { data, isLoading } = getLoopCollaborators(loopId, 'members')
  const cohosts = data?.users

  if (cohosts && cohosts.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-md">Collaborators</p>
        {isLoading && <Loader size="md" />}
        <div className="h-full w-full overflow-auto">
          {cohosts.map((item: any, index: any) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.user.nickname) }}>
              <ListItem
                title={'@' + item.user.nickname}
                subtitle={item.user.name ?? ''}
                description={item.user.bio || ''}
                image={item.user.profile_image || ''}
              />
            </Link>
          ))}
        </div>
      </div>
    )
}

function LoopSubscribers({ loopId }: any) {
  const { data, isLoading } = getLoopSubscribers(loopId, 'subscribers')
  const subscribers = data?.users

  if (subscribers && subscribers.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-3-bold">Subscribers</p>
        {isLoading && <Loader size="md" />}
        <div className="h-full w-full overflow-auto">
          {subscribers.map((item: any, index: any) => (
            <Link key={index} href={{ pathname: PATH_NAME.profile(item.user.nickname) }}>
              <ListItem
                title={'@' + item.user.nickname}
                subtitle={item.user.name ?? ''}
                description={item.user.bio || ''}
                image={item.user.profile_image || ''}
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
