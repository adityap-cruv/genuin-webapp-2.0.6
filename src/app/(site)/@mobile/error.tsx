'use client'
import { TopBar } from '@components/layouts/mobile/top-bar'
import imgError from '@images/error/errorMobile.svg'
import imgPuppet from '@images/not-found/puppet.svg'
import Image from 'next/image'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

export default function Error() {
  return (
    <main className="h-full w-full">
      <TopBar variant="light" />
      <section className="h-body w-full px-4 pt-4">
        <div
          className="flex h-full w-full flex-col items-center justify-evenly rounded-t-2xl bg-cover bg-center bg-no-repeat py-10"
          style={{
            backgroundImage: `url(${imgError.src})`,
          }}>
          <span>
            <p
              className="text-center"
              style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.96px', lineHeight: '110%' }}>
              Oops!Something <br /> went wrong.
            </p>
            <p className="pt-3 text-body-sm" style={{ fontWeight: 500 }}>
              Our team is trying to resolve the issue.
            </p>
          </span>
          <Image src={imgPuppet} className="h-auto w-32" alt="" />
          <Link href={PATH_NAME.home()}>
            <Button size="custom" className="rounded-lg bg-new-off-black px-4 py-3">
              <p className="text-new-para-2">Go to Home</p>
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
