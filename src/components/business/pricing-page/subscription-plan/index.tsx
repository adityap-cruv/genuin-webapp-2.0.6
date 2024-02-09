'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import check from '@icons/business/check.svg'
import star1 from '@images/business/star1.webp'
import star2 from '@images/business/star2.webp'
import exclamation from '@icons/business/exclamation.svg'
import { Button } from '@components/ui/button'

export default function SubscriptionPlan() {
  const [isSelected, setIsSelected] = useState('free')
  return (
    <div className="my-10 ">
      <p className="text-center text-new-h2">
        A Plan
        <br /> for Every Brand
      </p>
      <div className="mt-10 grid h-[585px] grid-cols-2 gap-12">
        <div className="flex justify-center">
          {isSelected === 'free' && (
            <div
              className="z-10 h-full w-[500px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <p className="my-1 text-new-h2-mobile font-semibold">Free Plan</p>
              <p className="text-new-para-1">FOR EVERYONE TO GET STARTED</p>
              <div className="flex flex-col items-center py-20">
                <p className="text-center text-new-h2">Free Forever</p>
                <Button
                  size="custom"
                  className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                  <p className="text-new-para-2">Download App</p>
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-title-2-demi">Benefits:</p>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Basic community tools enough you get you started</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Basic moderation tools</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Genuin watermark</p>
                </div>
              </div>
            </div>
          )}

          {isSelected === 'starter' && (
            <div
              className="z-10 h-full w-[500px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <p className="my-1 text-new-h2-mobile font-semibold">Starter</p>
              <p className="text-new-para-1">FOR EVERYONE TO GET STARTED</p>
              <div className="flex flex-col items-center py-20">
                <p className="text-center text-new-h2">
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
                  <p className="text-new-sm">Basic community tools enough you get you started</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Basic moderation tools to keep community safe</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Genuin watermark</p>
                </div>
              </div>
            </div>
          )}

          {isSelected === 'essential' && (
            <div
              className="z-10 h-full w-[500px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <p className="my-1 text-new-h2-mobile font-semibold">Essential</p>
              <p className="text-new-para-1">FOR SMALL STUDIOS</p>
              <div className="flex flex-col items-center py-20">
                <p className="text-center text-new-h2">
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
                  <p className="text-new-sm">Basic community tools enough you get you started</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Basic moderation tools</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Genuin watermark</p>
                </div>
              </div>
            </div>
          )}

          {isSelected === 'pro-plan' && (
            <div
              className="z-10 h-full w-[500px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <p className="my-1 text-new-h2-mobile font-semibold">Pro Plan</p>
              <p className="text-new-para-1">FOR BIG COMMUNITIES</p>
              <div className="flex flex-col items-center py-12">
                <p className="text-center text-new-h2">Customized Pricing</p>
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
                  <p className="text-new-sm">White label ability with your own URL</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">AI tools</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Genuin watermark</p>
                </div>
              </div>
            </div>
          )}

          {isSelected === 'enterprise' && (
            <div
              className="relative z-10 h-full w-[500px] rounded-xl p-10"
              style={{
                border: '3px solid #E9CAF4',
                background: '#FFF',
                boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.05)',
              }}>
              <Image priority loading="eager" className="absolute -left-5 bottom-6" src={star1} alt="Star" />
              <Image priority loading="eager" className="absolute -right-6 top-6" src={star2} alt="Star" />
              <p className="my-1 text-new-h2-mobile font-semibold">Enterprise</p>
              <p className="text-new-para-1">FOR ENTERPRISES</p>
              <div className="flex flex-col items-center py-12">
                <p className="text-center text-new-h2">Customized Pricing</p>
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
                  <p className="text-new-sm">AI assistance to engage and grow your audience</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-rows-5 gap-4">
          <div
            onClick={() => {
              setIsSelected('free')
            }}
            className={`relative flex items-center bg-monochrome-white ${
              isSelected === 'free' ? 'border-4 border-[#E9CAF4]' : 'border border-monochrome-7'
            } justify-between rounded-xl p-4 px-8 hover:border-4 hover:border-[#E9CAF4]`}>
            {isSelected === 'free' && <hr className="absolute -left-24 w-24 border-2 border-[#E9CAF4]" />}
            <p className="text-new-lg">
              Free
              <br />
              <span className="text-new-sm">For everyone to get started</span>
            </p>
            <p className="text-new-sm font-bold">Free Forever</p>
          </div>

          <div
            onClick={() => {
              setIsSelected('starter')
            }}
            className={`relative flex items-center bg-monochrome-white ${
              isSelected === 'starter' ? 'border-4 border-[#E9CAF4]' : 'border border-monochrome-7'
            } justify-between rounded-xl p-4 px-8 hover:border-4 hover:border-[#E9CAF4]`}>
            {isSelected === 'starter' && <hr className="absolute -left-24 w-24 border-2 border-[#E9CAF4]" />}
            <p className="text-new-lg">
              Starter
              <br />
              <span className="text-new-sm">For Community Builders</span>
            </p>
            <p className="text-new-sm font-bold">
              $39<span className="font-medium">/month</span>
            </p>
          </div>

          <div
            onClick={() => {
              setIsSelected('essential')
            }}
            className={`relative flex items-center bg-monochrome-white ${
              isSelected === 'essential' ? 'border-4 border-[#E9CAF4]' : 'border border-monochrome-7'
            } justify-between rounded-xl p-4 px-8 hover:border-4 hover:border-[#E9CAF4]`}>
            {isSelected === 'essential' && <hr className="absolute -left-24 w-24 border-2 border-[#E9CAF4]" />}
            <p className="text-new-lg">
              Essential
              <br />
              <span className="text-new-sm">For Small Studios</span>
            </p>
            <p className="text-new-sm font-bold">
              $299<span className="font-medium">/month</span>
            </p>
          </div>

          <div
            onClick={() => {
              setIsSelected('pro-plan')
            }}
            className={`relative flex items-center bg-monochrome-white ${
              isSelected === 'pro-plan' ? 'border-4 border-[#E9CAF4]' : 'border border-monochrome-7'
            } justify-between rounded-xl p-4 px-8 hover:border-4 hover:border-[#E9CAF4]`}>
            {isSelected === 'pro-plan' && <hr className="absolute -left-24 w-24 border-2 border-[#E9CAF4]" />}
            <p className="text-new-lg">
              Pro
              <br />
              <span className="text-new-sm">For Big Companies</span>
            </p>
            <p className="text-new-sm font-bold">Customized Pricing</p>
          </div>

          <div
            onClick={() => {
              setIsSelected('enterprise')
            }}
            className={`relative flex items-center bg-monochrome-white ${
              isSelected === 'enterprise' ? 'border-4 border-[#E9CAF4]' : 'border border-monochrome-7'
            } justify-between rounded-xl p-4 px-8 hover:border-4 hover:border-[#E9CAF4]`}>
            {isSelected === 'enterprise' && <hr className="absolute -left-24 w-24 border-2 border-[#E9CAF4]" />}
            <p className="text-new-lg">
              Enterprise
              <br />
              <span className="text-new-sm">For Enterprises</span>
            </p>
            <p className="text-new-sm font-bold">Customized Pricing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
