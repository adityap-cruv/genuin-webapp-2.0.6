import { CustomAvatar } from '@components/custom/custom-avatar'
import { type CommunityType } from '.'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { NoResults } from './no-results'
import { useSearchBarStore } from '../../store'

export function Communities({ communities }: { communities?: CommunityType[] }) {
  if (communities)
    return (
      <div className="flex flex-col gap-y-3 px-4 pb-16 pt-4 sm:py-4">
        {communities.map((item) => {
          return <CommunityTile key={item.id} community={item} />
        })}
      </div>
    )

  return <NoResults />
}

export function CommunityTile({ community }: { community: CommunityType }) {
  const { close } = useSearchBarStore()
  return (
    <Link onClick={close} href={PATH_NAME.community(community.slug)}>
      <div className="flex flex-col gap-y-2 rounded-[10px] border border-tertiary-300 p-4 hover:bg-tertiary-100 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-2">
            <CustomAvatar
              imageUrl={community.profileImage ?? ''}
              fallbackString={community.name ?? ''}
              isAvatar={false}
              className="h-12 w-12"
            />
            <span>
              <p className="text-body-1-bold hover:underline">{community.name}</p>
              <p className="text-body-1-demi text-tertiary">{`${community.memberCount} members`}</p>
            </span>
          </span>
        </div>
        <p className="line-clamp-2 break-all text-body-1-demi">{community.description}</p>
      </div>
    </Link>
  )
}
