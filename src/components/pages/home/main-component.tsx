'use client'
import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { CommunitySection } from './community-section'
import { Button } from '@components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import Link from 'next/link'
import imgC2_s1 from '@images/home-page/c2_1.webp'
import imgC2_s2 from '@images/home-page/c2_2.webp'
import imgC2_2 from '@images/home-page/c2-2.webp'
import imgC2Mobile from '@images/home-page/c2_mobile.webp'
import imgC3 from '@images/home-page/c3.webp'
import icVideoAddButton from '@icons/home-page/icVideoAddButton.svg'
import imgConnect from '@images/home-page/c4_connect.webp'
import imgDiscover from '@images/home-page/c4_discover.webp'
import imgLearn from '@images/home-page/c4_learn.webp'
import icConversation from '@icons/home-page/icConversation.svg'
import imgC5 from '@images/home-page/c5.webp'
import imgC5_2 from '@images/home-page/c5_2.webp'
import imgReviewerDp from '@images/home-page/reviewerDp.webp'
import { PATH_NAME } from '@lib/utils/constants/path'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'
import toyotaLogo from '@images/business/brand-page/brands/toyota.svg'
import toyotaBanner from '@images/business/brand-page/brands/toyota.webp'
import toyotaBanne2 from '@images/business/brand-page/brands/toyota_full.webp'
import niveaLogo from '@images/business/brand-page/brands/nivea.svg'
import niveaBanner from '@images/business/brand-page/brands/nivea.webp'
import sephoraLogo from '@images/business/brand-page/brands/sephora.svg'
import sephoraBanner from '@images/business/brand-page/brands/sephora.webp'
import doveLogo from '@images/business/brand-page/brands/dove.svg'
import doveBanner from '@images/business/brand-page/brands/dove.webp'
import cocacolaLogo from '@images/business/brand-page/brands/cocacola.svg'
import cocacolaBanner from '@images/business/brand-page/brands/cocacola.webp'

export function MainComponent() {
  return (
    <>
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
      <Component5 />
      <Component6 />
      <Component7 />
    </>
  )
}

