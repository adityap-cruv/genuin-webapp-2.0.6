import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { ListItem } from './list-item'
import type { CommunityDetailsType } from './schema'

type LeaderPropsType = Pick<CommunityDetailsType, 'leader'> &
  Pick<CommunityDetailsType, 'moderators'>

export function Leaders({ leader, moderators }: LeaderPropsType) {
  const pathName = usePathNameWithSubdomain()

  if (!leader || leader.nickname.length === 0) {
    return null
  }

  return (
    <div className='mb-4'>
      <p className='my-2 text-title-3-bold'>Admins</p>
      <CustomLink
        href={
          leader.brand
            ? pathName.brand(leader.brand.brand_slug)
            : pathName.profile(leader.nickname)
        }>
        <ListItem
          title={leader.name ?? ''}
          subtitle={'@' + leader.nickname}
          description={leader.bio ?? ''}
          image={leader.profile_image}
          isAvatar={leader.is_avatar}
          brand={
            leader.brand
              ? {
                  ...leader.brand,
                  brand_user_logo: leader.brand.brand_user_logo ?? 1,
                }
              : undefined
          }
          isOwner={true}
        />
      </CustomLink>
      {moderators.length > 0 &&
        moderators.map((item, index) => {
          return (
            <CustomLink
              key={index}
              href={
                item.brand
                  ? pathName.brand(item.brand.brand_slug)
                  : pathName.profile(item.nickname)
              }>
              <ListItem
                title={item.name ?? ''}
                subtitle={'@' + item.nickname}
                description={item.bio ?? ''}
                image={item.profile_image_m ?? item.profile_image}
                isAvatar={item.is_avatar}
                brand={
                  item.brand
                    ? {
                        ...item.brand,
                        brand_user_logo: item.brand.brand_user_logo ?? 1,
                      }
                    : undefined
                }
                isOwner={false}
              />
            </CustomLink>
          )
        })}
    </div>
  )
}
