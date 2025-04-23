import { getCommunityMembers } from './api'
import { Shimmer } from '@/components/shimmer'
import { MembersType } from './schema'
import { ComponentProps } from 'react'
import { CustomLink } from '@/router/custom-link'
import { cn } from '@/utils'
import { ListItem } from './list-item'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type MembersPropsType = { slug: string } & ComponentProps<'div'>

export function Members({ slug, className, ...restProps }: MembersPropsType) {
  const { data: members, isLoading } = getCommunityMembers(slug)
  const pathName = usePathNameWithSubdomain()

  if (isLoading)
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

  if (members && members.length !== 0)
    return (
      <div
        className={cn('py-2', className)}
        {...restProps}>
        {members.map((member: MembersType, index: number) => {
          if (member.nickname)
            return (
              <CustomLink
                key={index}
                href={
                  member.brand
                    ? pathName.brand(member.brand.brand_slug)
                    : pathName.profile(member.nickname)
                }>
                <ListItem
                  title={member.name ?? ''}
                  subtitle={'@' + member.nickname}
                  description={member?.bio ?? ''}
                  image={member.profile_image}
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
          return null
        })}
      </div>
    )
}
