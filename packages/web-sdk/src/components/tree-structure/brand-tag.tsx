import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { CustomAvatar } from '../custom-avatar'
import { CustomLink } from '@/router/custom-link'

type BrandTagPropsType = {
  slug: string
  logo: string
  name: string
}

export function BrandTag({ slug, logo, name }: BrandTagPropsType) {
  const pathName = usePathNameWithSubdomain()

  return (
    <>
      <CustomLink
        href={pathName.brand(slug)}
        target='_blank'
        className='flex items-center gap-1'>
        <div className='flex items-center gap-1 rounded-full bg-tertiary-200 p-1 pr-1.5 '>
          <CustomAvatar
            imageUrl={logo}
            fallbackString={name}
            isAvatar={false}
            className='h-4 w-4'
          />
          <p
            className='truncate text-cap-1-demi text-secondary'
            style={{
              maxWidth: '10ch',
            }}>
            {name}
          </p>
        </div>
      </CustomLink>
    </>
  )
}
