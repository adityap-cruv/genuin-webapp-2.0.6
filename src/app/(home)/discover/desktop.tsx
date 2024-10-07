'use client'
// import { NavBar } from '@components/pages/build/nav-bar'
import { NavBar } from '@/components/new/nav-bar'
import bg from '@images/business/discover/bg_discover.webp'
import c1 from '@images/home-page/community/community-share-1.webp'
import c2 from '@images/home-page/community/community-share-2.webp'
import c3 from '@images/home-page/community/community-share-3.webp'
import c4 from '@images/home-page/community/community-share-4.webp'
import c5 from '@images/home-page/community/community-share-5.webp'
import l1 from '@images/home-page/loop/loop-link-share-1.webp'
import l2 from '@images/home-page/loop/loop-link-share-2.webp'
import l3 from '@images/home-page/loop/loop-link-share-3.webp'
import l4 from '@images/home-page/loop/loop-link-share-4.webp'
import l5 from '@images/home-page/loop/loop-link-share-5.webp'
import { Footer } from '@components/pages/build/footer'

export default function Desktop() {
  return (
    <>
      <NavBar />
      <SearchSection />
      <CommunitySection />
      <LoopSection />
      <Footer />
    </>
  )
}

function SearchSection() {
  // const [searchItem, setSearchItem] = useState('')

  // const handleInputChange = (e: any) => {
  //   const searchTerm = e.target.value
  //   setSearchItem(searchTerm)
  // }

  return (
    <div
      className="h-96 pt-navbar"
      style={{
        background: `url(${bg.src}) no-repeat`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <div className="container flex flex-col items-center">
        <p className="mb-6 mt-24 text-center text-new-h2">Communities on Genuin</p>
        {/* <div className="relative flex w-3/5 items-center justify-start">
          <img src={search.src} className="absolute left-4" alt="genuin" />
          <input
            type="text"
            className="w-full rounded-full border-0 p-2 px-12 outline-none"
            value={searchItem}
            onChange={handleInputChange}
            placeholder=" Search Genuin"
          />
        </div> */}
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
    <div className="container mt-8 px-40">
      <p className="text-new-para-1">Featured Communities</p>
      <div className="mt-6 grid grid-cols-2 gap-6">
        {communityList.map((item, index) => {
          return (
            <div key={index}>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <img src={item.image.src} className="rounded-3xl shadow-lg" alt="genuin" />
              </a>
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
    <div className="container mt-8 px-40 py-4">
      <p className=" text-new-para-1">Featured Loops</p>
      <div className="my-6 grid grid-cols-2 gap-6">
        {loopList.map((item, index) => {
          return (
            <div key={index}>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <img src={item.image.src} className="rounded-3xl shadow-lg" alt="genuin" />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
