'use client'
import { ContactUs } from '@components/common/modals/contact-us'
import { HomeFooter } from '@components/pages/home/home-footer'
import { HomeNavBar } from '@components/pages/home/home-nav'
import { Button } from '@components/ui/button'
import GenuinLogo from '@images/home/GenuinLogo.svg'
import bhargav from '@images/home/team/bhargav.svg'
import matt from '@images/home/team/matt.svg'
import nayan_mevada from '@images/home/team/nayan_mevada.svg'
import rahul from '@images/home/team/rahul.svg'
import shabbir from '@images/home/team/shabbir.svg'
import Link from 'next/link'

export default function Component() {
  return (
    <div
      className="font-manrope"
      style={{
        background: 'linear-gradient(180deg, rgba(208, 220, 255, 0.00) 0%, rgba(208, 220, 255, 0.40) 100%)',
      }}>
      <HomeNavBar />
      <AboutUs />
      <HowWeDo />
      <Team />
      <HomeFooter />
      <ContactUs>
        <div className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center md:hidden">
          <Button
            variant={'outline'}
            size={'custom'}
            className="pointer-events-auto rounded-[35px] bg-white-alpha px-6 py-3.5 backdrop-blur-20px hover:bg-monochrome-black hover:text-monochrome-white">
            <p className="text-cap-1-bold-home">Contact us</p>
          </Button>
        </div>
      </ContactUs>
    </div>
  )
}

function AboutUs() {
  return (
    <>
      <div className="containerHome hidden sm:block">
        <div className="flex w-full items-center py-24">
          <div className="flex w-1/2 flex-col gap-9">
            <p className="text-title-1-bold-home-m">About us</p>
            <p className="text-body-2-demi-home">
              Genuin is a vertical video content provider and Community Media Network connecting retailers, brands,
              media platforms, creators, and consumers.
            </p>
          </div>
          <div className="flex w-1/2 justify-center">
            <img src={GenuinLogo.src} alt="genuin" />
          </div>
        </div>
        <div className="flex w-full py-24">
          <div className="w-1/2">
            <p className="text-title-3-bold-home">What we do</p>
          </div>
          <div className="flex w-1/2 justify-center">
            <p className="text-body-2-demi-home">
              Our white-labeled, video-based communities are built to sit within websites and inside apps, providing a
              new space for consumers to engage with brands they love through relevant, organic, and sponsored content.
            </p>
          </div>
        </div>
      </div>

      <div className="containerHome sm:hidden">
        <div className="flex w-full flex-col-reverse gap-6 py-9">
          <div className="grid gap-6">
            <p className="text-title-2-bold-home-m">About us</p>
            <p className="text-cap-1-home-m">
              Genuin is a vertical video content provider and Community Media Network connecting retailers, brands,
              media platforms, creators, and consumers.
            </p>
          </div>
          <div className="flex w-1/2 justify-center">
            <img src={GenuinLogo.src} alt="genuin" className="w-full" />
          </div>
        </div>
        <div className="flex w-full flex-col gap-6 py-9">
          <p className="text-body-2-bold-home">What we do</p>
          <p className="text-cap-1-home-m">
            Our white-labeled, video-based communities are built to sit within websites and inside apps, providing a new
            space for consumers to engage with brands they love through relevant, organic, and sponsored content.
          </p>
        </div>
      </div>
    </>
  )
}

