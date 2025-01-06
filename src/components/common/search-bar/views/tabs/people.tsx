import { CustomAvatar } from '@components/custom/custom-avatar'
import { type PeopleType } from '.'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { NoResults } from './no-results'
import { useSearchBarStore } from '../../store'
import BrandBadgeIcon from '@/components/common/brand-badge-icon'

export function People({ people }: { people?: PeopleType[] }) {
  const { close } = useSearchBarStore((state) => ({ close: state.close }))
  if (people)
    return (
      <div className="flex flex-col px-2 pb-16 pt-2 sm:py-4">
        {people.map((item) => {
          return (
            <Link
              onClick={close}
              href={item.brand ? PATH_NAME.brand(item.brand.brand_slug) : PATH_NAME.profile(item.userName)}
              key={item.id}
              className="flex items-center gap-x-2 rounded-md px-2 py-2 hover:bg-primary-200">
              <CustomAvatar
                fallbackString={item.name ?? ''}
                imageUrl={item.profileImage ?? ''}
                isAvatar={item.isAvatar}
                className="h-12 w-12"
              />
              <span className="flex flex-col gap-y-0.5">
                <div className="flex items-center gap-1">
                  <p className="text-body-1-bold">{`@${item.userName}`}</p>
                  {item.brand && <BrandBadgeIcon userLogoType={item.brand?.brand_user_logo} variant="dark" />}
                </div>
                {item.name && <p className="text-body-1-demi">{item.name}</p>}
                {item.bio && <p className="line-clamp-1 text-cap-1-demi text-tertiary">{item.bio}</p>}
              </span>
            </Link>
          )
        })}
      </div>
    )

  return <NoResults />
}
