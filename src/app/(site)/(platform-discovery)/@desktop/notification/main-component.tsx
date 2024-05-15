'use client'
import { type NotificationsType, type NotificationDetailsType } from '@lib/schemas/notification/notification'
import Loading from './loading'
import { GetNotificationAttributedText } from '@components/common/notification-tab-view'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { getNotifications } from '@lib/api/notification'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { generatePathname } from '@lib/generate-notification-pathparam'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useRef } from 'react'

export function MainComponent() {
  const { data, isLoading, fetchNextPage, isError, isFetchingNextPage } = getNotifications(10)
  const notifications = data?.pages.flatMap((item) => item.notifications)
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    console.log(Number(latest.toFixed(1)))
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  if (isLoading) return <Loading />
  if (data)
    return (
      <Notifications notificationDetails={notifications} scrollDivRef={scrollDivRef} fetchNextPage={fetchNextPage} />
    )
}

function Notifications({
  notificationDetails,
  scrollDivRef,
  fetchNextPage,
}: {
  notificationDetails: NotificationsType
  scrollDivRef: any
  fetchNextPage: any
}) {
  return (
    <div ref={scrollDivRef} className="h-full w-full overflow-auto p-6 sm:w-1/2">
      <p className="mb-4 text-title-1-bold">Latest Activity</p>
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
                    imageUrl={item?.user?.profile_image ?? ''}
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
                    <img src={item?.conversation_video?.thumbnail_url} alt="thumbnail" className="aspect-reel h-14" />
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
    </div>
  )
}
