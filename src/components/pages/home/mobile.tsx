import { Button } from '@components/ui/button'
import Image from 'next/image'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { SVGAdReelTag } from './svg-ad-reel-tag'
import { CommunitySection } from './community-section'

// images and icons import
import icAddButton from '@icons/home-page/icAddButton.svg'
import icConversation from '@icons/home-page/icConversation.svg'
import icVideoAddButton from '@icons/home-page/icVideoAddButton.svg'
import imgC1 from '@images/home-page/c1_mobile.png'
import imgC2 from '@images/home-page/c2_mobile.png'
import imgC3 from '@images/home-page/c3.png'
import imgConnect from '@images/home-page/c4_connect.png'
import imgLearn from '@images/home-page/c4_learn.png'
import imgDiscover from '@images/home-page/c4_discover.png'
import imgReviewerDp from '@images/home-page/reviewerDp.png'
import imgC5 from '@images/home-page/c5.png'
import imgC5_1 from '@images/home-page/c5_2.png'

export function Mobile() {
  return (
    <>
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
      <Component5 />
      <Component6 />
    </>
  )
}

function Component1() {
  return (
    <div
      className="flex min-h-full flex-col items-center justify-center gap-y-3 pt-navbar"
      style={{ background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)' }}>
      <p className="text-center font-bold" style={{ fontSize: '40px', lineHeight: '110%' }}>
        Community, reimagined.
      </p>
      <p className="mx-3 text-center text-new-md">
        Download Genuin to create communities, interact with your audience, and start conversations on the topics that
        really matter.
      </p>
      <Button className="bg-new-off-black hover:bg-new-dark-grey after:bg-new-dark-grey my-2">
        <p className="text-new-off-white mx-2 text-new-md">Download Genuin</p>
      </Button>
      <Image src={imgC1} alt="genuin" />
    </div>
  )
}

function Component2() {
  return (
    <div className="my-10 flex flex-col justify-center">
      <p className="my-4 w-full px-10 text-center text-new-index-title-mobile">
        <Image src={icAddButton} alt="add" className="mr-4 inline-block align-bottom" height={30} width={30} />
        Create and grow your own community
      </p>
      <Image src={imgC2} alt="genuin" className="my-4" />
    </div>
  )
}

function Component3() {
  return (
    <div className="my-10 flex flex-col gap-y-3">
      <p className="text-center text-new-index-title-mobile">
        Be part of the conversation with
        <Image
          src={icVideoAddButton}
          alt="add"
          height={30}
          width={40}
          className="mx-1 inline-block align-baseline"
        />{' '}
        Loops
      </p>
      <p className="text-center text-new-lg">
        Loops are interactive discussion spaces where you can join in with video, photo, voice recording and text
        responses.
      </p>
      <Image src={imgC3} alt="loops" className="px-3" />
    </div>
  )
}

function Component4() {
  return (
    <div className="my-10 mt-16">
      <p className="text-center text-new-index-title-mobile">
        Expand your horizons and add to the{' '}
        <Image src={icConversation} width={40} height={30} alt="conversation" className="inline-block align-baseline" />{' '}
        conversation
      </p>
      <Accordion type="single" defaultValue="connect" collapsible className="px-3">
        <AccordionItem value="connect" className="border-none ">
          <AccordionTrigger className="items-baseline">
            <div className="flex flex-col items-start">
              <p className="font-bold" style={{ fontSize: '28px' }}>
                Connect
              </p>
              <p className="text-start text-new-md">Meet new people, grow your audience, and discover new interests.</p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Image src={imgConnect} alt="connect" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="discover" className="border-none ">
          <AccordionTrigger className="items-baseline">
            <div className="flex flex-col items-start">
              <p className="font-bold" style={{ fontSize: '28px' }}>
                Discover
              </p>
              <p className="text-start text-new-md">
                Create Loops, interactive discussion spaces that combine video, photo, voice recording and text.
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Image src={imgDiscover} alt="discover" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="learn" className="border-none ">
          <AccordionTrigger className="items-baseline">
            <div className="flex flex-col items-start">
              <p className="font-bold" style={{ fontSize: '28px' }}>
                Learn
              </p>
              <p className="text-start text-new-md">
                Start conversations and invite your audience to contribute, too—a space to learn alongside and from each
                other.
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Image src={imgLearn} alt="learn" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function Component5() {
  return (
    <div className="flex min-h-full flex-col items-center gap-y-3 px-2">
      <p className="font-bold" style={{ fontSize: '32px' }}>
        What our members say
      </p>
      <div className=" bg-new-off-black flex flex-col rounded-[10px] border-[18px] border-[#E9CAF4] p-4">
        <p className="text-new-off-white font-bold" style={{ fontSize: '28px' }}>
          "Infinite community possibilies."
        </p>
        <div className="mt-5 flex items-center">
          <Image src={imgReviewerDp} alt="lauren hall" className="mr-4" />
          <p className="text-new-off-white">
            Lauren Hall, <br />
            App Member
          </p>
        </div>
      </div>
      <Image src={imgC5} alt="genuin" />
      <div className="text-new-off-white flex flex-col justify-between rounded-2xl bg-primary p-4">
        <p className="text-new-md">
          I love following creators on Instagram and TikTok, but I always wished I could interact with people who share
          the same interests as me. On Genuin, I’m part of communities on everything from venture capital to books, and
          I love engaging with others about these topics.
        </p>
        <p className="mt-4 text-new-md">
          Jamie Mars, <span style={{ fontWeight: 400 }}>Student & Future Investor</span>
        </p>
      </div>
      <Image src={imgC5_1} alt="genuin" />
    </div>
  )
}

function Component6() {
  return (
    <div className="my-5 flex flex-col items-center gap-y-5 px-2">
      <p className="text-center font-bold" style={{ fontSize: '40px', lineHeight: '110%' }}>
        Community sneak peak
      </p>
      <p className="text-center text-new-md">
        Take a look inside some of the communities you’ll find in on Genuin and get inspired to start your own.
      </p>
      <CommunitySection />
      <p className="text-center font-bold" style={{ fontSize: '40px', lineHeight: '110%' }}>
        Experience Genuin
      </p>
      <SVGAdReelTag />
    </div>
  )
}
