import { Shimmer } from '@/components/shimmer'
import { getMembers } from './api'
import { useMemo } from 'react'
import { GeneralError } from '@/components/general-error'
import { ListItem } from '../community/list-item'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

export function Members({
  slug,
  showTitle = true,
}: {
  slug: string
  showTitle?: boolean
}) {
  const { data: memberData, isLoading, isError } = getMembers(slug)
  const pathName = usePathNameWithSubdomain()

  const members = useMemo(
    () => memberData?.pages.flatMap((page) => page.members),
    [memberData],
  )

  if (isLoading) return <Loader />

  // TODO:Handle error here.
  if (isError || !members) return <GeneralError />

  return (
    <div>
      {showTitle && <p className='my-2 text-title-3-bold'>Members</p>}
      <div className='h-full w-full overflow-auto'>
        {members.map((member) => {
          if (!member.nickname)
            return (
              <ListItem
                key={member.member_id}
                title={member.name ?? ''}
                subtitle={'+' + member.phone}
                description={member.bio ?? ''}
                image={member.profile_image_m ?? member.profile_image}
                isAvatar={member.is_avatar}
                brand={
                  member.brand
                    ? {
                        ...member.brand,
                        brand_user_logo: member.brand.brand_user_logo ?? 1,
                      }
                    : null
                }
                isOwner={false}
              />
            )
          return (
            <CustomLink
              key={member.member_id}
              href={
                member.brand
                  ? pathName.brand(member.brand.brand_slug)
                  : pathName.profile(member.nickname)
              }>
              <ListItem
                title={member.name ?? ''}
                subtitle={'@' + member.nickname}
                description={member.bio ?? ''}
                image={member.profile_image_m ?? member.profile_image}
                isAvatar={member.is_avatar}
                brand={
                  member.brand
                    ? {
                        ...member.brand,
                        brand_user_logo: member.brand.brand_user_logo ?? 1,
                      }
                    : null
                }
                isOwner={false}
              />
            </CustomLink>
          )
        })}
      </div>
    </div>
  )
}

function Loader() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className='m-2 flex items-center justify-center'>
          <Shimmer className='h-12 w-12 shrink-0 rounded-full' />
          <div className='ml-2 w-full'>
            <Shimmer className='my-1 h-4 w-1/4 rounded-full' />
            <Shimmer className='my-1 h-4 w-1/5 rounded-full' />
            <Shimmer className='my-1 h-4 w-full rounded-full' />
          </div>
        </div>
      ))}
    </>
  )
}
