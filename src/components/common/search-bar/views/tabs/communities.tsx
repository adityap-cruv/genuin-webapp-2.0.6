import { CustomAvatar } from '@components/custom/custom-avatar'
import { type CommunityType } from '.'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { NoResults } from './no-results'
import { useSearchBarStore } from '../../store'
import { LockIcon } from '@icons/LockIcon'

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
              <div className="flex items-center gap-1">
                {community.brand && (
                  <Link href={{ pathname: PATH_NAME.brand(community.brand.brand_slug) }}>
                    <div className="flex items-center gap-1 rounded-full bg-tertiary-200 p-1 ">
                      <CustomAvatar
                        imageUrl={community.brand?.logo ?? ''}
                        fallbackString={community.brand?.name ?? ''}
                        isAvatar={false}
                        className="h-4 w-4"
                      />
                      <p
                        className="text-cap-1-demi text-secondary"
                        style={{
                          maxWidth: '10ch',
                        }}>
                        {community.brand?.name}
                      </p>
                    </div>
                  </Link>
                )}
                <p className="text-body-1-demi text-tertiary">{`${community.memberCount} members`}</p>
                {community.type === 2 && (
                  <div className="flex items-center justify-center">
                    <LockIcon className="h-4 w-4 stroke-tertiary" />
                    <p className="text-cap-1-demi text-tertiary">Private</p>
                  </div>
                )}
              </div>
            </span>
          </span>
        </div>
        <p className="line-clamp-2 break-all text-body-1-demi">{community.description}</p>
      </div>
    </Link>
  )
}
