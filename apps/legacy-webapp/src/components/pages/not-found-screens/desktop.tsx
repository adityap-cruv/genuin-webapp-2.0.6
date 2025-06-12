import { Layout } from '@components/layouts/desktop/layout'
import Image from 'next/image'
import imgBG from '@images/not-found/notFoundDesktopBg.svg'
import imgPuppet from '@images/not-found/puppet.svg'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

export function NotFound() {
  return (
    <Layout>
      <section className="h-full w-full p-4">
        <div
          className="h-full w-full min-w-full rounded-3xl "
          style={{
            background: `url(${imgBG.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          <div className="flex h-full w-full flex-col items-center justify-evenly xl:py-10">
            <p
              className="text-center"
              style={{ fontSize: '48px', fontWeight: 700, lineHeight: '110%', letterSpacing: '-1.44px' }}>
              Oops! You
              <br />
              shouldn't be here.
            </p>
            <Image src={imgPuppet} className="h-auto w-32" alt="" />
            <Link href={PATH_NAME.home()}>
              <Button
                size="custom"
                className="rounded-xl bg-new-off-black px-4 py-3 text-monochrome-white hover:bg-new-dark-grey">
                <p className="text-new-para-2">Go to Home</p>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
