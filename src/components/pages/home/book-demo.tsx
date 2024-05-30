import { Button } from '@components/ui/button'

export function BookDemo() {
  return (
    <>
      <div className="container hidden py-16 md:block">
        <div className="flex flex-col items-center gap-9 rounded-[36px] bg-gradient-to-r from-[#9395FF] to-[#1685FD] p-14">
          <p className="text-title-2-bold-home text-monochrome-white">Book a demo with Genuin!</p>
          <p className="text-center text-body-2-home text-monochrome-white">
            Request our quick-start demo and learn about increasing customer engagement with your new Community Media
            Network to boost your media revenue.
          </p>
          <div>
            <Button
              variant={'outline'}
              size={'custom'}
              className="rounded-[35px] border-monochrome-white px-9 py-5 text-body-2-bold-home">
              <p className="text-monochrome-white">Book a demo</p>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-9 md:hidden">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-r from-[#9395FF] to-[#1685FD] p-6">
          <p className="text-center text-body-2-bold-home text-monochrome-white">
            Book a demo with
            <br /> Genuin!
          </p>
          <p className="text-cap-2-home-m text-center text-monochrome-white">
            Request our quick-start demo and learn about increasing customer engagement with your new Community Media
            Network to boost your media revenue.
          </p>
        </div>
      </div>
    </>
  )
}
