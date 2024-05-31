import webmd from '@images/home/logos/webmd.svg'
import usa_today from '@images/home/logos/usa_today.svg'
import ted from '@images/home/logos/ted.svg'
import target from '@images/home/logos/target.svg'
import mondelez from '@images/home/logos/mondelez.svg'
import mattel from '@images/home/logos/mattel.svg'
import marriott_hotels from '@images/home/logos/marriott_hotels.svg'
import lowes from '@images/home/logos/lowes.svg'
import chase from '@images/home/logos/chase.svg'
import better_homes from '@images/home/logos/better_homes.svg'
import accenture from '@images/home/logos/accenture.svg'
import citrus from '@images/home/logos/citrus.svg'
import criteo from '@images/home/logos/criteo.svg'
import dentsu from '@images/home/logos/dentsu.svg'
import havas_media from '@images/home/logos/havas_media.svg'
import index_exchange from '@images/home/logos/index_exchange.svg'
import iqm from '@images/home/logos/iqm.svg'
import media1 from '@images/home/logos/media1.svg'
import publicis from '@images/home/logos/publicis.svg'
import tcs from '@images/home/logos/tcs.svg'
import wwp from '@images/home/logos/wwp.svg'
import { CustomAnimatedSection } from './animations'

export function PartnershipEcosystem() {
  const partnershipData = [
    {
      title: 'Brand partners',
      imageSource: [
        lowes.src,
        marriott_hotels.src,
        chase.src,
        target.src,
        mondelez.src,
        mattel.src,
        ted.src,
        webmd.src,
        usa_today.src,
        better_homes.src,
      ],
      class: '-translate-x-12 translate-y-10 w-full',
    },
    {
      title: 'Demand partners',
      imageSource: [media1.src, index_exchange.src, iqm.src, criteo.src, citrus.src],
      class: 'translate-x-12 translate-y-10 w-full',
    },
    {
      title: 'Implementation partners',
      imageSource: [tcs.src, accenture.src],
      class: '-translate-x-12 translate-y-10 w-full',
    },
    {
      title: 'Agency partners',
      imageSource: [publicis.src, wwp.src, havas_media.src, dentsu.src],
      class: 'translate-x-12 translate-y-10 w-full',
    },
  ]

  const InnerComp = ({ title, imageSources }: { title: string; imageSources: string[] }) => {
    return (
      <div className="h-full w-full p-2">
        <div className="border-1 h-full w-full rounded-3xl border-monochrome-9 bg-monochrome-white p-9 shadow-sm">
          <p className="pb-9 text-center text-cap-1-demi-home">{title}</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {imageSources.map((src: any, index: number) => (
              <img key={index} src={src} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="hidden w-full flex-col py-16 md:flex">
        <p className="pb-16 text-center text-title-2-bold-home">
          Join Genuin's
          <br /> Partnership Ecosystem
        </p>
        <div className="grid grid-cols-2 gap-3">
          {partnershipData.map((item: any, index: number) => (
            <CustomAnimatedSection classname={item.class} key={index}>
              <InnerComp title={item.title} imageSources={item.imageSource} />
            </CustomAnimatedSection>
          ))}
        </div>
      </div>

      <div className="w-full py-9 md:hidden">
        <p className="pb-9 text-center text-title-2-bold-home-m">
          Join Genuin's
          <br /> Partnership Ecosystem
        </p>
        <div className="grid gap-3">
          {partnershipData.map((item: any, index: number) => (
            <CustomAnimatedSection classname="w-full" key={index}>
              <InnerComp title={item.title} imageSources={item.imageSource} />
            </CustomAnimatedSection>
          ))}
        </div>
      </div>
    </>
  )
}
