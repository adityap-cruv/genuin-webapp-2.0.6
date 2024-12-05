'use client'
import { type NotificationsType } from '@lib/schemas/notification/notification'
import { GetNotificationAttributedText } from './notification-tab-view'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { getNotifications, notificationsCount, readNotifications } from '@lib/api/notification'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { generatePathname } from '@lib/generate-notification-pathparam'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Loader } from '@components/ui/loader'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { NotificationIcon } from '@icons/settings-side-bar-icons'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import icBack from '@icons/icBack.svg'
import { Shimmer } from '@components/ui/shimmer'

export function NotificationLayout() {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getNotifications(10)
  const notifications = data?.pages.flatMap((item) => item.notifications)
  const { isMobile, user, setInitialData } = useGenuinOptions((state) => ({
    isMobile: state.isMobile,
    user: state.user,
    setInitialData: state.setData,
  }))

  async function fetchNotificationCount() {
    const { status, count } = await notificationsCount()
    if (status) {
      setInitialData({ notificationCount: count })
    }
  }

  useEffect(() => {
    return () => {
      if (user) {
        void fetchNotificationCount()
        void readNotifications(true)
      }
    }
  }, [])

  if (isLoading)
    return (
      <div className={`h-full w-full p-6 sm:w-1/2`}>
        <Shimmer className="h-8 w-2/3" />
        <div className="my-4 flex flex-col gap-2">
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
          <Shimmer className="h-12 w-full" />
        </div>
      </div>
    )

  if (data)
    return (
      <Notifications
        notificationDetails={notifications}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isMobile={isMobile}
      />
    )
}

// TODO: FIX type issues and CustomAvatar of community doesn't get set.
function Notifications({
  notificationDetails,
  fetchNextPage,
  isFetchingNextPage,
  isMobile,
}: {
  notificationDetails: NotificationsType
  fetchNextPage: any
  isFetchingNextPage: boolean
  isMobile: boolean
}) {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })
  const router = useRouter()

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  return (
    <div className={`w-full ${isMobile ? 'h-body' : 'h-full p-6'} sm:w-1/2`}>
      {isMobile ? (
        <div className="sticky">
          <div className={`relative flex w-full items-center justify-center border-b border-tertiary p-4`}>
            <Image
              src={icBack}
              alt="back"
              onClick={() => {
                router.back()
              }}
              className="absolute left-2"
            />
            <p className="text-title-2-bold">Notifications</p>
          </div>
        </div>
      ) : (
        <p className="mb-2 text-title-1-bold">Latest Activity</p>
      )}
      {notificationDetails?.length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center py-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-200">
            <NotificationIcon className="fill-secondary" />
          </div>
          <p className="text-title-2-bold">Nothing here - yet</p>
          <p className="w-2/3 text-center text-body-1-demi">
            Try exploring and participating in the existing communities or create one of your own. Their updates will be
            shown here!
          </p>
        </div>
      )}

      {notificationDetails?.length !== 0 && (
        <div ref={scrollDivRef} className={`h-full overflow-scroll py-2`}>
          {notificationDetails?.map((item: any, index: number) => (
            <>
              <Link
                href={{
                  pathname: generatePathname(item),
                }}>
                <div
                  key={index}
                  className={`flex items-center justify-between gap-2 border-b border-tertiary-300 ${
                    !item.is_read && 'bg-primary-100'
                  } p-4`}>
                  <div className="flex items-center gap-2">
                    <Link
                      href={{
                        pathname: PATH_NAME.profile(item?.user?.nickname),
                      }}>
                      <CustomAvatar
                        className="h-14 w-14 bg-red-40"
                        imageUrl={item?.user?.profile_image_m ?? item.user.profile_image}
                        fallbackString={item?.user?.name ?? ''}
                        isAvatar={item?.user?.is_avatar}
                      />
                    </Link>
                    <GetNotificationAttributedText notification={item} />
                  </div>
                  <div>
                    {item?.conversation_video?.thumbnail_url && (
                      <Link
                        href={{
                          pathname: PATH_NAME.video(item?.conversation_video?.slug),
                        }}>
                        <div className="aspect-reel h-14">
                          <img src={item?.conversation_video?.thumbnail_url} alt="thumbnail" className="h-full" />
                        </div>
                      </Link>
                    )}
                    {item?.community?.dp && (
                      <Link
                        href={{
                          pathname: PATH_NAME.community(item?.community?.slug),
                        }}>
                        <CustomAvatar
                          className="h-12 w-12 rounded-none bg-red-40"
                          imageUrl={item?.community?.dp ?? ''}
                          fallbackString={item?.community?.name ?? ''}
                          isAvatar={false}
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </Link>
            </>
          ))}
          {isFetchingNextPage && (
            <div className="my-2 flex w-full justify-center">
              <Loader size="md" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