function HowWeDo() {
  return (
    <>
      <div className="hidden bg-monochrome-black sm:block">
        <div className="containerHome grid grid-cols-2 py-24 text-monochrome-white">
          <p className="text-title-3-bold-home">How we do it</p>
          <div className="grid gap-4 text-[#959AA9]">
            <p className="pb-4 text-body-2-demi-home text-monochrome-white">
              Our platform provides a combination of benefits that are not offered anywhere else:
            </p>
            <hr />
            <p className="text-des-1-home">
              <strong className="text-monochrome-white">Own and control</strong> a new community space without the
              constraints of big social media platforms
            </p>
            <hr />
            <p className="text-des-1-home">
              <strong className="text-monochrome-white">Generate </strong>
              new revenue opportunities
            </p>
            <hr />
            <p className="text-des-1-home">
              <strong className="text-monochrome-white">Drive down</strong> customer acquisition costs (CAC)
            </p>
            <hr />
            <p className="text-des-1-home">
              <strong className="text-monochrome-white">Amplify</strong> Lifetime Value (LTV) through direct engagement
              and ownership
            </p>
            <hr />
            <p className="text-des-1-home">
              <strong className="text-monochrome-white">Cultivate</strong> a branded community environment that aligns
              with brand's values and vision
            </p>
          </div>
        </div>
      </div>

      <div className="bg-monochrome-black sm:hidden">
        <div className="containerHome grid py-9 text-monochrome-white">
          <p className="pb-9 text-body-2-bold-home">How we do it</p>
          <div className="grid gap-4 text-[#959AA9]">
            <p className="pb-4 text-cap-1-home-m text-monochrome-white">
              Our platform provides a combination of benefits that are not offered anywhere else:
            </p>
            <hr />
            <p className="text-cap-1-home-m">
              <strong className="text-monochrome-white">Own and control</strong> a new community space without the
              constraints of big social media platforms
            </p>
            <hr />
            <p className="text-cap-1-home-m">
              <strong className="text-monochrome-white">Generate </strong>
              new revenue opportunities
            </p>
            <hr />
            <p className="text-cap-1-home-m">
              <strong className="text-monochrome-white">Drive down</strong> customer acquisition costs (CAC)
            </p>
            <hr />
            <p className="text-cap-1-home-m">
              <strong className="text-monochrome-white">Amplify</strong> Lifetime Value (LTV) through direct engagement
              and ownership
            </p>
            <hr />
            <p className="text-cap-1-home-m">
              <strong className="text-monochrome-white">Cultivate</strong> a branded community environment that aligns
              with brand’s values and vision
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function Team() {
  const Team = [
    {
      image: bhargav.src,
      name: 'Bhargav Patel',
      position: 'CEO',
      linkedin: 'https://www.linkedin.com/in/patelbhargav',
    },
    {
      image: matt.src,
      name: 'Matt Wurst',
      position: 'CMO',
      linkedin: 'https://www.linkedin.com/in/matthewwurst',
    },
    {
      image: shabbir.src,
      name: 'Shabbir Helay',
      position: 'Head of Sales',
      linkedin: 'https://www.linkedin.com/in/shabbirhelaly',
    },
    {
      image: rahul.src,
      name: 'Rahul Sheth',
      position: 'CFO',
      linkedin: 'https://www.linkedin.com/in/rahul-sheth-3225164/',
    },
    {
      image: nayan_mevada.src,
      name: 'Nayan Mevada',
      position: 'CTO',
      linkedin: 'https://www.linkedin.com/in/nayanmevada',
    },
  ]

  const CardLayout = ({
    image,
    name,
    position,
    linkedin,
  }: {
    image: any
    name: string
    position: string
    linkedin: string
  }) => {
    return (
      <>
        <Link href={linkedin} target="_blank">
          <div className="flex h-44 w-full flex-col items-center justify-between rounded-3xl bg-monochrome-white p-6 shadow-sm hover:cursor-pointer hover:shadow-lg sm:w-44 sm:items-start">
            <img src={image} className="h-16 w-16 rounded-full" alt="profile" />
            <div>
              <p className="text-center text-des-1-bold-home sm:text-left">{name}</p>
              <p className="text-center text-des-1-demi-home text-[#959AA9] sm:text-left">{position}</p>
            </div>
          </div>
        </Link>
      </>
    )
  }
  return (
    <div>
      <div className="containerHome hidden gap-14 py-24 sm:grid">
        <p className="text-title-3-bold-home">Meet our team</p>
        <div className="flex flex-wrap gap-6">
          {Team.map((item, index) => (
            <CardLayout
              key={index}
              image={item.image}
              name={item.name}
              position={item.position}
              linkedin={item.linkedin}
            />
          ))}
        </div>
        <div>
          <ContactUs>
            <Button
              variant={'outline'}
              size={'custom'}
              className="rounded-[35px] px-9 py-5 hover:bg-monochrome-black hover:text-monochrome-white">
              <p className="text-body-2-bold-home">Contact us</p>
            </Button>
          </ContactUs>
        </div>
      </div>

      <div className="containerHome grid gap-14 py-9 sm:hidden">
        <p className="text-body-2-bold-home">Meet our team</p>
        <div className="grid gap-6">
          {Team.map((item, index) => (
            <CardLayout
              key={index}
              image={item.image}
              name={item.name}
              position={item.position}
              linkedin={item.linkedin}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