function Component1() {
  const brandImages: any = [
    { img: toyotaLogo, alt: 'toyota', banner: toyotaBanne2 },
    { img: niveaLogo, alt: 'nivea', banner: niveaBanner },
    { img: sephoraLogo, alt: 'sephora', banner: sephoraBanner },
    { img: doveLogo, alt: 'dove', banner: doveBanner },
    { img: cocacolaLogo, alt: 'cocacola', banner: cocacolaBanner },
  ]
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex: any) => (prevIndex + 1) % brandImages?.length)
    }, 3000)

    return () => {
      clearInterval(intervalId)
    }
  }, [brandImages])

  const handleThumbnailClick = (index: any) => {
    setCurrentIndex(index)
  }
  return (
    <>
      <div
        id="initial-component"
        className="hidden min-h-full items-center justify-center pt-navbar lg:flex"
        style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
        <div className="container">
          <div className="flex h-[80vh] flex-col justify-between">
            <div className="flex items-center">
              <div className="w-1/2">
                <p className="my-4 text-new-h1" style={{ fontSize: '56px' }}>
                  Social Video Communities for Leading Brands.
                </p>
                <p className="my-4 text-new-para-1">
                  On your website, in your app, under your brand and
                  <br /> distributed on the open web.
                </p>
                <Link href={{ pathname: PATH_NAME.home() }}>
                  <Button
                    size="custom"
                    className="bg-new-off-black px-4 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                    <p className="text-new-sm">Explore Genuin</p>
                  </Button>
                </Link>
              </div>
              <div>
                <img
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  className="h-[70vh] w-full"
                  src={brandImages[currentIndex].banner.src}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
            <div className=" flex w-full justify-center gap-6">
              {brandImages?.map(
                ({ img }: any, index: any) =>
                  img && (
                    <div
                      className={`flex h-12 w-44 items-center justify-center rounded-lg p-3 `}
                      style={{
                        backgroundColor:
                          index === currentIndex ? 'rgba(249, 254, 255, 0.60)' : 'rgba(255, 255, 255, 0.10)',
                      }}
                      key={index}>
                      <img
                        loading="eager"
                        fetchPriority="auto"
                        alt={`Thumbnail ${index + 1}`}
                        decoding="async"
                        src={img.src}
                        onClick={() => {
                          handleThumbnailClick(index)
                        }}
                      />
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col items-center justify-center gap-y-4 px-5 pb-40 pt-40 lg:hidden"
        style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
        <h1 className="flex max-w-sm  justify-center text-center text-new-h2-mobile sm:text-new-h1 ">
          Natively Integrated Video Communities for Leading Brands.
        </h1>
        <p className="mx-3 max-w-sm py-2 text-center text-new-para-2 sm:w-4/5">
          With Genuin make your digital
          <br /> presence GenZ Ready with Bite-Sized
          <br /> Video Based Communities.
        </p>
        <div className="flex flex-col gap-y-4">
          <Link href={{ pathname: PATH_NAME.home() }}>
            <Button size="custom" className="bg-new-off-black px-4 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
              <p className="text-new-sm">Explore Genuin</p>
            </Button>
          </Link>
        </div>
        <div className="relative my-4 flex min-h-[300px] w-screen items-center justify-center">
          <img
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            className="absolute right-0 h-80"
            src={toyotaBanner.src}
          />
        </div>
      </div>
    </>
  )
}

function Component2() {
  return (
    <>
      <div className="my-20 hidden w-full flex-col items-center justify-center gap-y-5  lg:flex ">
        <h2 className="-tracking-new text-center text-new-h2">
          Move Beyond Traditional Editorial <br /> Communities to Video-Based Communities
        </h2>
        <div className="flex w-10/12 justify-center">
          <div>
            <img loading="lazy" fetchPriority="low" decoding="async" src={imgC2_s1.src} />
          </div>
          <div className="flex items-center">
            <img loading="lazy" fetchPriority="low" decoding="async" src={imgC2_s2.src} />
          </div>
        </div>

        <h2 className="-tracking-new mt-12 text-center text-new-h2">Your Brand Owned Video Community</h2>
        <img loading="lazy" fetchPriority="low" decoding="async" src={imgC2_2.src} />
      </div>
      <div className="flex flex-col items-center justify-center py-10 lg:hidden">
        <h2 className="w-full max-w-sm py-4 text-center text-new-h2-mobile sm:text-new-h2">
          Move Beyond
          <br /> Traditional Editorial <br /> Communities to Video-Based Communities
        </h2>
        <img loading="lazy" fetchPriority="low" decoding="async" src={imgC2Mobile.src} />

        <h2 className="mt-10 w-full max-w-sm py-4 text-center text-new-h2-mobile sm:text-new-h2">
          Your Brand Owned
          <br /> Video Community
        </h2>
        <img loading="lazy" fetchPriority="low" decoding="async" src={imgC2_2.src} className="w-10/12" />
      </div>
    </>
  )
}

function Component3() {
  return (
    <>
      <div className="relative my-40 hidden max-h-full items-center justify-around px-6 xl:container lg:flex xl:px-0">
        <img loading="lazy" fetchPriority="low" decoding="async" src={imgC3.src} />
        <div className="flex w-2/3 max-w-md flex-col gap-y-8">
          <h2 className="text-new-h2">
            Be part of the conversation with
            <img
              loading="lazy"
              fetchPriority="low"
              decoding="async"
              src={icVideoAddButton.src}
              className="ml-4 mr-3 inline-block align-bottom"
            />
            Loops
          </h2>
          <h5 className="text-new-h5">
            The nexus for dynamic one-on-one connections and collaborative discussions. Engage with customers, partners,
            and employees through Q&A prompts, multimedia sharing and crowdsourced knowledge.
          </h5>
        </div>
      </div>
      <div className="my-10 flex flex-col items-center gap-y-8 px-5 lg:hidden">
        <h2 className="max-w-xs text-center text-new-h2-mobile sm:max-w-sm sm:text-new-h2">
          Be part of the conversation
          <br /> with
          <img
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            src={icVideoAddButton.src}
            className="ml-3 mr-2 inline-block w-8 translate-y-1 align-baseline sm:mr-4 sm:w-11"
          />
          Loops
        </h2>
        <h5 className="flex w-4/5 text-center text-new-para-1-mobile">
          The nexus for dynamic one-on-one connections and collaborative discussions. Engage with customers, partners,
          and employees through Q&A prompts, multimedia sharing and crowdsourced knowledge.
        </h5>
        <img loading="lazy" fetchPriority="low" decoding="async" src={imgC3.src} className="translate-x-4 sm:w-1/2" />
      </div>
    </>
  )
}

function Component4() {
  const textRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const { scrollYProgress } = useScroll()

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const value = Number(latest.toPrecision(2))
    if (value >= 0.38 && value <= 0.64) {
      const calcValue = Math.floor((value - 0.38) * 10)
      if (currentIndexRef.current !== calcValue) {
        toggleIndex(currentIndexRef.current, calcValue)
        currentIndexRef.current = calcValue
      }
    }
  })

  function toggleIndex(oldIndex: number, newIndex: number) {
    const images = imgRef.current?.children
    const texts = textRef.current?.children
    // Edge case prevention
    if (oldIndex === 3 || newIndex === 3) return
    texts?.item(oldIndex)?.classList.toggle('!opacity-100')
    texts?.item(newIndex)?.classList.toggle('!opacity-100')
    // images?.item(oldIndex)?.classList.toggle('hidden')
    images?.item(oldIndex)?.classList.toggle('opacity-0')
    // images?.item(newIndex)?.classList.toggle('hidden')
    images?.item(newIndex)?.classList.toggle('opacity-0')
  }

  return (
    <>
      <div className="relative my-40 hidden h-[300%] lg:block">
        <div id="carousel" className="sticky top-0 h-1/3">
          <div className="h-full w-full">
            <div className="flex h-1/5 items-center justify-center">
              <h2 className="max-w-2xl text-center text-new-h2">
                Expand your horizons and add to the
                <img
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  src={icConversation.src}
                  className="ml-3 mr-4 inline-block align-bottom"
                />
                conversation
              </h2>
            </div>
            <div className="mt-10 flex h-[60%] w-full items-center px-6 pt-10 xl:container xl:px-0">
              <div
                ref={imgRef}
                className="relative w-1/2 [&>img]:inset-0 [&>img]:transition-opacity [&>img]:duration-200 [&>img]:ease-in">
                <img
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  src={imgConnect.src}
                  className="inset-0 w-3/4"
                />
                <img
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  src={imgDiscover.src}
                  className="absolute w-3/4 p-8 opacity-0"
                />
                <img
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  src={imgLearn.src}
                  className="absolute w-3/4 p-9 opacity-0"
                />
              </div>
              <div
                ref={textRef}
                className="flex h-full w-1/2 flex-col justify-center gap-y-8 px-14 [&>div]:opacity-30 [&>div]:transition-opacity [&>div]:duration-300 [&>div]:ease-in ">
                <div className="!opacity-100">
                  <h3 className="text-new-h3">Connect</h3>
                  <h5 className="mt-4 text-new-h5">Meet new people, grow your audience, and discover new interests.</h5>
                </div>
                <div>
                  <h3 className="text-new-h3">Discover</h3>
                  <h5 className="mt-4 text-new-h5">
                    Create Loops, interactive discussion spaces that combine video, photo, voice recording and text.
                  </h5>
                </div>
                <div>
                  <h3 className="text-new-h3">Learn</h3>
                  <h5 className="mt-4 text-new-h5">
                    Start conversations and invite your audience to contribute, too—a space to learn alongside and from
                    each other.
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="my-20 mt-16 flex flex-col items-center px-5 lg:hidden">
        <h2 className="mb-10 max-w-xs text-center text-new-h2-mobile sm:max-w-lg sm:text-new-h2">
          Expand your horizons and add to the
          <br />
          <img
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            src={icConversation.src}
            className="ml-3 mr-2 inline-block w-8 translate-y-1 align-baseline sm:mr-4 sm:w-11"
          />
          conversation
        </h2>
        <div className="flex w-full justify-center">
          <Accordion type="single" defaultValue="connect" collapsible className="px-3 sm:w-4/5">
            <AccordionItem value="connect" className="border-none ">
              <AccordionTrigger className="items-baseline">
                <div className="flex flex-col items-start">
                  <h3 className="mb-2 text-new-h3-mobile">Connect</h3>
                  <p className="text-start text-new-para-1-mobile">
                    Meet new people, grow your audience, and discover new interests.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <img
                  loading="eager"
                  fetchPriority="auto"
                  decoding="async"
                  src={imgConnect.src}
                  className="sm:w-1/2"
                  alt="connect"
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="discover" className="border-none ">
              <AccordionTrigger className="items-baseline">
                <div className="flex flex-col items-start">
                  <h3 className="mb-2 text-new-h3-mobile">Discover</h3>
                  <p className="text-start text-new-para-1-mobile">
                    Create Loops, interactive discussion spaces that combine video, photo, voice recording and text.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <img
                  loading="eager"
                  fetchPriority="auto"
                  decoding="async"
                  src={imgDiscover.src}
                  className="sm:w-1/2"
                  alt="discover"
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="learn" className="border-none ">
              <AccordionTrigger className="items-baseline">
                <div className="flex flex-col items-start">
                  <h3 className="mb-2 text-new-h3-mobile">Learn</h3>
                  <p className="text-start text-new-para-1-mobile">
                    Start conversations and invite your audience to contribute, too—a space to learn alongside and from
                    each other.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <img
                  loading="eager"
                  fetchPriority="auto"
                  decoding="async"
                  src={imgLearn.src}
                  className="sm:w-1/2"
                  alt="learn"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  )
}

