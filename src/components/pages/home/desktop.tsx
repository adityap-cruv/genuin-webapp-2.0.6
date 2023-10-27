import { useRef } from 'react'
import { useInView, useMotionValueEvent, useScroll } from 'framer-motion'
import Image from 'next/image'

// all images import
import imgC1 from '@images/home-page/c1.png'
import qrImage from '@images/home-page/download_qr.svg'
import icVideoButton from '@icons/home-page/icAddButton.svg'
import imgC2 from '@images/home-page/c2.png'
import imgC3 from '@images/home-page/c3.png'
import icVideoAddButton from '@icons/home-page/icVideoAddButton.svg'
import imgConnect from '@images/home-page/c4_connect.png'
import imgDiscover from '@images/home-page/c4_discover.png'
import imgLearn from '@images/home-page/c4_learn.png'
import icConversation from '@icons/home-page/icConversation.svg'
import imgC5 from '@images/home-page/c5.png'
import imgC5_2 from '@images/home-page/c5_2.png'
import imgC7 from '@images/home-page/c7.png'
import imgReviewerDp from '@images/home-page/reviewerDp.png'
import { CommunitySection } from './community-section'
import Script from 'next/script'

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
    <div
      id="initial-component"
      className="flex min-h-full items-center pt-navbar"
      style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
      <div className="container flex h-full items-center justify-around">
        <div className="max-w-lg flex-col justify-between">
          <p className="font-bold" style={{ fontSize: 'calc(min(60px, 5vw))', lineHeight: '110%' }}>
            Community, reimagined. Learn, connect and engage — all under one roof.
          </p>
          <div className="mt-8 flex items-center gap-x-5">
            <Image quality={100} src={qrImage} alt="Download Genuin!" />
            <p className="text-left text-new-md">
              Download Genuin to create communities, interact with your audience, and start conversations on the topics
              that really matter.
            </p>
          </div>
        </div>
        <Image className="w-[40%]" quality={100} src={imgC1} alt="genuin" />
      </div>
    </div>
  )
}

function Component2() {
  return (
    <div className="flex max-h-full w-full flex-col items-center justify-center gap-y-5  pt-10 ">
      <p className="max-w-md text-center text-new-index-title">
        <Image src={icVideoButton} alt="Add" className="mr-2 inline-block h-full align-top" />
        Create and grow your own community
      </p>
      <Image quality={100} className="w-1/2" src={imgC2} alt="Create you community!" />
    </div>
  )
}

function Component3() {
  return (
    <div className="container relative flex h-full items-center justify-around  py-5">
      <Image className="w-1/3" quality={100} src={imgC3} alt="genuin" />
      <div className="flex w-2/3 max-w-sm flex-col gap-y-8">
        <p className="text-new-index-title">
          Be part of the conversation with
          <Image src={icVideoAddButton} alt="Add Video" className="mx-1 inline-block align-bottom" /> Loops
        </p>
        <p className="text-new-lg">
          Loops are interactive discussion spaces where you can kickstart discussions with Q&A prompts, learn from each
          other, and join in with video, photo, voice recording or text responses. It’s crowdsourced knowledge at your
          fingertips.
        </p>
      </div>
    </div>
  )
}

