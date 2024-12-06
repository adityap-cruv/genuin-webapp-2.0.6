'use client'
import imgPuppet from '@images/not-found/puppet.svg'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { PATH_NAME } from '@lib/utils/constants/path'
import { NOT_FOUND_ERROR_MESSAGES } from '@/lib/constants'
import { TopBar } from '../layouts/mobile/top-bar'
import { NoContentIcon } from '@images/not-found/no-content-icon'
import { useGenuinOptions } from '@/lib/stores/genuin-options'

type Props = {
  type: 'user' | 'brand' | 'community' | 'group' | 'video' | 'feed'
}

export default function EmptyView({ type }: Props) {
  const embed = useGenuinOptions().embed
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
            <p className="text-title-2-demi font-medium text-secondary-300">No Content Available</p>
            {embed && (
              <Link href={PATH_NAME.home()}>
                <Button size="custom" className="rounded-lg bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
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
      <div className="block sm:hidden">
        <TopBar variant={'light'} />
      </div>
      <div className="h-full w-full p-4">
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-14 rounded-2xl bg-cover bg-center bg-no-repeat xl:py-10"
          style={{ background: '#FAFAFA' }}>
          <span>
            <p className="text-center text-heading-3 font-bold text-secondary sm:text-title-1-bold-home-m">
              {NOT_FOUND_ERROR_MESSAGES[type].title}
            </p>
            <p className="pt-4 text-center text-body-1-med text-secondary-300 sm:text-title-3-med">
              {NOT_FOUND_ERROR_MESSAGES[type].description}
            </p>
          </span>
          <Image src={imgPuppet} alt="" className="h-auto w-32" />
          {NOT_FOUND_ERROR_MESSAGES[type].showButton && (
            <Link href={PATH_NAME.home()}>
              <Button size="custom" className="rounded-lg bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
                <p className="text-new-para-2">Go to Home</p>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
