import { useEffect } from 'react'
import { Footer } from '@components/pages/home/footer'
import { NavBar } from '@components/pages/home/nav-bar'
import { Button } from '@components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious } from '@components/ui/carousel'
import Image from 'next/image'
import managebg from '@images/business/brand-page/manage-bg-mobile.webp'
import onlinecommunity from '@images/business/brand-page/online-community-group.webp'
import community1 from '@images/business/brand-page/online-community-1-mobile.webp'
import community2 from '@images/business/brand-page/online-community-2-mobile.webp'
import content from '../../../content/brands-page.json'
import interaction1 from '@images/business/brand-page/customer-engage/interaction-1.webp'
import interaction2 from '@images/business/brand-page/customer-engage/interaction-2.webp'
import interaction3 from '@images/business/brand-page/customer-engage/interaction-3.webp'
import Engagement1 from '@images/business/brand-page/customer-engage/engagement-1.webp'
import Engagement2 from '@images/business/brand-page/customer-engage/engagement-2.webp'
import Automation1 from '@images/business/brand-page/customer-engage/automation-1.webp'
import Automation2 from '@images/business/brand-page/customer-engage/automation-2.webp'
import engagementHooks from '@images/business/brand-page/engagement-hooks.webp'
import img1 from '@images/business/brand-page/funnel-engagement/img-1.webp'
import img2 from '@images/business/brand-page/funnel-engagement/img-2.webp'
import img3 from '@images/business/brand-page/funnel-engagement/img-3.webp'
import dashboard from '@images/business/brand-page/video-base-communities/dashboard.webp'
import getInTouch from '@images/business/brand-page/get-in-touch.webp'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'
import InlineButtonInput from '@components/business/input'
import testimonial_styles from '@components/business/brand-page/testimonials/testimonials.module.scss'
import { ContactUs } from '@components/common/modals/contact-us'

export default function Mobile() {
  return (
    <>
      <NavBar />
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
      <Component5 />
      <Component6 />
      <Component7 />
      <Component8 />
      <Component9 />
      <Footer />
    </>
  )
}

function Component1() {
  return (
    <div
      className="flex items-center pb-20 pt-36 "
      style={{
        background: `url(${managebg.src}) no-repeat`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backdropFilter: 'blur(100px)',
      }}>
      <div className="container">
        <p className="my-3 text-new-h2-mobile">Enhanced Safety & Moderation for your Video Communities</p>
        <p className="my-3 text-new-para-2">
          Nova is supporting the world's biggest brands, the next generation of community builders, and the knowledge
          seekers in between.
        </p>
        <ContactUs>
          <Button
            size="custom"
            className="my-3 bg-new-off-black px-4 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
            <p className="text-new-para-2">Get Started</p>
          </Button>
        </ContactUs>
        <div className="my-4 flex min-h-[300px] items-center justify-center">
          <img loading="lazy" fetchPriority="low" decoding="async" src={onlinecommunity.src} />
        </div>
      </div>
    </div>
  )
}

function Component2() {
  return (
    <div className="mt-10 flex h-fit items-center">
      <div className="container">
        <p className="my-2 text-new-h2-mobile">Brand Safety and Moderation Tools in your Own Community</p>
        <p className="my-2 text-new-para-2">
          Engage your audience and nurture loyal brand advocates in your custom-built Genuin community.
        </p>
        <ContactUs>
          <Button size="custom" variant={'outline'} className="my-2 px-5 py-3 ">
            <p className="text-new-para-2">Contact Sales</p>
          </Button>
        </ContactUs>
        <div className="my-2 flex flex-col items-center justify-center gap-4">
          <img loading="lazy" fetchPriority="low" decoding="async" src={community1.src} />
          {/* <img loading="lazy" fetchPriority="low" decoding="async" className="w-3/4" src={community2.src} /> */}
        </div>
      </div>
    </div>
  )
}

function Component3() {
  return (
    <div className="container  mt-14 h-fit">
      <p className="my-2 text-new-h2-mobile">Thriving Online Community, Your Way</p>
      <p className="my-2 text-new-para-2">
        Allow your customers to engage with your brand in three easy steps. Use Genuin's unique tools to bring everyone
        into the conversation.
      </p>
      <div className="hide-scrollbar mt-6 min-h-[400px] w-auto overflow-x-scroll whitespace-nowrap">
        <Image priority loading="eager" className="mr-14 inline-block h-96 w-auto" src={interaction1} alt="genuine" />
        <Image priority loading="eager" className="mr-14 inline-block h-96 w-auto" src={interaction2} alt="genuine" />
        <Image priority loading="eager" className="mr-14 inline-block h-96 w-auto" src={interaction3} alt="genuine" />
        <Image priority loading="eager" className="mr-14 inline-block h-96 w-auto" src={Engagement1} alt="genuine" />
        <Image priority loading="eager" className="mr-14 inline-block h-96 w-auto" src={Engagement2} alt="genuine" />
        <Image priority loading="eager" className="mr-14 inline-block h-96 w-auto" src={Automation1} alt="genuine" />
        <Image priority loading="eager" className="mr-14 inline-block h-96 w-auto" src={Automation2} alt="genuine" />
      </div>
    </div>
  )
}

