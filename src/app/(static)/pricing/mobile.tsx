import React from 'react'
import { NavBar } from '@components/pages/home/nav-bar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { Button } from '@components/ui/button'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'
import check from '@icons/business/check.svg'
import dash from '@icons/business/dash.svg'
import star1 from '@images/business/star1.webp'
import star2 from '@images/business/star2.webp'
import content from '../../../content/pricing-page.json'
import exclamation from '@icons/business/exclamation.svg'
import Image from 'next/image'
import { Footer } from '@components/pages/home/footer'

export default function Mobile() {
  return (
    <div className="bg-new-off-white">
      <NavBar />
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
      <Component5 />
      <Component6 />
      <Footer />
    </div>
  )
}

function Component1() {
  return (
    <div className="container flex h-screen flex-col items-center justify-center pt-navbar">
      <p className=" text-center text-new-h1-mobile">A Plan for Every Brand</p>

      <div className="my-4">
        <Tabs defaultValue="Free" className="h-full">
          <TabsList className="bg-new-off-white">
            <TabsTrigger value="Free">
              <p className="text-title-3-bold">Free</p>
            </TabsTrigger>
            <TabsTrigger value="Starter">
              <p className="text-title-3-bold">Starter</p>
            </TabsTrigger>
            <TabsTrigger value="Essential">
              <p className="text-title-3-bold">Essential</p>
            </TabsTrigger>
            <TabsTrigger value="Pro">
              <p className="text-title-3-bold">Pro</p>
            </TabsTrigger>
            <TabsTrigger value="Enterprise">
              <p className="text-title-3-bold">Enterprise</p>
            </TabsTrigger>
          </TabsList>
          <hr className="border-t border-monochrome-9" />
          <TabsContent value="Free">
            <div
              className="m-4 h-[525px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <p className="my-1 text-new-h2-mobile font-semibold">Free Plan</p>
              <p className="text-new-sm">FOR EVERYONE TO GET STARTED</p>
              <div className="flex flex-col items-center py-12">
                <p className="text-center text-new-h3">
                  Free
                  <br /> Forever
                </p>
                <Button
                  size="custom"
                  className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                  <p className="text-new-para-2">Contact us for pricing</p>
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-title-2-demi">Benefits:</p>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic community tools enough you get you started</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic moderation tools</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Genuin watermark</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Starter">
            <div
              className="m-4 h-[525px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <p className="my-1 text-new-h2-mobile font-semibold">Starter</p>
              <p className="text-new-sm">FOR EVERYONE TO GET STARTED</p>
              <div className="flex flex-col items-center py-16">
                <p className="text-center text-new-h3">
                  $39<span className="text-new-md">/month</span>
                </p>
                <Button
                  size="custom"
                  className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                  <p className="text-new-para-2">Contact us for pricing</p>
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-title-2-demi">Benefits:</p>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic community tools enough you get you started</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic moderation tools to keep community safe</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Genuin watermark</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Essential">
            <div
              className="m-4 h-[525px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <p className="my-1 text-new-h2-mobile font-semibold">Essential</p>
              <p className="text-new-sm">FOR SMALL STUDIOS</p>
              <div className="flex flex-col items-center py-16">
                <p className="text-center text-new-h3">
                  $299<span className="text-new-md">/month</span>
                </p>
                <Button
                  size="custom"
                  className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                  <p className="text-new-para-2">Contact us for pricing</p>
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-title-2-demi">Benefits:</p>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic community tools enough you get you started</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic moderation tools</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Genuin watermark</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Pro">
            <div
              className="m-4 h-[525px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <p className="my-1 text-new-h2-mobile font-semibold">Pro Plan</p>
              <p className="text-new-sm">FOR BIG COMMUNITIES</p>
              <div className="flex flex-col items-center py-12">
                <p className="text-center text-new-h3">
                  Customized
                  <br /> Pricing
                </p>
                <Button
                  size="custom"
                  className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                  <p className="text-new-para-2">Contact us for pricing</p>
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-title-2-demi">Benefits:</p>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic community tools enough you get you started</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic moderation tools</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Genuin watermark</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Enterprise">
            <div
              className="relative m-4 h-[525px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <Image priority loading="eager" className="absolute -left-4 bottom-6 h-6 w-auto" src={star1} alt="Star" />
              <Image priority loading="eager" className="absolute -right-5 top-6 h-10 w-auto" src={star2} alt="Star" />
              <p className="my-1 text-new-h2-mobile font-semibold">Enterprise</p>
              <p className="text-new-sm">FOR ENTERPRISES</p>
              <div className="flex flex-col items-center py-12">
                <p className="text-center text-new-h3">
                  Customized
                  <br /> Pricing
                </p>
                <Button
                  size="custom"
                  className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                  <p className="text-new-para-2">Contact us for pricing</p>
                </Button>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-title-2-demi">Benefits:</p>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Full white label capability with your URL</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Data in your own warehouse</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Advanced analytics tools and insights</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">AI assistance to engage and grow your audience</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Component2() {
  return (
    <div>
      <p className="mb-10 text-center text-new-h1-mobile">Compare All Plan Features</p>
      <div className="bg-white sticky top-0 z-10">
        <div className="grid grid-cols-5 bg-[#ADDAFF] px-4 py-4">
          <div className="flex justify-center">Free</div>
          <div className="flex justify-center">Starter</div>
          <div className="flex justify-center">Essential</div>
          <div className="flex justify-center">Pro</div>
          <div className="flex justify-center">Enterprise</div>
        </div>
      </div>
      <div className="mt-6 ">
        {content.table.tableData.map((row, index) => (
          <div key={index} className="m-4 rounded-lg border border-monochrome-9">
            <div className="grid grid-cols-5 ">
              <div className="flex justify-center rounded-tl-lg border border-monochrome-9 p-2">
                {row.free ? (
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={24} height={24} alt="Check" />
                )}
              </div>
              <div className="flex justify-center border border-monochrome-9 p-2">
                {row.starter ? (
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={24} height={24} alt="Check" />
                )}
              </div>
              <div className="flex justify-center border border-monochrome-9 p-2">
                {row.essential ? (
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={24} height={24} alt="Check" />
                )}
              </div>
              <div className="flex justify-center border border-monochrome-9 p-2">
                {row.pro ? (
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={24} height={24} alt="Check" />
                )}
              </div>
              <div className="flex justify-center rounded-tr-lg border border-monochrome-9 p-2">
                {row.enterprise ? (
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={24} height={24} alt="Check" />
                )}
              </div>
            </div>
            <p className="rounded-b-lg bg-monochrome-white py-2 pl-4 text-cap-1-bold">{row.category}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Component3() {
  return (
    <div className="container mt-20">
      <p className="my-10 text-center text-new-h1-mobile">Pro Plan</p>
      <p className="my-4 text-new-h2-mobile">Want a fully customized plan for your goals?</p>
      <p className="my-4 text-new-sm">With pro plan, you’ll get the white label capabilities with your own URL.</p>
      <Button size="custom" className="my-2 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
        <p className="text-new-para-2">Contact us for pricing</p>
      </Button>
      <div className="mt my-4 rounded-2xl bg-[#F7F1F9] p-6">
        <p className="mb-8 text-new-h4">What do you get from a pro plan?</p>
        <div className="flex items-center gap-2">
          <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
          <p className="text-new-sm">Advanced analytics tools and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
          <p className="text-new-sm">AI tools</p>
        </div>
      </div>
    </div>
  )
}

function Component4() {
  return (
    <div className="container mt-20">
      <p className="my-10 text-center text-new-h1-mobile">Enterprise Plan</p>
      <p className="my-4 text-new-h2-mobile">
        Are you a big enterprise that need A fully customized community solution?
      </p>
      <p className="my-4 text-new-sm">With enterprise plan, Genuin will curate a solution for you.</p>
      <Button size="custom" className="my-2 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
        <p className="text-new-para-2">Contact us for demo and pricing</p>
      </Button>
      <div className="mt my-4 rounded-2xl bg-[#F7F1F9] p-6">
        <p className="mb-8 text-new-h4">What do you get from a enterprise plan?</p>
        <div className="flex items-center gap-2">
          <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
          <p className="text-new-sm">Full white label capability with your URL</p>
        </div>
        <div className="flex items-center gap-2">
          <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
          <p className="text-new-sm">Data in your own warehouse</p>
        </div>
        <div className="flex items-center gap-2">
          <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
          <p className="text-new-sm">Advanced analytics tools and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
          <p className="text-new-sm">AI moderation and management tools for brand</p>
        </div>
        <div className="flex items-center gap-2">
          <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
          <p className="text-new-sm">AIGH assistance to engage and grow your audience</p>
        </div>
      </div>
    </div>
  )
}

function Component5() {
  return (
    <div className="container mt-20">
      <div className="mt my-4 rounded-2xl bg-[#E9CAF4] p-6">
        <p className="mb-4 text-new-h1-mobile">Not sure which plan is right for you?</p>
        <p className="mb-4 text-new-sm">
          Contact us for support - we can help you find the plan that works best for you and your community. Contact us
          to get started!
        </p>
        <Button size="custom" className="my-2 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
          <p className="text-new-para-2">Book Demo</p>
        </Button>
      </div>
    </div>
  )
}

function Component6() {
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
          {/* <Image priority loading="eager" src={businessInsider} alt={`businessInsider`} /> */}
        </div>
        <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-6 py-2 ">
          <img loading="lazy" fetchPriority="low" className="h-8" decoding="async" src={yahoo.src} alt="genuin" />
          {/* <Image priority loading="eager" src={yahoo} alt={`yahoo`} /> */}
        </div>
      </div>
    </div>
  )
}
