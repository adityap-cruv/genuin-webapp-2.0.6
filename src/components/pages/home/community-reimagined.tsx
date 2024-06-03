import { ContactUs } from '@components/common/modals/contact-us'
import { Button } from '@components/ui/button'
import index01 from '@images/home/index-01.png'
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
              <Button variant={'outline'} size={'custom'} className="rounded-[35px] px-9 py-5 text-body-2-bold-home">
                Book a demo
              </Button>
            </ContactUs>
          </div>
        </div>
        <div className="flex h-full w-2/5 items-center justify-center">
          <video
            src="https://media.begenuin.com/backend_assets/hero_video_genuin.mp4"
            className="h-4/5 rounded-[30px] border-[6px] border-monochrome-white"
            controls={false}
            loop={true}
            autoPlay
            muted
            playsInline
          />
        </div>
      </div>

      <div
        className="flex h-full w-full flex-col items-center justify-center gap-6 bg-cover bg-center bg-no-repeat px-11 py-9 md:hidden"
        style={{
          backgroundImage: `url(${bg_genuin_logo.src})`,
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
        <video
          src="https://media.begenuin.com/backend_assets/hero_video_genuin.mp4"
          className="mt-3 w-44 rounded-3xl border-[4px] border-monochrome-white"
          controls={false}
          loop={true}
          autoPlay
          muted
          playsInline
        />
      </div>
    </>
  )
}