function Component4() {
  return (
    <div className="mt-10 flex h-fit items-center">
      <div className="container">
        <p className="my-2 text-new-h2-mobile">The Best Engagement Hooks on Your App</p>
        <p className="my-2 text-new-para-2">
          A new way of connecting with your audience — entertain, educate, and convert them into loyal brand advocates
          through engaging content
        </p>
        <Button size="custom" variant={'outline'} className="my-2 px-5 py-3 ">
          <p className="text-new-para-2">Learn more</p>
        </Button>
        <div className="my-2 flex flex-col items-center justify-center gap-4">
          <img loading="lazy" fetchPriority="low" decoding="async" src={engagementHooks.src} />
        </div>
      </div>
    </div>
  )
}

function Component5() {
  return (
    <div className="container flex h-fit flex-col items-center pt-16">
      <div>
        <p className="my-2 text-new-h2-mobile ">Your Full Funnel Engagement & Optimization</p>
      </div>
      <div className="my-2 flex w-full justify-center">
        <Accordion type="single" defaultValue="connect" collapsible className="px-3 sm:w-4/5">
          <AccordionItem value="connect" className="border-none ">
            <AccordionTrigger className="items-baseline">
              <div className="flex flex-col items-start">
                <h3 className="mb-2 text-start text-new-h4">Holistic Engagement Approach</h3>
                <p className="text-start text-new-para-1-mobile">
                  Unlock the power of seamless full-funnel engagement, from awareness to conversion, maximizing every
                  interaction for unparalleled results.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
              <Image priority loading="eager" className="sm:w-1/2" src={img1} alt="connect" />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="discover" className="border-none ">
            <AccordionTrigger className="items-baseline">
              <div className="flex flex-col items-start">
                <h3 className="mb-2 text-start text-new-h4">Optimized Engagement</h3>
                <p className="text-start text-new-para-1-mobile">
                  Drive success with precision. Our full-funnel engagement turns community members into loyal customers
                  at every touchpoint.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
              <Image unoptimized priority loading="eager" className="sm:w-1/2" src={img2} alt="discover" />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="learn" className="border-none ">
            <AccordionTrigger className="items-baseline">
              <div className="flex flex-col items-start">
                <h3 className="mb-2 text-start text-new-h4">Data-Driven Brand Powerhouse</h3>
                <p className="text-start text-new-para-1-mobile">
                  We provide you with the insights and data you need to optimize and elevate your brand's performance,
                  seamlessly creating a superior experience for community members.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
              <Image priority unoptimized loading="eager" className="sm:w-1/2" src={img3} alt="learn" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

function Component6() {
  return (
    <div className="mt-16 flex h-fit items-center">
      <div className="container">
        <p className="my-2 text-center text-new-h2-mobile">Manage Your First Party Data</p>
        <div className="my-6 flex flex-col items-center justify-center gap-4">
          <img loading="lazy" fetchPriority="low" decoding="async" src={dashboard.src} />
        </div>
      </div>
    </div>
  )
}

function Component7() {
  return (
    <div className="mt-10 flex h-fit items-center">
      <div className="container">
        <p className="my-2 mb-6 text-center text-new-h2-mobile">What Users Say About Genuin</p>
        <Carousel className="w-full">
          <CarouselContent>
            {content?.Testimonials.map(({ text, name, position, img }, index) => (
              <>
                <CarouselItem>
                  <section className={testimonial_styles.container}>
                    <div className={testimonial_styles.row}>
                      <div className={testimonial_styles.card} key={index}>
                        <div className={testimonial_styles.cardBody}>
                          <p className="text-center text-new-h5-mobile">{text}</p>
                        </div>
                        <div className="-mb-4 mt-4 flex gap-6 pl-10 pt-6">
                          <img
                            loading="lazy"
                            fetchPriority="low"
                            decoding="async"
                            src={img}
                            alt={name}
                            width={90}
                            height={90}
                          />
                          <div className={`${testimonial_styles.testimonialDetails} mt-4`}>
                            <p className="text-new-md" style={{ fontSize: '18px' }}>
                              {name}
                            </p>
                            <p className="text-new-para-2-mobile" style={{ fontSize: '14px' }}>
                              {position}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </CarouselItem>
              </>
            ))}
          </CarouselContent>
          <CarouselPrevious />
        </Carousel>
      </div>
    </div>
  )
}

function Component8() {
  const handleButtonClick = (value: string) => {
    // console.log('Input value:', value)
  }
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-expect-errorts overload
      document.addEventListener('click', handleButtonClick)

      return () => {
        // @ts-expect-errorts overload
        document.removeEventListener('click', handleButtonClick)
      }
    }
  }, [])
  return (
    <div className="flex h-fit items-center">
      <div className="container mx-8 rounded-2xl p-4 px-6 pb-0" style={{ backgroundColor: '#E9CAF4' }}>
        <p className="my-4 text-new-h2-mobile">Grow a thriving brand community and build a loyal customer base</p>
        <p className="my-4 text-new-para-2">Get in touch today to start building your brand community with Genuin.</p>
        <InlineButtonInput onButtonClick={handleButtonClick} />
        <img loading="lazy" fetchPriority="low" className="mt-8" decoding="async" src={getInTouch.src} />
      </div>
    </div>
  )
}

function Component9() {
  return (
    <div className="mt-20 flex h-40 flex-col items-center justify-center gap-4 bg-monochrome-9 ">
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
  )
}
