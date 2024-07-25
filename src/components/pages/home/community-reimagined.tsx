import { VanillaPlayer } from '@/components/common/vanilla-player'
import { ContactUs } from '@components/common/modals/contact-us'
import { Button } from '@components/ui/button'
import bgGenuinLogo from '@images/home/index_genuin_logo.png'

export function CommunityReimagined() {
  return (
    <>
      <div
        className="hidden h-full w-full items-center justify-between bg-top bg-no-repeat md:flex"
        style={{ backgroundImage: `url(${bgGenuinLogo.src})` }}>
        <div className="flex w-3/5 flex-col gap-9">
          <p className="text-title-1-bold-home">
            Community{' '}
            <span className="bg-gradient-to-r from-[#D693FF] to-[#2058FF] bg-clip-text text-transparent">
              Reimagined.
            </span>
          </p>
          <p className="text-body-1-home">
            Create video-based communities within your retail media network to drive engagement and new revenue.
          </p>
          <div>
            <ContactUs>
              <Button
                variant={'outline'}
                size={'custom'}
                className="rounded-[35px] px-9 py-5 text-body-2-bold-home hover:bg-home-black hover:text-monochrome-white">
                Book a demo
              </Button>
            </ContactUs>
          </div>
        </div>
        <VanillaPlayer
          className="h-4/5 overflow-clip rounded-[37px] border-[12px] border-monochrome-white"
          id="home-player"
          videoSource="https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8"
          loop={true}
          poster="https://media.begenuin.com/backend_assets/hero-video/hero-video.png"
        />
      </div>
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-6 bg-no-repeat px-11 py-9 md:hidden"
        style={{
          backgroundImage: `url(${bgGenuinLogo.src})`,
          backgroundPosition: 'center',
          backgroundSize: '100%',
        }}>
        <p className="text-center text-title-1-bold-home-m">
          Community{' '}
          <span className="bg-gradient-to-r from-[#D693FF] to-[#2058FF] bg-clip-text text-transparent">
            Reimagined.
          </span>
        </p>
        <p className="text-center text-cap-1-home-m">
          Create video-based communities within your retail media network to drive engagement and new revenue.
        </p>
        <div className="relative flex w-44 items-center justify-center">
          <VanillaPlayer
            className="overflow-clip rounded-3xl border-[8px] border-monochrome-white"
            id={'1'}
            muted
            loop
            videoSource="https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8"
            poster="https://media.begenuin.com/backend_assets/hero-video/hero-video.png"
          />
        </div>
      </div>
    </>
  )
}
