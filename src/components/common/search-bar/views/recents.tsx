import { useQuery } from '@tanstack/react-query'
import { deleteRecent, fetchRecents } from '../api'
import { X } from 'lucide-react'
import { useSearchBarStore } from '../store'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { PATH_NAME } from '@lib/utils/constants/path'
import { IcLoop } from '@icons/ic-loop'
import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { ItemShimmer } from './item-shimmer'
import { SearchIcon } from '@icons/search-icon'
import Analytics from '@services/analytics'

export function Recents() {
  const {
    data: list,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: async () => await fetchRecents(),
    queryKey: ['recent', 'search'],
    retry(failureCount, error) {
      return false
    },
  })

  useEffect(() => {
    if (list && list?.length !== 0) {
      void Analytics.track({
        eventName: 'Check Recent Search',
        properties: {},
      })
    }
  }, [list])

  async function deleteClickHandler(id?: string, all?: boolean) {
    const response = await deleteRecent(id, all)
    // TODO: What should we do in case of failure in deletion api.
    if (response) void refetch()
    void Analytics.track({
      eventName: 'Clear Recent Search',
      properties: {},
    })
  }

  if (isLoading) return <ItemShimmer count={10} />
  if (list && list.length !== 0)
    return (
      <div className="h-full w-full overflow-auto px-3 py-4">
        <span className="flex justify-between px-3">
          <p className="text-title-3-bold">Recent</p>
          <p
            className="cursor-pointer text-body-1-bold text-tertiary"
            onClick={(e) => {
              // TODO: This api is not working ask sanket.
              void deleteClickHandler(undefined, true)
            }}>
            Clear all
          </p>
        </span>
        {list.map((item) => {
          if (item.type === 'text' && item.text && item.text.trim() !== '')
            return (
              <TextItem
                key={item.id}
                avatar={
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tertiary-300">
                    <SearchIcon className="h-5 w-5 stroke-tertiary" />
                  </div>
                }
                title={item.text}
                subtitle=""
                deletionHandler={() => {
                  void deleteClickHandler(item.id)
                }}
              />
            )
          if (item.type === 'community' && item.community)
            return (
              <ListItem
                key={item.id}
                avatar={
                  <CustomAvatar
                    className="h-12 w-12"
                    fallbackString={item.community.name ?? ''}
                    imageUrl={item.community.dp ?? ''}
                    isAvatar={false}
                  />
                }
                subtitle={`Community • ${item.community.description ?? ''}`}
                title={item.community.name ?? ''}
                urlToGo={PATH_NAME.community(item.community.slug)}
                deletionHandler={() => {
                  void deleteClickHandler(item.id)
                }}
              />
            )
          if (item.type === 'loop' && item.loop)
            return (
              <ListItem
                key={item.id}
                avatar={
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tertiary-300">
                    <IcLoop className="h-5 w-5 stroke-tertiary" />
                  </div>
                }
                subtitle={`Loop • ${item.loop.group.group_description}`}
                title={item.loop.group.group_name ?? ''}
                urlToGo={PATH_NAME.loop(item.loop.slug)}
                deletionHandler={() => {
                  void deleteClickHandler(item.id)
                }}
              />
            )
          if (item.type === 'user' && item.user)
            return (
              <ListItem
                avatar={
                  <CustomAvatar
                    isAvatar={item.user.is_avatar}
                    fallbackString={item.user.name ?? ''}
                    imageUrl={item.user.profile_image ?? ''}
                    className="h-12 w-12"
                  />
                }
                title={`${item.user.name}`}
                subtitle={`@${item.user.nickname}`}
                urlToGo={PATH_NAME.profile(item.user.nickname)}
                deletionHandler={() => {
                  void deleteClickHandler(item.id)
                }}
              />
            )
          return <></>
        })}
      </div>
    )

  return <div className="p-6 text-body-1-demi text-tertiary">Try searching for communities, topics, or keywords</div>
}

type ItemProps = {
  title: string
  subtitle: string
  avatar: ReactNode
  deletionHandler: () => void
}

function ListItem({
  subtitle = '',
  title = '',
  urlToGo,
  avatar: Avatar,
  deletionHandler,
}: ItemProps & { urlToGo: string }) {
  return (
    <Link href={urlToGo} className="flex items-center gap-x-3 rounded-md px-3 py-2 hover:bg-tertiary-200">
      {Avatar}
      <span className="relative h-full w-full">
        {title && <p className="line-clamp-1 break-all text-body-1-bold">{title}</p>}
        {subtitle && <p className="line-clamp-1 break-all text-cap-1-demi">{subtitle}</p>}
        <X
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2"
          onClick={(e) => {
            e.stopPropagation()
            deletionHandler()
            void Analytics.track({
              eventName: 'Keyword Search Cancel',
              properties: {},
            })
          }}
        />
      </span>
    </Link>
  )
}

function TextItem({ subtitle = '', title = '', avatar: Avatar, deletionHandler }: ItemProps) {
  const { setKeyword } = useSearchBarStore()

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        if (title) {
          // for updating search-input box find a better way to do it.
          ;(document.getElementById('search-input') as HTMLInputElement).value = title
          setKeyword(title)
        }
      }}
      className="flex items-center gap-x-3 rounded-md px-3 py-2 hover:bg-tertiary-200">
      {Avatar}
      <span className="relative h-full w-full">
        {title && <p className="line-clamp-1 break-all text-body-1-bold">{title}</p>}
        {subtitle && <p className="line-clamp-1 break-all text-cap-1-demi">{subtitle}</p>}
        <X
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            deletionHandler()
            void Analytics.track({
              eventName: 'Keyword Search Cancel',
              properties: {},
            })
          }}
        />
      </span>
    </div>
  )
}
