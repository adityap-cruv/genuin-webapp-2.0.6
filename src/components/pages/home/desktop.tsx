import { useRef } from 'react'
import { useInView, useMotionValueEvent, useScroll } from 'framer-motion'
import { SVGAdReelTag } from './svg-ad-reel-tag'
import Image from 'next/image'
import { CommunitySection } from './community-section'
import { Button } from '@components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'

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
import { AspectRatio } from '@components/ui/aspect-ratio'

export function Desktop() {
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
  return (
    <>
      <div
        id="initial-component"
        className="hidden h-full items-center pt-navbar lg:flex"
        style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
        <div className="flex h-full w-full items-center justify-around px-6 xl:container xl:px-0">
          <div className="w-[60%] flex-col justify-between">
            <h1 className="text-new-h1">Community, reimagined. Learn, connect and engage — all under one roof.</h1>
            <div className="mt-15 flex items-center gap-x-5">
              <Image quality={100} src={qrImage} alt="Download Genuin!" />
              <p className="text-left text-new-para-1">
                Download Genuin to create communities, interact with your audience, and start conversations on the
                topics that really matter.
              </p>
            </div>
          </div>
          <Image className="w-[40%]" quality={100} src={imgC1} alt="genuin" />
        </div>
      </div>
      <div
        className="flex min-h-full flex-col items-center justify-center gap-y-3 pt-navbar lg:hidden"
        style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
        <h1 className="my-5 flex justify-center text-center text-new-h1-mobile sm:text-new-h1 ">
          Community, reimagined.
        </h1>
        <p className="mx-3 text-center text-new-md sm:w-4/5">
          Download Genuin to create communities, interact with your audience, and start conversations on the topics that
          really matter.
        </p>
        <Button className="my-5 bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
          <p className="mx-2 text-new-md text-new-off-white">Download Genuin</p>
        </Button>
        <Image className="my-5 w-4/5 sm:w-1/2" src={imgC1Mobile} alt="genuin" />
      </div>
    </>
  )
}

function Component2() {
  return (
    <>
      <div className="my-40 hidden max-h-full w-full flex-col items-center justify-center gap-y-5  lg:flex ">
        <h2 className="-tracking-new max-w-lg text-center text-new-h2">
          <Image src={icAddButton} alt="Add" className="align-toh2 mr-2 inline-block h-full" />
          Create and grow your own community
        </h2>
        <Image quality={100} className="w-1/2" src={imgC2} alt="Create you community!" />
      </div>
      <div className="my-10 flex flex-col items-center justify-center lg:hidden">
        <h2 className="my-4 w-full px-10 text-center text-new-h2-mobile sm:text-new-h2">
          <Image src={icAddButton} alt="add" className="mr-2 inline-block w-8 align-top sm:mr-4 sm:w-11" />
          Create and grow your own community
        </h2>
        <Image src={imgC2Mobile} alt="genuin" className="my-4 sm:w-1/2" />
      </div>
    </>
  )
}

