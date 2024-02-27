'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import check from '@icons/business/check.svg'
import star1 from '@images/business/star1.webp'
import star2 from '@images/business/star2.webp'
import exclamation from '@icons/business/exclamation.svg'
import { Button } from '@components/ui/button'
import style from './subscriptionPlan.module.scss'
import { DownloadAppDialog } from '@components/pages/home/download-app-dialog'
import { ContactUs } from '@components/common/modals/contact-us'

export default function SubscriptionPlan() {
  const [isSelected, setIsSelected] = useState('free')

  return (
    <div className="my-6 flex flex-col items-center">
      <p className="mt-navbar py-8 text-center text-new-h2">A Plan for Everyone</p>
      <div className="mt-10 grid h-[585px] max-w-6xl grid-cols-2 gap-12">
        <div className="flex justify-center">
          {isSelected === 'free' && (
            <div className={`${style.btngradient} z-10 h-full w-[500px] rounded-xl p-10`}>
              <p className="my-1 text-new-h2-mobile font-semibold">Free Plan</p>
              <p className="text-new-para-1">For everyone to get started</p>
              <div className="flex flex-col items-center py-20">
                <p className="text-center text-new-h2">Free Forever</p>
                <DownloadAppDialog>
                  <Button
                    size="custom"
                    className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                    <p className="text-new-para-2">Download App</p>
                  </Button>
                </DownloadAppDialog>
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
            <div className={`${style.btngradient} z-10 h-full w-[500px] rounded-xl p-10`}>
              <p className="my-1 text-new-h2-mobile font-semibold">Starter</p>
              <p className="text-new-para-1">For Emerging Communities</p>
              <div className="flex flex-col items-center py-16">
                <p className="text-center text-new-h2">
                  $39<span className="text-new-md">/month</span>
                </p>
                <ContactUs>
                  <Button
                    size="custom"
                    className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                    <p className="text-new-para-2">Contact us for pricing</p>
                  </Button>
                </ContactUs>
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
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">1000 MaU included with additional MaUs at $0.10/MaU</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Genuin watermark</p>
                </div>
              </div>
            </div>
          )}

          {isSelected === 'essential' && (
            <div className={`${style.btngradient} z-10 h-full w-[500px] rounded-xl p-10`}>
              <p className="my-1 text-new-h2-mobile font-semibold">Essential</p>
              <p className="text-new-para-1">For Established Communities</p>
              <div className="flex flex-col items-center py-16">
                <p className="text-center text-new-h2">
                  $299<span className="text-new-md">/month</span>
                </p>
                <ContactUs>
                  <Button
                    size="custom"
                    className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                    <p className="text-new-para-2">Contact us for pricing</p>
                  </Button>
                </ContactUs>
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
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">10,000 MaU included with additional MaUs at $0.10/MaU</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-sm">Genuin watermark</p>
                </div>
              </div>
            </div>
          )}

          {isSelected === 'enterprise' && (
            <div className={`${style.btngradient} relative z-10 h-full w-[500px] rounded-xl p-10`}>
              <Image priority loading="eager" className="absolute -left-5 bottom-6" src={star1} alt="Star" />
              <Image priority loading="eager" className="absolute -right-6 top-6" src={star2} alt="Star" />
              <p className="my-1 text-new-h2-mobile font-semibold">Enterprise</p>
              <p className="text-new-para-1">For Enterprises</p>
              <div className="flex flex-col items-center py-12">
                <p className="text-center text-new-h2">Customized Pricing</p>
                <ContactUs>
                  <Button
                    size="custom"
                    className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                    <p className="text-new-para-2">Contact us for pricing</p>
                  </Button>
                </ContactUs>
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

        <div className="grid grid-rows-4 gap-4">
          <div
            onClick={() => {
              setIsSelected('free')
            }}
            className={`relative flex items-center justify-between rounded-xl border border-monochrome-7 bg-monochrome-white p-4 px-8 hover:border-2`}
            style={
              isSelected === 'free'
                ? {
                    background:
                      'linear-gradient(white, white) padding-box, linear-gradient(#0645ff, #e9caf4) border-box',
                    borderRadius: '12px',
                    border: '3px solid transparent',
                  }
                : {}
            }>
            {isSelected === 'free' && <div className="absolute -left-24 h-0.5 w-24 bg-[#677EFB]" />}

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
            className={`relative flex items-center justify-between rounded-xl border border-monochrome-7 bg-monochrome-white p-4 px-8 hover:border-2 `}
            style={
              isSelected === 'starter'
                ? {
                    background:
                      'linear-gradient(white, white) padding-box, linear-gradient(#0645ff, #e9caf4) border-box',
                    borderRadius: '12px',
                    border: '3px solid transparent',
                  }
                : {}
            }>
            {isSelected === 'starter' && <div className="absolute -left-24 h-0.5 w-24 bg-[#677EFB]" />}

            <p className="text-new-lg">
              Starter
              <br />
              <span className="text-new-sm">For Emerging Communities</span>
            </p>
            <p className="text-new-sm font-bold">
              $39<span className="font-medium">/month</span>
            </p>
          </div>

          <div
            onClick={() => {
              setIsSelected('essential')
            }}
            className={`relative flex items-center justify-between rounded-xl border  border-monochrome-7 bg-monochrome-white p-4 px-8 hover:border-2 `}
            style={
              isSelected === 'essential'
                ? {
                    background:
                      'linear-gradient(white, white) padding-box, linear-gradient(#0645ff, #e9caf4) border-box',
                    borderRadius: '12px',
                    border: '3px solid transparent',
                  }
                : {}
            }>
            {isSelected === 'essential' && <div className="absolute -left-24 h-0.5 w-24 bg-[#677EFB]" />}

            <p className="text-new-lg">
              Essential
              <br />
              <span className="text-new-sm">For Established Communities</span>
            </p>
            <p className="text-new-sm font-bold">
              $299<span className="font-medium">/month</span>
            </p>
          </div>

          <div
            onClick={() => {
              setIsSelected('enterprise')
            }}
            className={`relative flex items-center justify-between rounded-xl border border-monochrome-7 bg-monochrome-white p-4 px-8 hover:border-2 `}
            style={
              isSelected === 'enterprise'
                ? {
                    background:
                      'linear-gradient(white, white) padding-box, linear-gradient(#0645ff, #e9caf4) border-box',
                    borderRadius: '12px',
                    border: '3px solid transparent',
                  }
                : {}
            }>
            {isSelected === 'enterprise' && <div className="absolute -left-24 h-0.5 w-24 bg-[#677EFB]" />}
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