function Component4() {
  const textRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const { scrollYProgress } = useScroll()

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const value = Number(latest.toPrecision(2))
    if (value >= 0.3 && value <= 0.6) {
      const calcValue = Math.floor((value - 0.3) * 10)
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
    <div className="relative my-5 h-[350%] ">
      <div id="carousel" className="sticky top-0">
        <div className="flex h-1/3 w-full flex-col items-center justify-center gap-y-5">
          <div className="mt-3 flex justify-center">
            <p className="max-w-lg text-center text-new-index-title">
              Expand your horizons and add to the{' '}
              <Image src={icConversation} alt="conversation" className="inline-block align-bottom" /> conversation
            </p>
          </div>
          <div className="flex w-full items-center justify-around">
            <div
              ref={imgRef}
              className="relative h-full w-1/3 [&>img]:inset-0 [&>img]:transition-opacity [&>img]:duration-200 [&>img]:ease-in">
              <Image quality={100} src={imgConnect} alt="connect" className="inset-0 w-4/5" />
              <Image quality={100} src={imgDiscover} alt="discover" className="absolute w-4/5 opacity-0" />
              <Image quality={100} src={imgLearn} alt="learn" className="absolute w-4/5 opacity-0" />
            </div>
            <div
              ref={textRef}
              className="flex w-2/3 max-w-md flex-col gap-y-3 [&>div]:opacity-30 [&>div]:transition-opacity [&>div]:duration-300 [&>div]:ease-in ">
              <div className="!opacity-100">
                <p className="my-2" style={{ fontSize: '40px', lineHeight: '110%', fontWeight: 700 }}>
                  Connect
                </p>
                <p className="text-new-lg">Meet new people, grow your audience, and discover new interests.</p>
              </div>
              <div>
                <p className="my-2" style={{ fontSize: '40px', lineHeight: '110%', fontWeight: 700 }}>
                  Discover
                </p>
                <p className="text-new-lg">
                  Create Loops, interactive discussion spaces that combine video, photo, voice recording and text.
                </p>
              </div>
              <div>
                <p className="my-2" style={{ fontSize: '40px', lineHeight: '110%', fontWeight: 700 }}>
                  Learn
                </p>
                <p className="text-new-lg">
                  Start conversations and invite your audience to contribute, too—a space to learn alongside and from
                  each other.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Component5() {
  return (
    <div className="container flex flex-col items-center gap-y-5">
      <p className="mt-7 text-new-index-title">What our members say</p>
      <div className="flex w-full justify-between gap-5">
        <div className="flex w-2/3 flex-col gap-y-5">
          <div className="flex flex-col rounded-[10px] border-[18px] border-[#E9CAF4] bg-monochrome-black p-8">
            <p className="font-bold text-monochrome-white" style={{ fontSize: '40px' }}>
              "Infinite community possibilies."
            </p>
            <div className="mt-5 flex items-center">
              <Image quality={100} src={imgReviewerDp} alt="lauren hall" className="mr-4" />
              <p className="text-monochrome-white">Lauren Hall, App Member</p>
            </div>
          </div>
          <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-secondary p-5">
            <p className="text-new-lg">
              “Genuin is so community–driven — I love having that level of interaction with people sharing their own
              versions of my DIY hacks and offering their own tips.”
            </p>
            <p className="mt-3 text-new-md">Esmé, Seattle, DIY Content Creator</p>
          </div>
        </div>
        <Image quality={100} src={imgC5} alt="genuin" className="w-1/3" />
      </div>
      <div className="flex w-full justify-between gap-x-2">
        <Image className="w-full" quality={100} src={imgC5_2} alt="board" />
        <div className="rounded-2xl bg-primary p-10 text-monochrome-white">
          <p className="text-new-lg">
            I love following creators on Instagram and TikTok, but I always wished I could interact with people who
            share the same interests as me. On Genuin, I’m part of communities on everything from venture capital to
            books, and I love engaging with others about these topics.
          </p>
          <p className="mt-4 text-new-md">
            Jamie Mars, <span style={{ fontWeight: 400 }}>Student & Future Investor</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Component6() {
  return (
    <div className="my-10 flex flex-col items-center">
      <p className="font-bold" style={{ fontSize: 'calc(min(60px, 5vw))' }}>
        Community sneak peak
      </p>
      <p className="max-w-lg text-center text-new-lg">
        Take a look inside some of the communities you’ll find in on Genuin and get inspired to start your own.
      </p>
      <CommunitySection />
    </div>
  )
}

function Component7() {
  return (
    <div className="container my-10 flex flex-col items-center gap-y-5">
      <p className="font-bold" style={{ fontSize: 'calc(min(60px, 5vw))' }}>
        Experience Genuin
      </p>
      <SVGAdReelTag />
      {/* <Image className="w-1/5" quality={100} src={imgC7} alt="genuin" /> */}
    </div>
  )
}

function SVGAdReelTag() {
  const svgRef = useRef<SVGSVGElement>(null)
  const isInView = useInView(svgRef, { amount: 1 })

  return (
    <>
      <svg ref={svgRef} width="317" height="651" viewBox="0 0 317 651" fill="none" xmlns="http://www.w3.org/2000/svg">
        <foreignObject xmlns="http://www.w3.org/1999/xhtml" x="7" y="5" width="300" height="600">
          <div
            className="gen-ext"
            data-tag-id="test-rohit"
            data-company-id="1129"
            style={{ height: '596px', width: '298px', marginTop: '3px', margin: 'auto', marginBottom: '40px' }}></div>
        </foreignObject>
        <rect x="3.73063" y="3.52042" width="307" height="604" rx="35" stroke="#16171A" strokeWidth="12" />
        <path
          d="M78.8398 3.60274H263.797V18.1951C263.797 29.0275 255.016 37.8089 244.183 37.8089H98.4536C87.6212 37.8089 78.8398 29.0275 78.8398 18.1951V3.60274Z"
          fill="#16171A"
          stroke="#16171A"
          strokeWidth="1.00583"
        />
        <g filter="url(#filter0_dd_0_5)">
          <rect x="145.008" y="17.5669" width="38.3893" height="5.05122" rx="2.52561" fill="#F8F8F8"></rect>
        </g>
        <rect x="191.479" y="17.5669" width="5.05122" height="5.05122" rx="2.52561" fill="#F8F8F8" />
      </svg>
      {isInView && <Script src="https://genuin-qa-media.s3.us-west-2.amazonaws.com/cxr/gen_ext.min.js" />}
    </>
  )
}
