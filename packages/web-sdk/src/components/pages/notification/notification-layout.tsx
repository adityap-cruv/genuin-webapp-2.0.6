import { useAuth } from '@/context/auth'
import {
  getNotifications,
  notificationsCount,
  readNotifications,
} from './notification'
import { useContext, useEffect, useRef } from 'react'
import { BaseContext } from '@/context/base'
import { Shimmer } from '@/components/shimmer'
import { BellIcon, ChevronLeft } from 'lucide-react'
import { CustomLink } from '@/router/custom-link'
import { generatePathname } from './generate-notification-pathparam'
import { CustomAvatar } from '@/components/custom-avatar'
import { PATH_NAME } from '@/hooks/usePathNameWithSubdomain'
import { GetNotificationAttributedText } from './notification-tab-view'
import { Loader } from '@/components/loader'

export function NotificationLayout() {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } =
    getNotifications(10)
  const notifications = data?.pages.flatMap((item) => item.notifications) ?? []

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const user = useAuth()
  const { setNotificationCount } = useContext(BaseContext)

  async function fetchNotificationCount() {
    const response = await notificationsCount()
    if (response) {
      if (response.status) setNotificationCount(response.count)
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
      <div className='h-full w-full p-6 sm:w-1/2'>
        <Shimmer className='h-8 w-2/3' />
        <div className='my-4 flex flex-col gap-2'>
          {Array.from({ length: 12 }).map((_, index) => (
            <Shimmer
              key={index}
              className='h-12 w-full'
            />
          ))}
        </div>
      </div>
    )

  if (notifications)
    return (
      <AllNotifications
        notificationDetails={notifications}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isMobile={isMobile}
      />
    )
}

function AllNotifications({
  notificationDetails,
  fetchNextPage,
  isFetchingNextPage,
  isMobile,
}: {
  notificationDetails: any
  fetchNextPage: () => void
  isFetchingNextPage: boolean
  isMobile: boolean
}) {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { root: scrollDivRef.current, rootMargin: '100px', threshold: 1.0 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current)
    }
  }, [fetchNextPage, isFetchingNextPage])

  return (
    <div className={`w-full ${isMobile ? 'h-body' : 'h-full p-6'} sm:w-1/2`}>
      {isMobile ? (
        <div className='sticky'>
          <div
            className={`relative flex w-full items-center justify-center border-b border-tertiary p-4`}>
            <ChevronLeft className='absolute inset-5 h-6 w-6 stroke-secondary' />
            <p className='text-title-2-bold'>Notifications</p>
          </div>
        </div>
      ) : (
        <p className='mb-2 text-title-1-bold'>Latest Activity</p>
      )}

      {notificationDetails?.length === 0 && (
        <div className='flex h-full w-full flex-col items-center justify-center py-2'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-200'>
            <BellIcon />
          </div>
          <p className='text-title-2-bold'>Nothing here - yet</p>
          <p className='w-2/3 text-center text-body-1-demi'>
            Try exploring and participating in the existing communities or
            create one of your own. Their updates will be shown here!
          </p>
        </div>
      )}

      {notificationDetails?.length !== 0 && (
        <div
          ref={scrollDivRef}
          className='h-full overflow-auto py-2'>
          {notificationDetails?.map((item: any, index: number) => (
            <CustomLink
              key={index}
              href={generatePathname(item) ?? ''}>
              <div
                className={`flex items-center justify-between gap-2 border-b border-tertiary ${
                  !item.is_read && 'bg-tertiary-300'
                } p-4`}>
                <div className='flex items-center gap-2'>
                  <CustomLink
                    href={PATH_NAME.profile(item?.user?.nickname)}
                    onClick={(e) => e.stopPropagation()}>
                    <CustomAvatar
                      className='h-14 w-14 bg-red-40'
                      imageUrl={
                        item?.user?.profile_image_m ?? item?.user?.profile_image
                      }
                      fallbackString={item?.user?.name ?? ''}
                      isAvatar={item?.user?.is_avatar}
                    />
                  </CustomLink>
                  <GetNotificationAttributedText notification={item} />
                </div>
                <div>
                  {item?.conversation_video?.thumbnail_url && (
                    <CustomLink
                      href={PATH_NAME.video(item?.conversation_video?.slug)}
                      onClick={(e) => e.stopPropagation()}>
                      <div className='aspect-reel h-14'>
                        <img
                          src={item?.conversation_video?.thumbnail_url}
                          alt='thumbnail'
                          className='h-full'
                        />
                      </div>
                    </CustomLink>
                  )}
                  {item?.community?.dp && (
                    <CustomLink
                      href={PATH_NAME.community(item?.community?.slug)}>
                      <CustomAvatar
                        className='h-12 w-12 rounded-none bg-red-40'
                        imageUrl={item?.community?.dp ?? ''}
                        fallbackString={item?.community?.name ?? ''}
                        isAvatar={false}
                      />
                    </CustomLink>
                  )}
                </div>
              </div>
            </CustomLink>
          ))}
          <div
            ref={observerRef}
            className='h-1'></div>
          {isFetchingNextPage && (
            <div className='my-2 flex w-full justify-center'>
              <Loader />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
