import { CommunityTile } from '@/components/community-tile'
import { type CommunityType } from '.'
import { NoResults } from './no-results'
import { CommunityPrivacyEnum } from '@/utils'
import { useSearchBarContext } from '@/components/search-bar/context'

export function Communities({
  communities,
}: {
  communities?: CommunityType[]
}) {
  const { close } = useSearchBarContext()
  if (communities)
    return (
      <div className='flex flex-col gap-y-3 px-4 pb-16 pt-4 sm:py-4'>
        {communities.map((community) => {
          return (
            <CommunityTile
              onClick={close}
              redirectOnClick
              key={community.id}
              className='hover:bg-tertiary-100 hover:shadow-md'
              communityDetails={{
                id: community.id,
                slug: community.slug,
                memberCount: community.memberCount,
                name: community.name ?? '',
                profileImage: community.profileImage ?? '',
                type: CommunityPrivacyEnum[
                  community.type as unknown as keyof typeof CommunityPrivacyEnum
                ],
                brand: community.brand
                  ? {
                      slug: community.brand?.brand_slug ?? '',
                      logo: community.brand?.logo ?? '',
                      name: community.brand?.name ?? '',
                    }
                  : undefined,
                description: community.description ?? undefined,
              }}
            />
          )
        })}
      </div>
    )

  return <NoResults />
}
