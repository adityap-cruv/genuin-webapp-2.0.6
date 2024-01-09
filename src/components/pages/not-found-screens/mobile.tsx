import { TopBar } from '@components/layouts/mobile/top-bar'
import imgNotFound from '@images/not-found/notFoundMobileBG.svg'
import imgPuppet from '@images/not-found/puppet.svg'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { PATH_NAME } from '@lib/utils/constants/path'

export function NotFound() {
  return (
    <main className="h-full w-full">
      <TopBar variant="light" />
      <section className="h-body w-full px-4  pt-4">
        <div
          className="flex h-full w-full flex-col items-center justify-evenly rounded-t-2xl bg-cover bg-center bg-no-repeat py-10"
          style={{ backgroundImage: `url(${imgNotFound.src})` }}>
          <p
            className="text-center"
            style={{ fontSize: '32px', lineHeight: '110%', letterSpacing: '-0.96px', fontWeight: 700 }}>
            Oops! You <br /> shouldn't be here!
          </p>
          <Image src={imgPuppet} alt="" className="h-auto w-32" />
          <Link href={PATH_NAME.home()}>
            <Button size="custom" className="bg-new-off-black px-4 py-3 text-new-off-white hover:bg-new-dark-grey">
              <p className="text-new-para-2">Go to Home</p>
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
