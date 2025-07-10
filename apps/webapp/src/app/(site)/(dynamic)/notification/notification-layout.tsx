'use client'
import { type NotificationsType } from '@lib/schemas/notification/notification'
import { GetNotificationAttributedText } from './notification-tab-view'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { notificationsCount, readNotifications, fetchNotifications } from '@lib/api/notification'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { generatePathname } from '@lib/generate-notification-pathparam'
import { useMotionValueEvent, useScroll } from 'motion/react'
import React, { useEffect, useRef } from 'react'
import { Loader } from '@components/ui/loader'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { BellIcon } from '@icons/bell-icon'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import icBack from '@icons/icBack.svg'
import { Shimmer } from '@components/ui/shimmer'

export function NotificationLayout() {
  const { isMobile, user, setInitialData } = useGenuinOptions((state) => ({
    isMobile: state.isMobile,
    user: state.user,
    setInitialData: state.setData,
  }))

  // Local state for notifications
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState<boolean>(false)
  const [end, setEnd] = React.useState<boolean>(false)
  const limit = 10

  // Fetch first page on mount
  React.useEffect(() => {
    let mounted = true
    async function loadInitial() {
      setIsLoading(true)
      try {
        const res = await fetchNotifications(limit)
        if (mounted) {
          setNotifications(res.notifications)
          setEnd(res.end)
        }
      } catch (e) {
        // Optionally handle error
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadInitial()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch next page for infinite scroll
  const fetchNextPage = React.useCallback(async () => {
    if (isFetchingNextPage || end || notifications.length === 0) return
    setIsFetchingNextPage(true)
    try {
      const last = notifications[notifications.length - 1]
      const pageParam = last ? { last_notification_id: last.notification_id } : {}
      const res = await fetchNotifications(limit, pageParam)
      setNotifications((prev) => [...prev, ...res.notifications])
      setEnd(res.end)
    } catch (e) {
      // Optionally handle error
    } finally {
      setIsFetchingNextPage(false)
    }
  }, [isFetchingNextPage, end, notifications])

  async function fetchNotificationCount() {
    const response = await notificationsCount()
    if (response) {
      if (response.status) setInitialData({ notificationCount: response.count })
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

  if (isLoading) {
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
  }

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
          <div className={`border-tertiary relative flex w-full items-center justify-center border-b p-4`}>
            <Image
              src={icBack}
              alt="back"
              onClick={() => {
                router.back()
              }}
              className="absolute left-2"
              height={24}
              width={24}
            />
            <p className="text-title-2-bold">Notifications</p>
          </div>
        </div>
      ) : (
        <p className="text-title-1-bold mb-2">Latest Activity</p>
      )}
      {notificationDetails?.length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center py-2">
          <div className="bg-tertiary-200 flex h-16 w-16 items-center justify-center rounded-full">
            <BellIcon />
          </div>
          <p className="text-title-2-bold">Nothing here - yet</p>
          <p className="text-body-1-demi w-2/3 text-center">
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
                  className={`border-tertiary-300 flex items-center justify-between gap-2 border-b ${
                    !item.is_read && 'bg-primary-100'
                  } p-4`}>
                  <div className="flex items-center gap-2">
                    <Link
                      href={{
                        pathname: PATH_NAME.profile(item?.user?.nickname),
                      }}>
                      <CustomAvatar
                        className="bg-red-40 h-14 w-14"
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
                          className="bg-red-40 h-12 w-12 rounded-none"
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
