import { Button } from '@components/ui/button'
import adobe from '@images/home/ticker-logos/adobe.svg'
import eko from '@images/home/ticker-logos/eko.svg'
import infy from '@images/home/ticker-logos/infy.svg'
import mckinsey from '@images/home/ticker-logos/mckinsey.svg'
import meta from '@images/home/ticker-logos/meta.svg'
import microsoft from '@images/home/ticker-logos/microsoft.svg'
import motorola from '@images/home/ticker-logos/motorola.svg'
import tiktok from '@images/home/ticker-logos/tiktok.svg'
import ziff_davis from '@images/home/ticker-logos/ziff-davis.svg'
import Iqm from '@images/home/ticker-logos/iqm.svg'

export function TickerCarousel() {
  const logos = [
    Iqm.src,
    infy.src,
    mckinsey.src,
    meta.src,
    eko.src,
    microsoft.src,
    motorola.src,
    tiktok.src,
    ziff_davis.src,
    adobe.src,
  ]
  return (
    <div className="flex w-screen flex-col items-center py-9 md:py-16">
      <div className="pb-9">
        <Button variant={'outline'} size={'custom'} className="rounded-lg border-monochrome-9 px-4 py-2">
          <p className="text-cap-1-demi-home">Built by a world-class team</p>
        </Button>
      </div>
      <div className="container w-full overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <div className="flex gap-12">
            {logos.map((src: any, index: number) => (
              <img key={index} src={src} />
            ))}
            {logos.map((src: any, index: number) => (
              <img key={index} src={src} />
            ))}
            {logos.map((src: any, index: number) => (
              <img key={index} src={src} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
