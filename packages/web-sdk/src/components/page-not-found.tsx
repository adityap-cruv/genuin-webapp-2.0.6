import { cn } from '@/utils'
import { ComponentProps } from 'react'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type PageNotFoundPropsType = ComponentProps<'div'> & { errorMessage?: string }

export function PageNotFound({
  className,
  errorMessage = 'Page Not Found!',
  ...restProps
}: PageNotFoundPropsType) {
  const pathName = usePathNameWithSubdomain()
  return (
    <div
      className={cn(
        'flex items-center bg-tertiary-200 justify-center h-full w-full',
        className,
      )}
      {...restProps}>
      <div className='flex flex-col gap-3 items-center justify-center'>
        <p className='text-foreground text-title-2-demi'>{errorMessage}</p>
        <CustomLink
          href={pathName.home()}
          className='bg-primary rounded-lg text-title-3-demi text-white hover:bg-primary-700 px-4 py-2'>
          Go To Home
        </CustomLink>
      </div>
    </div>
  )
}
