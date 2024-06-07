import { ContactUs } from '@components/common/modals/contact-us'
import { InnerPlayer } from '@components/common/player/inner-player'
import { Button } from '@components/ui/button'
import bg_genuin_logo from '@images/home/index_genuin_logo.png'

export function CommunityReimagined() {
  return (
    <>
      <div
        className="hidden h-full w-full items-center justify-between bg-top bg-no-repeat md:flex"
        style={{ backgroundImage: `url(${bg_genuin_logo.src})` }}>
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
        <div className="relative flex h-full w-2/5 items-center justify-center">
          <InnerPlayer
            className="aspect-[32/67] h-4/5 rounded-[30px]"
            id={'1'}
            loop={true}
            videoSource="https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8"
            poster={''}
          />
          <div className="absolute aspect-[32/67] h-[81.3%] rounded-[32px] border-[7px] border-monochrome-white"></div>
        </div>
      </div>

      <div
        className="flex h-full w-full flex-col items-center justify-center gap-6 bg-no-repeat px-11 py-9 md:hidden"
        style={{
          backgroundImage: `url(${bg_genuin_logo.src})`,
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
          <InnerPlayer
            className="aspect-[32/67] w-full rounded-3xl"
            id={'1'}
            loop={true}
            videoSource="https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8"
            poster={''}
          />
          <div className="absolute aspect-[31/67] w-full rounded-[25px] border-[6px] border-monochrome-white"></div>
        </div>
      </div>
    </>
  )
}
