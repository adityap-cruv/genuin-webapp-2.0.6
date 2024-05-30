import { Button } from '@components/ui/button'
import { GenuinIcon } from '@icons/genuin-icon'

export function HomeNavBar() {
  return (
    <nav className="sticky top-0 z-50 h-navbar w-full bg-white-alpha backdrop-blur-20px">
      <div className="container flex h-full w-full items-center justify-between">
        <GenuinIcon.logo className="fill-primary" />
        <div className="flex gap-2">
          <Button variant={'outline'} size={'custom'} className="my-3.5 rounded-[35px] border-0 md:mx-6">
            <p className="text-cap-1-home hover:text-cap-1-bold-home">About us</p>
          </Button>
          <Button
            variant={'outline'}
            size={'custom'}
            className="hidden rounded-[35px] px-6 py-3.5 text-cap-1-bold-home md:flex">
            Book a demo
          </Button>
        </div>
      </div>
    </nav>
  )
}
