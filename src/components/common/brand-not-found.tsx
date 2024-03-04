import { TopBar } from '@components/layouts/desktop/top-bar'
import { Button } from '@components/ui/button'
import imgPuppet from '@images/not-found/puppet.svg'

export function BrandNotFound() {
  // TODO have to change
  return (
    <div>
      <TopBar />
      <div className="container relative -mt-20 flex h-screen items-center px-56">
        <div>
          <p className="mb-6 text-new-h2">This URL doesn't exist...yet</p>
          <p className="mb-12 text-title-1-bold font-medium">
            The URL you are attempting to access is not found.
            {/* But, you can claim it and make it yours! */}
          </p>
          {/* <Button variant="default" size={'custom'} className="bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
            <p className="text-new-para-2 font-semibold">Get Started</p>
          </Button> */}
          <img src={imgPuppet.src} alt="genuin" className="absolute bottom-0 right-0 px-56" />
        </div>
      </div>
    </div>
  )
}
