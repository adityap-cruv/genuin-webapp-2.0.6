import { NavBar } from '@components/pages/home/nav-bar'
import { Input } from '@components/ui/input'
import bg from '@images/business/discover/bg_discover_mobile.webp'
import c1 from '@images/home-page/community/communityshare 1.webp'
import c2 from '@images/home-page/community/communityshare 2.webp'
import c3 from '@images/home-page/community/communityshare 3.webp'
import c4 from '@images/home-page/community/communityshare 4.webp'
import c5 from '@images/home-page/community/communityshare 5.webp'
import l1 from '@images/home-page/loop/Loop-Link-Share 1.webp'
import l2 from '@images/home-page/loop/Loop-Link-Share 2.webp'
import l3 from '@images/home-page/loop/Loop-Link-Share 3.webp'
import l4 from '@images/home-page/loop/Loop-Link-Share 4.webp'
import l5 from '@images/home-page/loop/Loop-Link-Share 5.webp'
import Link from 'next/link'

export default function Mobile() {
  return (
    <>
      <NavBar />
      <SearchSection />
      <CommunitySection />
      <LoopSection />
    </>
  )
}

function SearchSection() {
  return (
    <div
      className="h-56 pt-navbar"
      style={{
        background: `url(${bg.src}) no-repeat`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <div className="container flex flex-col items-center">
        <p className="mb-6 mt-4 text-center text-new-para-1 font-bold">Find your community on Genuin</p>
        <Input className="w-3/5 rounded-full border-0" type="text" placeholder="Search Genuin" />
      </div>
    </div>
  )
}

function CommunitySection() {
  const communityList = [
    {
      image: c1,
      link: 'https://begenuin.com/community/meaningful-love-gifts',
    },
    {
      image: c2,
      link: 'https://begenuin.com/community/flawless-makeup-secrets',
    },
    {
      image: c3,
      link: 'https://begenuin.com/community/knowledge-sharing-talks',
    },
    {
      image: c4,
      link: 'https://begenuin.com/community/home-improvement-community',
    },
    {
      image: c5,
      link: 'https://begenuin.com/community/vibrant-creative-community',
    },
  ]
  return (
    <div className="container mt-8">
      <p className="text-new-h5-mobile">Featured communities</p>
      <div className="mt-6 grid grid-cols-1 gap-6">
        {communityList.map((item, index) => {
          return (
            <div key={index}>
              <Link href={item.link}>
                <img src={item.image.src} className="rounded-3xl shadow-lg" alt="genuin" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LoopSection() {
  const loopList = [
    {
      image: l1,
      link: 'https://begenuin.com/loop/customized-gifts-impact-loved-ones',
    },
    {
      image: l2,
      link: 'https://begenuin.com/loop/welcome-to-lms-beauty',
    },
    {
      image: l3,
      link: 'https://begenuin.com/loop/new-vision-perspective',
    },
    {
      image: l4,
      link: 'https://begenuin.com/loop/lowes-loyalty-rewards-tips',
    },
    {
      image: l5,
      link: 'https://begenuin.com/loop/latest-features-tools-creations',
    },
  ]
  return (
    <div className="container mb-4 mt-8">
      <p className=" text-new-h5-mobile">Featured Loops</p>
      <div className="mt-6 grid grid-cols-1 gap-6">
        {loopList.map((item, index) => {
          return (
            <div key={index}>
              <Link href={item.link}>
                <img src={item.image.src} className="rounded-3xl shadow-lg" alt="genuin" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
