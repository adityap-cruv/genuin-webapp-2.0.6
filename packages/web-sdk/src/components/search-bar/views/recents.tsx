import { useQuery } from '@tanstack/react-query'
import { deleteRecent, fetchRecents } from '../api'
import { CustomAvatar } from '@/components/custom-avatar'
import { LoopIcon } from '@/components/icons/loop-icon'
import { useEffect, type ReactNode, type ComponentProps } from 'react'
import { ItemShimmer } from './item-shimmer'
import { SearchIcon } from '@/components/icons/search-icon'
import { cn } from '@/utils'
import { CustomLink } from '@/router/custom-link'
import { CloseIcon } from '@/components/icons/close-icon'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { Analytics } from '@/analytics'
import { useSearchBarContext } from '@/components/search-bar/context'

export function Recents() {
  const {
    data: list,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: async () => await fetchRecents(),
    queryKey: ['recent', 'search'],
    retry() {
      return false
    },
  })

  const pathName = usePathNameWithSubdomain()

  useEffect(() => {
    if (list && list?.length !== 0) {
      Analytics.track(Analytics.EventNames.CheckRecentSearch)
    }
  }, [list])

  async function deleteClickHandler(id?: string, all?: boolean) {
    const response = await deleteRecent(id, all)
    // TODO: What should we do in case of failure in deletion api.
    if (response) void refetch()
    Analytics.track(Analytics.EventNames.ClearRecentSearch)
  }

  if (isLoading) return <ItemShimmer count={10} />

  if (list && list.length !== 0)
    return (
      <div className='h-full overflow-auto px-3 py-4'>
        <div className='flex justify-between px-3'>
          <p className='text-title-3-bold'>Recent</p>
          <p
            className='cursor-pointer text-body-1-bold text-tertiary'
            onClick={() => {
              void deleteClickHandler(undefined, true)
            }}>
            Clear all
          </p>
        </div>
        {list.map((item: any, index: any) => {
          if (item.type === 'text' && item.text)
            return (
              <TextItem
                key={item.id}
                avatar={
                  <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tertiary-300'>
                    <SearchIcon className='h-5 w-5 stroke-tertiary' />
                  </div>
                }
                title={item.text}
                subtitle=''
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
                    className='h-12 w-12'
                    fallbackString={item.community.name ?? ''}
                    imageUrl={item.community.dp_m ?? item.community.dp ?? ''}
                    isAvatar={false}
                  />
                }
                subtitle={`Community • ${item.community.description ?? ''}`}
                title={item.community.name ?? ''}
                href={pathName.community(item.community.slug)}
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
                  <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tertiary-300'>
                    <LoopIcon className='h-5 w-5 stroke-tertiary' />
                  </div>
                }
                subtitle={`Group • ${item.loop.group.group_description}`}
                title={item.loop.group.group_name ?? ''}
                href={pathName.loop(
                  item.loop.slug
                    ? item.loop.slug
                    : item.loop?.group?.slug ?? '',
                )}
                deletionHandler={() => {
                  void deleteClickHandler(item.id)
                }}
              />
            )
          if (item.type === 'user' && item.user)
            return (
              <ListItem
                key={index}
                avatar={
                  <CustomAvatar
                    isAvatar={item.user.is_avatar}
                    fallbackString={item.user.name ?? ''}
                    imageUrl={
                      item.user.profile_image_m ?? item.user.profile_image ?? ''
                    }
                    className='h-12 w-12'
                  />
                }
                title={`${item.user.name}`}
                subtitle={`@${item.user.nickname}`}
                href={pathName.profile(item.user.nickname)}
                deletionHandler={() => {
                  void deleteClickHandler(item.id)
                }}
              />
            )
          return <></>
        })}
      </div>
    )

  return (
    <div className='p-6 text-body-1-demi text-tertiary'>
      Try searching for communities, topics, or keywords
    </div>
  )
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
  avatar: Avatar,
  deletionHandler,
  className,
  ...restProps
}: ItemProps & ComponentProps<'a'>) {
  return (
    <CustomLink
      target='_blank'
      className={cn(
        'flex items-center gap-x-3 rounded-md px-3 py-2 hover:bg-tertiary-200',
        className,
      )}
      {...restProps}>
      {Avatar}
      <div className='relative h-full w-full'>
        {title && (
          <p className='line-clamp-1 break-all text-body-1-bold'>{title}</p>
        )}
        {subtitle && (
          <p className='line-clamp-1 break-all text-cap-1-demi'>{subtitle}</p>
        )}
        <CloseIcon
          className='absolute right-0 h-4 w-4 top-1/2 z-10 -translate-y-1/2'
          onClick={(e) => {
            e.stopPropagation()
            deletionHandler()
            Analytics.track(Analytics.EventNames.KeywordSearchCancel)
          }}
        />
      </div>
    </CustomLink>
  )
}

function TextItem({
  subtitle = '',
  title = '',
  avatar: Avatar,
  deletionHandler,
}: ItemProps) {
  const { setKeyword } = useSearchBarContext()

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        if (title) {
          // for updating search-input box find a better way to do it.
          // eslint-disable-next-line no-extra-semi
          ;(document.getElementById('search-input') as HTMLInputElement).value =
            title
          setKeyword(title)
        }
      }}
      className='flex items-center gap-x-3 rounded-md px-3 py-2 hover:bg-tertiary-200'>
      {Avatar}
      <div className='relative h-full w-full'>
        {title && (
          <p className='line-clamp-1 break-all text-body-1-bold'>{title}</p>
        )}
        {subtitle && (
          <p className='line-clamp-1 break-all text-cap-1-demi'>{subtitle}</p>
        )}
        <CloseIcon
          className='absolute right-0  h-4 w-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer'
          onClick={(e) => {
            e.stopPropagation()
            deletionHandler()
            Analytics.track(Analytics.EventNames.KeywordSearchCancel)
          }}
        />
      </div>
    </div>
  )
}