function Component5() {
  return (
    <>
      <div className="my-40 hidden w-full flex-col items-center px-6 xl:container lg:flex xl:px-0">
        <h2 className="text-center text-new-h2">What our members say</h2>
        <div className="my-10 mt-15 flex w-full justify-between gap-10">
          <div className="flex w-3/5 flex-col gap-y-10">
            <div className="-border-spacing-10 flex h-1/2 flex-col justify-around rounded-[10px] border-[18px] border-[#E9CAF4] bg-new-off-black p-8">
              <h3 className="text-new-h3 text-new-off-white">"Infinite community possibilities."</h3>
              <div className="mt-5 flex items-center">
                <img
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  src={imgReviewerDp.src}
                  className="mr-4 h-12 w-12"
                />
                <p className="text-new-off-white">Lauren Hall, App Member</p>
              </div>
            </div>
            <div className="flex h-1/2 flex-col justify-between rounded-[15px] border-[1px] border-new-light-grey p-10">
              <h5 className="text-new-h5">
                "Since implementing, our engagement levels have skyrocketed. The platform's versatility has allowed us
                to connect with our diverse audience on a whole new level."
              </h5>
              <p className="mt-10 text-new-para-1">Esmé, Seattle, DIY Content Creator</p>
            </div>
          </div>
          <img
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            src={imgC5.src}
            className="w-3/5 lg:w-2/5 2xl:w-1/3"
          />
        </div>
        <div className="flex w-full justify-between gap-x-10">
          <img loading="lazy" fetchPriority="low" className="w-1/3" decoding="async" src={imgC5_2.src} />
          <div className="flex flex-col justify-between rounded-2xl bg-primary p-10 text-new-off-white">
            <h5 className="text-new-h5">
              Adding communities has been a game-changer for our team. The platform seamlessly connects us with our
              customers, allowing for insightful discussions and valuable feedback. The interactive format sparks
              creativity and fosters a sense of community like never before.
            </h5>
            <p className="text-new-para-1">
              Sarah Jones, <span style={{ fontWeight: '400 !important' }}>Marketing Manager</span>
            </p>
          </div>
        </div>
      </div>
      <div className="my-20 flex min-h-full flex-col items-center gap-y-10 px-5 lg:hidden">
        <h2 className="text-center text-new-h2-mobile sm:text-new-h2">What our members say</h2>
        <div className=" flex flex-col rounded-[10px] border-[18px] border-[#E9CAF4] bg-new-off-black p-4 sm:w-4/5">
          <p className="font-bold text-new-off-white" style={{ fontSize: '28px' }}>
            "Infinite community possibilities."
          </p>
          <div className="mt-5 flex w-full">
            <img
              loading="lazy"
              fetchPriority="low"
              decoding="async"
              src={imgReviewerDp.src}
              className="mr-4 h-12 w-12"
            />
            <p className="text-new-off-white">
              Lauren Hall, <br />
              App Member
            </p>
          </div>
        </div>
        <img loading="lazy" fetchPriority="low" decoding="async" src={imgC5.src} className="sm:w-1/2" />
        <div className="flex flex-col justify-between rounded-2xl bg-primary p-4 text-new-off-white sm:w-4/5">
          <p className="text-new-para-1">
            Adding communities has been a game-changer for our team. The platform seamlessly connects us with our
            customers, allowing for insightful discussions and valuable feedback. The interactive format sparks
            creativity and fosters a sense of community like never before.
          </p>
          <p className="mt-10 text-new-para-1">
            Sarah Jones, <span className="font-normal">Marketing Manager</span>
          </p>
        </div>
        <img loading="lazy" fetchPriority="low" className="sm:w-1/2" decoding="async" src={imgC5_2.src} />
      </div>
    </>
  )
}

