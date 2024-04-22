import { useQuery } from '@tanstack/react-query'
import { useSearchBarStore } from '../store'
import { fetchSuggestions, postRecents } from '../api'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { IcLoop } from '@icons/ic-loop'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { NoResults } from './tabs/no-results'
import { RECENT_SEARCH_CONTENT_TYPE } from '@lib/constants'
import { type ReactNode } from 'react'
import { ItemShimmer } from './item-shimmer'

export default function Suggestions() {
  return (
    <div className="relative h-full w-full overflow-auto">
      <Inner />
      <Bottom />
    </div>
  )
}

function Inner() {
  const { keyword } = useSearchBarStore()
  const { data: list, isLoading } = useQuery({
    queryFn: async () => await fetchSuggestions(keyword),
    queryKey: ['search', 'suggestions', keyword],
  })

  if (isLoading) return <SuggestionsShimmer />

  if (list && list?.length !== 0)
    return (
      <div className="px-3 pb-14 pt-4">
        {list.map((item) => {
          if (item.type === 'community')
            if (item.community)
              return (
                <div
                  key={item.community.community_id}
                  onClick={() => {
                    postRecents(RECENT_SEARCH_CONTENT_TYPE.community, item.community?.community_id)
                  }}>
                  <ListItem
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
                  />
                </div>
              )
          if (item.type === 'loop')
            if (item.loop)
              return (
                <div
                  key={item.loop.chat_id}
                  onClick={() => {
                    postRecents(RECENT_SEARCH_CONTENT_TYPE.loop, item.loop?.chat_id)
                  }}>
                  <ListItem
                    avatar={
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tertiary-300">
                        <IcLoop className="h-5 w-5 stroke-tertiary" />
                      </div>
                    }
                    subtitle={`Loop • ${item.loop.group.group_description ?? ''}`}
                    title={item.loop.group.group_name ?? ''}
                    urlToGo={PATH_NAME.loop(item.loop.group.slug)}
                  />
                </div>
              )
          if (item.type === 'user')
            if (item.user)
              return (
                <div
                  key={item.user.user_id}
                  onClick={() => {
                    postRecents(RECENT_SEARCH_CONTENT_TYPE.user, item.user?.user_id)
                  }}>
                  <ListItem
                    avatar={
                      <CustomAvatar
                        fallbackString={item.user.name ?? ''}
                        imageUrl={item.user.profile_image ?? ''}
                        isAvatar={item.user.is_avatar}
                        className="h-12 w-12"
                      />
                    }
                    subtitle={item.user?.name ?? ''}
                    title={`@${item.user?.nickname}`}
                    urlToGo={PATH_NAME.profile(item.user?.nickname)}
                  />
                </div>
              )
          return <></>
        })}
      </div>
    )

  return <NoResults />
}

function ListItem({
  subtitle = '',
  title = '',
  urlToGo,
  avatar: Avatar,
}: {
  title: string
  subtitle: string
  urlToGo: string
  avatar: ReactNode
}) {
  const { close } = useSearchBarStore()
  return (
    <Link
      href={urlToGo}
      onClick={() => {
        close()
      }}
      className="flex items-center gap-x-3 rounded-md px-3 py-2 hover:bg-tertiary-200">
      {Avatar}
      <span>
        {title && <p className="line-clamp-1 break-all text-body-1-bold">{title}</p>}
        {subtitle && <p className="line-clamp-1 break-all text-cap-1-demi">{subtitle}</p>}
      </span>
    </Link>
  )
}

function SuggestionsShimmer() {
  return <ItemShimmer count={10} />
}

function Bottom() {
  const { setView } = useSearchBarStore()
  return (
    <div className="fixed bottom-0 flex h-10 w-full items-center justify-center border-t border-tertiary-200 bg-monochrome-white">
      <p
        className="cursor-pointer text-body-1-bold text-primary"
        onClick={() => {
          setView('TABS')
        }}>
        See all results
      </p>
    </div>
  )
}
