'use client'
import errorBg from '@images/error/errorDesktop.svg'
import imgPuppet from '@images/not-found/puppet.svg'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { PATH_NAME } from '@lib/utils/constants/path'

export default function Error() {
  return (
    <main className="h-full w-full p-4">
      <div
        className="flex h-full w-full flex-col items-center justify-evenly rounded-2xl bg-cover bg-center bg-no-repeat xl:py-10"
        style={{ backgroundImage: `url(${errorBg.src})` }}>
        <span>
          <p
            className="text-center"
            style={{ fontSize: '48px', lineHeight: '110%', fontWeight: 700, letterSpacing: '-0.96px' }}>
            Oops! Something <br /> went wrong.
          </p>
          <p className="pt-4 text-center text-title-3-med">Our team is trying to resolve the issue.</p>
        </span>
        <Image src={imgPuppet} alt="" className="h-auto w-32" />
        <Link href={PATH_NAME.home()}>
          <Button size="custom" className="rounded-lg bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
            <p className="text-new-para-2">Go to Home</p>
          </Button>
        </Link>
      </div>
    </main>
  )
}
