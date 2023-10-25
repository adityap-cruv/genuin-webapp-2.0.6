'use client'
import Image from 'next/image'
import imgC1 from '@images/home-page/c1.png'
import qrImage from '@images/home-page/download_qr.svg'
import icAddVideoButton from '@icons/home-page/icAddVideoButton.svg'
import imgC2 from '@images/home-page/c2.png'
import imgC3 from '@images/home-page/c3.png'
import icVideoAddButton from '@icons/home-page/icVideoAddButton.svg'
import imgConnect from '@images/home-page/c4_connect.png'
import imgDiscover from '@images/home-page/c4_discover.png'
import imgLearn from '@images/home-page/c4_learn.png'
import icConversation from '@icons/home-page/icConversation.svg'
import imgC5 from '@images/home-page/c5.png'
import imgC5_1 from '@images/home-page/c5_1.png'
import imgC5_2 from '@images/home-page/c5_2.png'
import imgC7 from '@images/home-page/c7.png'
import { useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'

export const MainComponent = () => {
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
      <div className="container flex h-full items-center justify-between">
        <div className="max-w-lg flex-col justify-between">
          <p className="font-bold" style={{ fontSize: 'calc(min(60px, 5vw))', lineHeight: '110%' }}>
            Community, reimagined. Learn, connect and engage — all under one roof.
          </p>
          <div className="mt-8 flex items-center gap-x-5">
            <Image src={qrImage} alt="Download Genuin!" />
            <p className="text-left text-new-md">
              Download Genuin to create communities, interact with your audience, and start conversations on the topics
              that really matter.
            </p>
          </div>
        </div>
        <div className="min-w-fit">
          <Image src={imgC1} alt="genuin" />
        </div>
      </div>
    </div>
  )
}

function Component2() {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-y-12 ">
      <p className="max-w-md text-new-index-title">
        <Image src={icAddVideoButton} alt="Add" className="mr-2 inline-block h-full align-top" />
        Create and grow your own community
      </p>
      <Image src={imgC2} alt="Create you community!" />
    </div>
  )
}

function Component3() {
  return (
    <div className="container flex min-h-full items-center justify-between">
      <Image src={imgC3} alt="genuin" />
      <div className="flex max-w-sm flex-col gap-y-8">
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
    if (value >= 0.38 && value <= 0.68) {
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
    <div className="relative h-[300%] min-h-full">
      <div id="carousel" className="sticky top-0 h-[90vh]">
        <div className="container flex h-full w-full flex-col justify-center gap-y-11">
          <div className="flex justify-center">
            <p className="max-w-lg text-center text-new-index-title">
              Expand your horizons and add to the{' '}
              <Image src={icConversation} alt="conversation" className="inline-block align-bottom" /> conversation
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div
              ref={imgRef}
              className="relative h-full w-full [&>img]:inset-0 [&>img]:transition-opacity [&>img]:duration-500 [&>img]:ease-in">
              <Image src={imgConnect} alt="connect" style={{ position: 'sticky' }} className="inset-0" />
              <Image src={imgDiscover} alt="discover" className="absolute opacity-0" />
              <Image src={imgLearn} alt="learn" className="absolute opacity-0" />
            </div>
            <div
              ref={textRef}
              className="flex max-w-md flex-col  gap-y-8 [&>div]:opacity-30 [&>div]:transition-opacity [&>div]:duration-300 [&>div]:ease-in ">
              <div className="!opacity-100">
                <p className="my-3" style={{ fontSize: '40px', lineHeight: '110%', fontWeight: 700 }}>
                  Connect
                </p>
                <p className="text-new-lg">Meet new people, grow your audience, and discover new interests.</p>
              </div>
              <div>
                <p className="my-3" style={{ fontSize: '40px', lineHeight: '110%', fontWeight: 700 }}>
                  Discover
                </p>
                <p className="text-new-lg">
                  Create Loops, interactive discussion spaces that combine video, photo, voice recording and text.
                </p>
              </div>
              <div>
                <p className="my-3" style={{ fontSize: '40px', lineHeight: '110%', fontWeight: 700 }}>
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
    <div className="container flex min-h-full flex-col items-center gap-y-5">
      <p className="text-new-index-title">What our members say</p>
      <div className="mt-3 flex w-full justify-between gap-5">
        <div className="flex flex-col gap-y-5">
          <Image src={imgC5_1} alt="review of lauren hall" className="w-full" />
          <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-secondary p-5">
            <p className="text-new-lg">
              “Genuin is so community–driven — I love having that level of interaction with people sharing their own
              versions of my DIY hacks and offering their own tips.”
            </p>
            <p className="text-new-md">Esmé, Seattle, DIY Content Creator</p>
          </div>
        </div>
        <Image src={imgC5} alt="genuin" />
      </div>
      <div className="flex gap-x-2">
        <Image src={imgC5_2} alt="board" />
        <div className="flex flex-col justify-between rounded-2xl bg-primary p-10 text-monochrome-white">
          <p className="text-new-lg">
            I love following creators on Instagram and TikTok, but I always wished I could interact with people who
            share the same interests as me. On Genuin, I’m part of communities on everything from venture capital to
            books, and I love engaging with others about these topics.
          </p>
          <p className="text-new-md">
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
      <div>This is community section.</div>
    </div>
  )
}

function Component7() {
  return (
    <div className="my-10 flex flex-col items-center gap-y-10">
      <p className="font-bold" style={{ fontSize: 'calc(min(60px, 5vw))' }}>
        Experience Genuin
      </p>
      <Image src={imgC7} alt="genuin" />
    </div>
  )
}
