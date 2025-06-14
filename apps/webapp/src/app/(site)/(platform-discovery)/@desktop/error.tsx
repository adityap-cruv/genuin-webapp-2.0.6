'use client'
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
        style={{ background: '#FAFAFA' }}>
        <span>
          <p
            className="text-center"
            style={{ fontSize: '48px', lineHeight: '110%', fontWeight: 700, letterSpacing: '-0.96px' }}>
            There seems to be an issue on our end.
          </p>
          <p className="text-title-3-med pt-4 text-center">Our team is working to resolve it as quickly as possible.</p>
        </span>
        <Image src={imgPuppet} alt="" className="h-auto w-32" height={128} width={128} />
        <Link href={PATH_NAME.home()}>
          <Button size="custom" className="bg-new-off-black hover:bg-new-dark-grey rounded-lg px-4 py-3">
            <p className="text-new-para-2">Go to Home</p>
          </Button>
        </Link>
      </div>
    </main>
  )
}
