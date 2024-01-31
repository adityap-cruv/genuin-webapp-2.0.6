import { useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import Image from 'next/image'
import { CommunitySection } from './community-section'
import { Button } from '@components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { DownloadAppDialog } from './download-app-dialog'
import Link from 'next/link'

// all images import
import imgC1 from '@images/home-page/c1.png'
import imgC1Mobile from '@images/home-page/c1_mobile.png'
import qrImage from '@images/home-page/download_qr.svg'
import icAddButton from '@icons/home-page/icAddButton.svg'
import imgC2 from '@images/home-page/c2.png'
import imgC2Mobile from '@images/home-page/c2_mobile.png'
import imgC3 from '@images/home-page/c3.png'
import icVideoAddButton from '@icons/home-page/icVideoAddButton.svg'
import imgConnect from '@images/home-page/c4_connect.png'
import imgDiscover from '@images/home-page/c4_discover.png'
import imgLearn from '@images/home-page/c4_learn.png'
import icConversation from '@icons/home-page/icConversation.svg'
import imgC5 from '@images/home-page/c5.png'
import imgC5_2 from '@images/home-page/c5_2.png'
import imgReviewerDp from '@images/home-page/reviewerDp.png'
import { PATH_NAME } from '@lib/utils/constants/path'

export function Desktop() {
  return (
    <>
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
      <Component5 />
      <Component6 />
      {/* <Component7 /> */}
    </>
  )
}

function Component1() {
  return (
    <>
      <div
        id="initial-component"
        className="hidden min-h-full items-center pt-navbar lg:flex"
        style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
        <div className="container flex h-full w-full items-center justify-around">
          <div className="w-[60%] flex-col justify-between">
            <h1 className="text-new-h1">
              Community,
              <br /> reimagined. Learn, connect and engage
              <br /> — all under one roof.
            </h1>
            <div className="mt-15 flex items-center gap-x-5">
              <Image priority loading="eager" src={qrImage} alt="Download Genuin!" unoptimized />
              <p className="max-w-md text-left text-new-para-1">
                Download Genuin to create communities, interact with your audience, and start conversations on the
                topics that really matter.
              </p>
            </div>
          </div>
          <Image priority loading="eager" className="w-[40%]" src={imgC1} alt="genuin" />
        </div>
      </div>
      <div
        className="flex min-h-full flex-col items-center justify-center gap-y-4 px-5 pt-navbar lg:hidden"
        style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
        <h1 className="flex max-w-xs  justify-center py-5 text-center text-new-h1-mobile sm:text-new-h1 ">
          Community, reimagined.
        </h1>
        <p className="mx-3 max-w-xs text-center text-new-md sm:w-4/5">
          Download Genuin to create communities, interact with your audience, and start conversations on the topics that
          really matter.
        </p>
        <div className="flex flex-col gap-y-4">
          <DownloadAppDialog isMobile>
            <Button size="custom" className="bg-new-off-black px-5 py-4 after:bg-new-dark-grey hover:bg-new-dark-grey">
              <p className="text-new-md text-new-off-white">Download Genuin</p>
            </Button>
          </DownloadAppDialog>
          <Link href={{ pathname: PATH_NAME.home() }}>
            <Button size="custom" variant="outline" className="w-full px-5 py-4">
              <p className="text-new-md">Explore Genuin</p>
            </Button>
          </Link>
        </div>
        <Image
          priority
          unoptimized
          loading="eager"
          className="w-4/5 translate-x-2 py-5 sm:w-1/2"
          src={imgC1Mobile}
          alt="genuin"
        />
      </div>
    </>
  )
}

function Component2() {
  return (
    <>
      <div className="my-20 hidden max-h-full w-full flex-col items-center justify-center gap-y-5  lg:flex ">
        <h2 className="-tracking-new max-w-lg text-center text-new-h2">
          <Image
            priority
            loading="eager"
            src={icAddButton}
            alt="Add"
            className="mr-2 inline-block h-full translate-y-1 align-top"
            unoptimized
          />
          Create and grow your own community
        </h2>
        <Image priority unoptimized loading="eager" className="w-1/2" src={imgC2} alt="Create you community!" />
      </div>
      <div className="flex flex-col items-center justify-center py-10 lg:hidden">
        <h2 className="w-full max-w-sm py-4 text-center text-new-h2-mobile sm:text-new-h2">
          <Image
            unoptimized
            priority
            loading="eager"
            src={icAddButton}
            alt="add"
            className="mr-2 inline-block w-8 translate-y-1 align-baseline sm:mr-4 sm:w-11"
          />
          Create and grow your own community
        </h2>
        <Image
          priority
          unoptimized
          loading="eager"
          src={imgC2Mobile}
          alt="genuin"
          className="py-4 sm:w-1/2 sm:translate-x-5"
        />
      </div>
    </>
  )
}

function Component3() {
  return (
    <>
      <div className="relative my-40 hidden max-h-full items-center justify-around px-6 xl:container lg:flex xl:px-0">
        <Image priority loading="eager" unoptimized className="w-1/3" src={imgC3} alt="genuin" />
        <div className="flex w-2/3 max-w-md flex-col gap-y-8">
          <h2 className="text-new-h2">
            Be part of the conversation with
            <Image
              priority
              unoptimized
              loading="eager"
              src={icVideoAddButton}
              alt="Add Video"
              className="ml-4 mr-3 inline-block align-bottom"
            />
            Loops
          </h2>
          <h5 className="text-new-h5">
            Loops are interactive discussion spaces where you can kickstart discussions with Q&A prompts, learn from
            each other, and join in with video, photo, voice recording or text responses. It's crowdsourced knowledge at
            your fingertips.
          </h5>
        </div>
      </div>
      <div className="my-20 flex flex-col items-center gap-y-8 px-5 lg:hidden">
        <h2 className="max-w-xs text-center text-new-h2-mobile sm:max-w-sm sm:text-new-h2">
          Be part of the conversation
          <br /> with
          <Image
            priority
            unoptimized
            loading="eager"
            src={icVideoAddButton}
            alt="add"
            className="ml-3 mr-2 inline-block w-8 translate-y-1 align-baseline sm:mr-4 sm:w-11"
          />
          Loops
        </h2>
        <h5 className="flex w-4/5 text-center text-new-h5">
          Loops are interactive discussion spaces where you can join in with video, photo, voice recording and text
          responses.
        </h5>
        <Image priority unoptimized loading="eager" src={imgC3} alt="loops" className="translate-x-4 sm:w-1/2" />
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
    if (value >= 0.32 && value <= 0.58) {
      const calcValue = Math.floor((value - 0.32) * 10)
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
                <Image
                  priority
                  unoptimized
                  loading="eager"
                  src={icConversation}
                  alt="conversation"
                  className="ml-3 mr-4 inline-block align-bottom"
                />
                conversation
              </h2>
            </div>
            <div className="mt-10 flex h-[60%] w-full items-center px-6 pt-10 xl:container xl:px-0">
              <div
                ref={imgRef}
                className="relative w-1/2 [&>img]:inset-0 [&>img]:transition-opacity [&>img]:duration-200 [&>img]:ease-in">
                <Image priority unoptimized loading="eager" src={imgConnect} alt="connect" className="inset-0 w-3/4" />
                <Image
                  priority
                  unoptimized
                  loading="eager"
                  src={imgDiscover}
                  alt="discover"
                  className="absolute w-3/4 p-8 opacity-0"
                />
                <Image
                  priority
                  unoptimized
                  loading="eager"
                  src={imgLearn}
                  alt="learn"
                  className="absolute w-3/4 p-9 opacity-0"
                />
              </div>
              <div
                ref={textRef}
                className="flex h-full w-1/2 flex-col justify-center gap-y-8 [&>div]:opacity-30 [&>div]:transition-opacity [&>div]:duration-300 [&>div]:ease-in ">
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
          <Image
            priority
            loading="eager"
            unoptimized
            src={icConversation}
            width={40}
            height={30}
            alt="conversation"
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
                  <p className="text-start text-new-para-1">
                    Meet new people, grow your audience, and discover new interests.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <Image priority loading="eager" className="sm:w-1/2" src={imgConnect} alt="connect" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="discover" className="border-none ">
              <AccordionTrigger className="items-baseline">
                <div className="flex flex-col items-start">
                  <h3 className="mb-2 text-new-h3-mobile">Discover</h3>
                  <p className="text-start text-new-para-1">
                    Create Loops, interactive discussion spaces that combine video, photo, voice recording and text.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <Image unoptimized priority loading="eager" className="sm:w-1/2" src={imgDiscover} alt="discover" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="learn" className="border-none ">
              <AccordionTrigger className="items-baseline">
                <div className="flex flex-col items-start">
                  <h3 className="mb-2 text-new-h3-mobile">Learn</h3>
                  <p className="text-start text-new-para-1">
                    Start conversations and invite your audience to contribute, too—a space to learn alongside and from
                    each other.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <Image priority unoptimized loading="eager" className="sm:w-1/2" src={imgLearn} alt="learn" />
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
                <Image
                  priority
                  loading="eager"
                  unoptimized
                  src={imgReviewerDp}
                  alt="lauren hall"
                  className="mr-4 h-12 w-12"
                />
                <p className="text-new-off-white">Lauren Hall, App Member</p>
              </div>
            </div>
            <div className="flex h-1/2 flex-col justify-between rounded-[15px] border-[1px] border-new-light-grey p-10">
              <h5 className="text-new-h5">
                "Genuin is so community–driven — I love having that level of interaction with people sharing their own
                versions of my DIY hacks and offering their own tips."
              </h5>
              <p className="mt-10 text-new-para-1">Esmé, Seattle, DIY Content Creator</p>
            </div>
          </div>
          <Image priority loading="eager" src={imgC5} alt="genuin" unoptimized className="w-3/5 lg:w-2/5 2xl:w-1/3" />
        </div>
        <div className="flex w-full justify-between gap-x-10">
          <Image priority loading="eager" className="w-1/3" src={imgC5_2} alt="board" unoptimized />
          <div className="flex flex-col justify-between rounded-2xl bg-primary p-10 text-new-off-white">
            <h5 className="text-new-h5">
              I love following creators on Instagram and TikTok, but I always wished I could interact with people who
              share the same interests as me. On Genuin, I'm part of communities on everything from venture capital to
              books, and I love engaging with others about these topics.
            </h5>
            <p className="text-new-para-1">
              Jamie Mars, <span style={{ fontWeight: '400 !important' }}>Student & Future Investor</span>
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
            <Image
              priority
              loading="eager"
              src={imgReviewerDp}
              alt="lauren hall"
              className="mr-4 h-12 w-12"
              unoptimized
            />
            <p className="text-new-off-white">
              Lauren Hall, <br />
              App Member
            </p>
          </div>
        </div>
        <Image priority loading="eager" className="sm:w-1/2" src={imgC5} alt="genuin" unoptimized />
        <div className="flex flex-col justify-between rounded-2xl bg-primary p-4 text-new-off-white sm:w-4/5">
          <p className="text-new-para-1">
            I love following creators on Instagram and TikTok, but I always wished I could interact with people who
            share the same interests as me. On Genuin, I’m part of communities on everything from venture capital to
            books, and I love engaging with others about these topics.
          </p>
          <p className="mt-4 text-new-para-1">
            Jamie Mars, <span className="font-normal">Student & Future Investor</span>
          </p>
        </div>
        <Image priority loading="eager" className="sm:w-1/2" src={imgC5_2} alt="genuin" unoptimized />
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

// function Component7() {
//   return (
//     <div className="my-10 flex min-h-full flex-col items-center gap-y-5 px-6 xl:container lg:my-20 xl:px-0">
//       <h2 className="mb-10 text-new-h2-mobile sm:text-new-h2">Experience Genuin</h2>
//       <SVGAdReelTag />
//       {/* <Image priority loading='eager' className="w-1/5"  src={imgC7} alt="genuin" /> */}
//     </div>
//   )
// }
