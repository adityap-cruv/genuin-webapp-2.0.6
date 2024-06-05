import { ContactUs } from '@components/common/modals/contact-us'
import { Button } from '@components/ui/button'

export function BookDemo() {
  return (
    <div className="flex w-screen justify-center bg-[#F5F7FA]">
      <div className="container hidden py-16 md:block">
        <div className="flex flex-col items-center gap-9 rounded-[36px] bg-gradient-to-r from-[#9395FF] to-[#1685FD] p-14">
          <p className="text-title-2-bold-home text-monochrome-white">Book a demo with Genuin!</p>
          <p className="text-center text-body-2-home text-monochrome-white">
            Request our quick-start demo and learn about increasing customer engagement with your new Community Media
            Network to boost your media revenue.
          </p>
          <div>
            <ContactUs>
              <Button
                variant={'outline'}
                size={'custom'}
                className="rounded-[35px] border-monochrome-white px-9 py-5 text-monochrome-white hover:bg-monochrome-white hover:text-monochrome-black">
                <p className="text-body-2-bold-home">Book a demo</p>
              </Button>
            </ContactUs>
          </div>
        </div>
      </div>

      <div className="container py-9 md:hidden">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-r from-[#9395FF] to-[#1685FD] p-6">
          <p className="text-center text-body-2-bold-home text-monochrome-white">
            Book a demo with
            <br /> Genuin!
          </p>
          <p className="text-center text-cap-2-home-m text-monochrome-white">
            Request our quick-start demo and learn about increasing customer engagement with your new Community Media
            Network to boost your media revenue.
          </p>
        </div>
      </div>
    </div>
  )
}