function Component6() {
  return (
    <div className="my-10 flex flex-col items-center lg:my-20">
      <h2 className="my-6 max-w-[200px] text-center text-new-h2-mobile sm:max-w-[300px] sm:text-new-h2 lg:max-w-none">
        Community sneak peak
      </h2>
      <h5 className="mb-10 max-w-[320px] text-center text-new-h5-mobile sm:max-w-xs sm:text-new-h5 lg:max-w-xl ">
        Take a look inside some of the communities you'll find in on Genuin and get inspired to start your own.
      </h5>
      <CommunitySection />
    </div>
  )
}

function Component7() {
  return (
    <>
      <div className=" hidden h-32 bg-monochrome-9 lg:flex xl:px-0">
        <div className="flex items-center justify-between xl:container">
          <p className="text-new-h2">As Seen In</p>
          <div className="flex gap-10">
            <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-8 py-2 ">
              <img loading="lazy" fetchPriority="low" decoding="async" src={businessInsider.src} alt="genuin" />
            </div>
            <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-8 py-2 ">
              <img loading="lazy" fetchPriority="low" decoding="async" src={yahoo.src} alt="genuin" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-40 flex-col items-center justify-center gap-4 bg-monochrome-9 lg:hidden">
        <p className="text-new-h3">As Seen In</p>
        <div className="flex gap-8">
          <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-6 py-2 ">
            <img
              loading="lazy"
              fetchPriority="low"
              className="h-8"
              decoding="async"
              src={businessInsider.src}
              alt="genuin"
            />
          </div>
          <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-6 py-2 ">
            <img loading="lazy" fetchPriority="low" className="h-8" decoding="async" src={yahoo.src} alt="genuin" />
          </div>
        </div>
      </div>
    </>
  )
}
