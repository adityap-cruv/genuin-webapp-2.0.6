'use client'
import imgPuppet from '@images/not-found/puppet.svg'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { PATH_NAME } from '@lib/utils/constants/path'
import { NOT_FOUND_ERROR_MESSAGES } from '@/lib/constants'
import { TopBar } from '../layouts/mobile/top-bar'
import { NoContentIcon } from '@images/not-found/no-content-icon'
import { useSearchParams } from 'next/navigation'

type Props = {
  type: 'user' | 'brand' | 'community' | 'group' | 'video' | 'feed'
}

export default function EmptyView({ type }: Props) {
  const searchParams = useSearchParams()
  // Check if the 'utm_source' query parameter equals 'bcc'
  const showCreateCommunityButton = searchParams?.get('utm_source') === 'bcc'

  if (type === 'feed') {
    return (
      <main className="h-full w-full">
        <div className="block sm:hidden">
          <TopBar variant={'transparent'} />
        </div>
        <div className="h-full w-full p-4">
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl bg-cover bg-center bg-no-repeat xl:py-10"
            style={{ background: '#FAFAFA' }}>
            <NoContentIcon className="fill-primary" />
            <p className="text-title-2-demi text-secondary-300 font-medium">No Content Available</p>
            {showCreateCommunityButton && (
              <Link href={process.env.NEXT_PUBLIC_BCC_URL + '/manage/communities'}>
                <Button size="custom" className="bg-new-off-black hover:bg-new-dark-grey rounded-lg px-4 py-3">
                  <p className="text-new-para-2">Create Community</p>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="h-full w-full">
      {type !== 'user' && type !== 'brand' && (
        <div className="block sm:hidden">
          <TopBar variant={'light'} />
        </div>
      )}
      <div className="h-full w-full p-4">
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-14 rounded-2xl bg-cover bg-center bg-no-repeat xl:py-10"
          style={{ background: '#FAFAFA' }}>
          <span>
            <p className="text-heading-3 text-secondary sm:text-title-1-bold-home-m text-center font-bold">
              {NOT_FOUND_ERROR_MESSAGES[type].title}
            </p>
            <p className="text-body-1-med text-secondary-300 sm:text-title-3-med pt-4 text-center">
              {NOT_FOUND_ERROR_MESSAGES[type].description}
            </p>
          </span>
          <Image src={imgPuppet} alt="" className="h-auto w-32" width={128} height={128} />
          {NOT_FOUND_ERROR_MESSAGES[type].showButton && (
            <Link href={PATH_NAME.home()}>
              <Button size="custom" className="bg-new-off-black hover:bg-new-dark-grey rounded-lg px-4 py-3">
                <p className="text-new-para-2">Go to Home</p>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
