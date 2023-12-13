import { GenuinLogo } from '@components/ui/genuin-logo'
import { Button } from '@components/ui/button'

export function TopBar() {
  return (
    <>
      <div
        style={{ backgroundColor: 'rgba(248, 248, 248, 0.80)' }}
        className="flex hidden w-full justify-center border-b border-monochrome-9 sm:flex">
        <nav className="sticky top-0 flex h-[76px] w-full max-w-1440 items-center justify-between   px-2">
          <GenuinLogo variant="black" />
          <div className="flex gap-x-3">
            <Button variant="outline" className="hover:bg-new-off-black hover:text-new-off-white">
              <p>We're hiring!</p>
            </Button>
            <Button variant="default" className="bg-new-off-black hover:bg-new-dark-grey">
              <p>Download Genuin</p>
            </Button>
          </div>
        </nav>
      </div>
      <div></div>
    </>
  )
}