function Component3() {
  return (
    <>
      <div className="relative my-40 hidden max-h-full items-center justify-around px-6 xl:container lg:flex xl:px-0">
        <Image className="w-1/3" quality={100} src={imgC3} alt="genuin" />
        <div className="flex w-2/3 max-w-md flex-col gap-y-8">
          <h2 className="text-new-h2">
            Be part of the conversation with
            <Image src={icVideoAddButton} alt="Add Video" className="ml-4 mr-3 inline-block align-bottom" />
            Loops
          </h2>
          <h5 className="text-new-h5">
            Loops are interactive discussion spaces where you can kickstart discussions with Q&A prompts, learn from
            each other, and join in with video, photo, voice recording or text responses. It's crowdsourced knowledge at
            your fingertips.
          </h5>
        </div>
      </div>
      <div className="my-10 flex flex-col items-center gap-y-3 lg:hidden">
        <h2 className="max-w-xl text-center text-new-h2-mobile sm:text-new-h2">
          Be part of the conversation with
          <Image src={icVideoAddButton} alt="add" className="ml-3 mr-2 inline-block w-8 align-bottom sm:mr-4 sm:w-11" />
          Loops
        </h2>
        <h5 className="text-center text-new-h5">
          Loops are interactive discussion spaces where you can join in with video, photo, voice recording and text
          responses.
        </h5>
        <Image src={imgC3} alt="loops" className="sm:w-1/2" />
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
                <Image src={icConversation} alt="conversation" className="ml-3 mr-4 inline-block align-bottom" />
                conversation
              </h2>
            </div>
            <div className="flex h-[70%] w-full items-center px-6 pt-10 xl:container xl:px-0">
              <div
                ref={imgRef}
                className="relative w-1/2 [&>img]:inset-0 [&>img]:transition-opacity [&>img]:duration-200 [&>img]:ease-in">
                <Image quality={100} src={imgConnect} alt="connect" className="inset-0 w-3/4" />
                <Image quality={100} src={imgDiscover} alt="discover" className="absolute w-3/4 opacity-0" />
                <Image quality={100} src={imgLearn} alt="learn" className="absolute w-3/4 opacity-0" />
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
      <div className="my-10 mt-16 flex flex-col items-center lg:hidden">
        <h2 className="max-w-2xl text-center text-new-h2-mobile sm:text-new-h2">
          Expand your horizons and add to the
          <Image
            src={icConversation}
            width={40}
            height={30}
            alt="conversation"
            className="ml-3 mr-2 inline-block w-8 align-bottom sm:mr-4 sm:w-11"
          />
          conversation
        </h2>
        <div className="flex w-full justify-center">
          <Accordion type="single" defaultValue="connect" collapsible className="px-3 sm:w-4/5">
            <AccordionItem value="connect" className="border-none ">
              <AccordionTrigger className="items-baseline">
                <div className="flex flex-col items-start">
                  <h3 className="text-new-h3-mobile">Connect</h3>
                  <p className="text-start text-new-para-1">
                    Meet new people, grow your audience, and discover new interests.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <Image className="sm:w-1/2" src={imgConnect} alt="connect" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="discover" className="border-none ">
              <AccordionTrigger className="items-baseline">
                <div className="flex flex-col items-start">
                  <h3 className="text-new-h3-mobile">Discover</h3>
                  <p className="text-start text-new-para-1">
                    Create Loops, interactive discussion spaces that combine video, photo, voice recording and text.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <Image className="sm:w-1/2" src={imgDiscover} alt="discover" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="learn" className="border-none ">
              <AccordionTrigger className="items-baseline">
                <div className="flex flex-col items-start">
                  <h3 className="text-new-h3-mobile">Learn</h3>
                  <p className="text-start text-new-para-1">
                    Start conversations and invite your audience to contribute, too—a space to learn alongside and from
                    each other.
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
                <Image className="sm:w-1/2" src={imgLearn} alt="learn" />
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
        <h2 className="text-new-h2">What our members say</h2>
        <div className="my-10 mt-15 flex w-full justify-between gap-10">
          <div className="flex w-3/5 flex-col gap-y-10">
            <div className="-border-spacing-10 flex h-1/2 flex-col justify-around rounded-[10px] border-[18px] border-[#E9CAF4] bg-new-off-black p-8">
              <h3 className="text-new-h3 text-new-off-white">"Infinite community possibilies."</h3>
              <div className="mt-5 flex items-center">
                <Image quality={100} src={imgReviewerDp} alt="lauren hall" className="mr-4" />
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
          <Image quality={100} src={imgC5} alt="genuin" className="w-3/5 lg:w-2/5 2xl:w-1/3" />
        </div>
        <div className="flex w-full justify-between gap-x-10">
          <Image className="w-1/3" quality={100} src={imgC5_2} alt="board" />
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
      <div className="my-10 flex min-h-full flex-col items-center gap-y-3 px-2 lg:hidden">
        <h2 className="text-new-h2-mobile sm:text-new-h2">What our members say</h2>
        <div className=" flex flex-col rounded-[10px] border-[18px] border-[#E9CAF4] bg-new-off-black p-4 sm:w-4/5">
          <p className="font-bold text-new-off-white" style={{ fontSize: '28px' }}>
            "Infinite community possibilies."
          </p>
          <div className="mt-5 flex w-full">
            <Image src={imgReviewerDp} alt="lauren hall" className="mr-4" />
            <p className="text-new-off-white">
              Lauren Hall, <br />
              App Member
            </p>
          </div>
        </div>
        <Image className="w-1/2" src={imgC5} alt="genuin" />
        <div className="flex flex-col justify-between rounded-2xl bg-primary p-4 text-new-off-white sm:w-4/5">
          <p className="text-new-para-1">
            I love following creators on Instagram and TikTok, but I always wished I could interact with people who
            share the same interests as me. On Genuin, I’m part of communities on everything from venture capital to
            books, and I love engaging with others about these topics.
          </p>
          <p className="mt-4 text-new-para-1">
            Jamie Mars, <span style={{ fontWeight: 400 }}>Student & Future Investor</span>
          </p>
        </div>
        <Image className="sm:w-1/2" src={imgC5_2} alt="genuin" />
      </div>
    </>
  )
}

function Component6() {
  return (
    <div className="my-10 flex flex-col items-center lg:my-20">
      <h2 className="my-6 text-new-h2-mobile sm:text-new-h2">Community sneak peak</h2>
      <h5 className="mb-24 max-w-xl text-center text-new-h5-mobile sm:text-new-h5">
        Take a look inside some of the communities you'll find in on Genuin and get inspired to start your own.
      </h5>
      <CommunitySection />
    </div>
  )
}

function Component7() {
  return (
    <div className="my-10 flex max-h-full flex-col items-center gap-y-5 px-6 xl:container lg:my-20 xl:px-0">
      <h2 className="text-new-h2-mobile sm:text-new-h2">Experience Genuin</h2>
      <SVGAdReelTag />
      {/* <Image className="w-1/5" quality={100} src={imgC7} alt="genuin" /> */}
    </div>
  )
}
