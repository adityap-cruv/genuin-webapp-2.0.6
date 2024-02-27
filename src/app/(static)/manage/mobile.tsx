import { useEffect, useState } from 'react'
import { Footer } from '@components/pages/home/footer'
import { NavBar } from '@components/pages/home/nav-bar'
import { Button } from '@components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious } from '@components/ui/carousel'
import Image from 'next/image'
import managebg from '@images/business/brand-page/manage-bg-mobile.webp'
import onlinecommunity from '@images/business/brand-page/online-community-group.webp'
import community1 from '@images/business/brand-page/online-community-1-mobile.webp'
import content from '../../../content/brands-page.json'
import interaction1 from '@images/business/brand-page/customer-engage/interaction-1.webp'
import interaction2 from '@images/business/brand-page/customer-engage/interaction-2.webp'
import interaction3 from '@images/business/brand-page/customer-engage/interaction-3.webp'
import Engagement1 from '@images/business/brand-page/customer-engage/engagement-1.webp'
import Engagement2 from '@images/business/brand-page/customer-engage/engagement-2.webp'
import Automation1 from '@images/business/brand-page/customer-engage/automation-1.webp'
import Automation2 from '@images/business/brand-page/customer-engage/automation-2.webp'
import dashboard from '@images/business/brand-page/video-base-communities/dashboard.webp'
import getInTouch from '@images/business/brand-page/get-in-touch.webp'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'
import InlineButtonInput from '@components/business/input'
import testimonial_styles from '@components/business/brand-page/testimonials/testimonials.module.scss'
import { ContactUs } from '@components/common/modals/contact-us'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

export default function Mobile() {
  return (
    <>
      <NavBar />
      <Component1 />
      <Component2 />
      <Component3 />
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
        <p className="my-3 text-new-h2-mobile">Get First Party Data & Capabilities to Moderate your Communities</p>
        <p className="my-3 text-new-para-2">
          Full Transparency, access, and control over your community’s activity with help from AI assistants
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
        <p className="my-2 text-new-h2-mobile">Ensure Brand Safety Through your own Policies and Platform Controls</p>
        <p className="my-2 text-new-para-2">
          Control what your community sees, keep it relevant to your brand, and easily policy prohibited content.
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
  const [scrollPercentage, setScrollPercentage] = useState(0)

  const handleScrollChange = (event: any) => {
    const container = event.target
    const scrollPosition = (container.scrollLeft / (container.scrollWidth - container.clientWidth)) * 100
    setScrollPercentage(scrollPosition)
  }

  useEffect(() => {
    const container = document.querySelector('.hide-scrollbar')
    container?.addEventListener('scroll', handleScrollChange)
    return () => {
      container?.removeEventListener('scroll', handleScrollChange)
    }
  }, [])

  return (
    <div className="container mt-14 h-fit">
      <p className="my-2 text-new-h2-mobile">Activate Proven Engagement Hooks to Keep Your Community Active</p>
      <p className="my-2 text-new-para-2">
        All the user engagement hooks of popular video-based social network are now in your hands
      </p>
      {/* DIV to show scroll bar progress */}
      <div className="relative my-10 flex h-1 w-full items-center bg-[#E5E0F5]">
        <div className="absolute h-1 bg-monochrome-black" style={{ width: `${scrollPercentage}%` }} />
        <div className="absolute z-10 flex w-full grid-cols-7 items-center justify-between">
          {scrollPercentage >= 0 && scrollPercentage < 12 ? (
            <div className="rounded-2xl bg-monochrome-black px-4 py-2 text-new-para-2-mobile text-monochrome-white">
              Feed
            </div>
          ) : (
            <div></div>
          )}
          {scrollPercentage > 12 && scrollPercentage < 26 ? (
            <div className="rounded-2xl bg-monochrome-black px-4 py-2 text-new-para-2-mobile text-monochrome-white">
              Reactions
            </div>
          ) : (
            <div></div>
          )}
          {scrollPercentage > 26 && scrollPercentage < 40 ? (
            <div className="rounded-2xl bg-monochrome-black px-4 py-2 text-new-para-2-mobile text-monochrome-white">
              Comments
            </div>
          ) : (
            <div></div>
          )}
          {scrollPercentage > 40 && scrollPercentage < 60 ? (
            <div className="rounded-2xl bg-monochrome-black px-4 py-2 text-new-para-2-mobile text-monochrome-white">
              Link Share
            </div>
          ) : (
            <div></div>
          )}
          {scrollPercentage > 60 && scrollPercentage < 80 ? (
            <div className="rounded-2xl bg-monochrome-black px-4 py-2 text-new-para-2-mobile text-monochrome-white">
              Challenge
            </div>
          ) : (
            <div></div>
          )}
          {scrollPercentage > 80 && scrollPercentage < 94 ? (
            <div className="rounded-2xl bg-monochrome-black px-4 py-2 text-new-para-2-mobile text-monochrome-white">
              Rewards
            </div>
          ) : (
            <div></div>
          )}
          {scrollPercentage > 94 && scrollPercentage <= 100 ? (
            <div className="rounded-2xl bg-monochrome-black px-4 py-2 text-new-para-2-mobile text-monochrome-white">
              Q&A
            </div>
          ) : (
            <div></div>
          )}
        </div>
        <div className="absolute flex w-full grid-cols-7 items-center justify-between">
          <div
            className={`h-2 w-2 rounded-full ${scrollPercentage > 12 ? 'bg-monochrome-black' : 'bg-[#E5E0F5]'}`}></div>
          <div
            className={`h-2 w-2 rounded-full ${scrollPercentage > 25 ? 'bg-monochrome-black' : 'bg-[#E5E0F5]'}`}></div>
          <div
            className={`h-2 w-2 rounded-full ${scrollPercentage > 32 ? 'bg-monochrome-black' : 'bg-[#E5E0F5]'}`}></div>
          <div
            className={`h-2 w-2 rounded-full ${scrollPercentage > 45 ? 'bg-monochrome-black' : 'bg-[#E5E0F5]'}`}></div>
          <div
            className={`h-2 w-2 rounded-full ${scrollPercentage > 62 ? 'bg-monochrome-black' : 'bg-[#E5E0F5]'}`}></div>
          <div
            className={`h-2 w-2 rounded-full ${scrollPercentage > 80 ? 'bg-monochrome-black' : 'bg-[#E5E0F5]'}`}></div>
          <div
            className={`h-2 w-2 rounded-full ${scrollPercentage > 94 ? 'bg-monochrome-black' : 'bg-[#E5E0F5]'}`}></div>
        </div>
      </div>
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

function Component6() {
  return (
    <div className="mt-16 flex h-fit items-center">
      <div className="container">
        <p className="my-2 text-new-h2-mobile">Collect and Manage New First Party Data</p>
        <p className="my-4 text-new-para-2">
          Gain insights and access your community participants directly, integrate with existing identity and data clean
          rooms
        </p>
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
          <Link href={{ pathname: PATH_NAME.businessinsider() }}>
            <img
              loading="lazy"
              fetchPriority="low"
              className="h-8"
              decoding="async"
              src={businessInsider.src}
              alt="genuin"
            />
          </Link>
        </div>
        <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-6 py-2 ">
          <Link href={{ pathname: PATH_NAME.yahoo() }}>
            <img loading="lazy" fetchPriority="low" className="h-8" decoding="async" src={yahoo.src} alt="genuin" />
          </Link>
        </div>
      </div>
    </div>
  )
}
