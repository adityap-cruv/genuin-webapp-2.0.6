import { CustomAvatar } from '@/components/custom-avatar'
import { type PeopleType } from '.'
import { NoResults } from './no-results'
import { TickIcon } from '@/components/icons/tick-icon'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { useSearchBarContext } from '@/components/search-bar/context'

export function People({ people }: { people?: PeopleType[] }) {
  const { close } = useSearchBarContext()
  const pathName = usePathNameWithSubdomain()
  if (people)
    return (
      <div className='flex flex-col px-2 pb-16 pt-2 sm:py-4'>
        {people.map((item) => {
          return (
            <CustomLink
              target='_blank'
              onClick={() => {
                close()
              }}
              href={
                item.brand
                  ? pathName.brand(item.brand.brand_slug)
                  : pathName.profile(item.userName)
              }
              key={item.id}
              className='flex items-center gap-x-2 rounded-md px-2 py-2 hover:bg-tertiary-200'>
              <CustomAvatar
                fallbackString={item.name ?? ''}
                imageUrl={item.profileImage ?? ''}
                isAvatar={item.isAvatar}
                className='h-12 w-12'
              />
              <div className='flex flex-col gap-y-0.5'>
                <div className='flex items-center gap-1'>
                  <p className='text-body-1-bold'>{`@${item.userName}`}</p>
                  {item.brand && (
                    <div className='flex items-center gap-0.5'>
                      <TickIcon className='h-3 w-3 fill-primary' />
                      <p className='text-cap-2-demi text-primary'>Brand</p>
                    </div>
                  )}
                </div>
                {item.name && <p className='text-body-1-demi'>{item.name}</p>}
                {item.bio && (
                  <p className='line-clamp-1 text-cap-1-demi text-tertiary'>
                    {item.bio}
                  </p>
                )}
              </div>
            </CustomLink>
          )
        })}
      </div>
    )

  return <NoResults />
}
