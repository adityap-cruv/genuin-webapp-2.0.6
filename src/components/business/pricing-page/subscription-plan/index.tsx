'use client'
import React from 'react'
import Image from 'next/image'
import check from '@icons/business/check.svg'
import star1 from '@images/business/pricing/star1.webp'
import bg from '@images/business/pricing/pricing_bg.svg'
import star2 from '@images/business/pricing/star2.webp'
import exclamation from '@icons/business/exclamation.svg'
import { Button } from '@components/ui/button'
import style from './subscriptionPlan.module.scss'
import { DownloadAppDialog } from '@components/pages/home/download-app-dialog'

export default function SubscriptionPlan() {
  return (
    <div className="my-6 flex flex-col items-center">
      <p className="mt-navbar py-8 text-center text-new-h2">A Plan for Everyone</p>
      <div className="relative mt-10 grid min-h-[600px] grid-cols-3 gap-8">
        <Image priority loading="eager" className="absolute left-[50%] h-full translate-x-[-50%]" src={bg} alt="Star" />
        <div className={`z-10 h-full rounded-xl bg-monochrome-white p-10`}>
          <p className="my-1 text-new-h2-mobile font-semibold">Starter</p>
          <p className="text-new-para-1">For Emerging Communities</p>
          <div className="flex flex-col items-center py-16">
            <p className="text-center text-new-h2">
              $39<span className="text-new-md">/month</span>
            </p>
            <DownloadAppDialog>
              <Button
                size="custom"
                className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                <p className="text-new-para-2">Get Started</p>
              </Button>
            </DownloadAppDialog>
          </div>
          <div className="flex flex-col gap-2">
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
              <p className="text-new-sm">1,000 MaU included with additional MaUs at $0.10/MaU</p>
            </div>
            <div className="flex items-center gap-2">
              <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
              <p className="text-new-sm text-red">Genuin watermark</p>
            </div>
          </div>
        </div>

        <div
          className={`${style.btngradient} relative z-10 h-full rounded-xl bg-monochrome-white p-10`}
          style={{
            boxShadow: '0px 3.624px 18.121px 0px rgba(63, 63, 63, 0.10)',
          }}>
          <Image priority loading="eager" className="absolute -left-5 bottom-6" src={star1} alt="Star" />
          <Image priority loading="eager" className="absolute -right-6 top-6" src={star2} alt="Star" />
          <div
            className="absolute rounded-full px-4 py-1.5 text-center text-body-1-demi text-monochrome-white"
            style={{
              backgroundImage: 'linear-gradient(89deg, #4E78FE 1.08%, #959DF9 97.55%)',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>
            MOST POPULAR
          </div>
          <p className="my-1 text-new-h2-mobile font-semibold">Essential</p>
          <p className="text-new-para-1">For Established Communities</p>
          <div className="flex flex-col items-center py-16">
            <p className="text-center text-new-h2">
              $299<span className="text-new-md">/month</span>
            </p>
            <a href={process.env.NEXT_PUBLIC_BCC_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="custom"
                className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                <p className="text-new-para-2">Get Started</p>
              </Button>
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-new-md">
              Everything in <span className="text-title-2-demi">Starter</span> , plus
            </p>

            <div className="flex items-center gap-2">
              <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
              <p className="text-new-sm">AI content generation</p>
            </div>
            <div className="flex items-center gap-2">
              <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
              <p className="text-new-sm">AI moderation</p>
            </div>
            <div className="flex items-center gap-2">
              <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
              <p className="text-new-sm">10,000 MaU included with additional MaUs at $0.5/MaU</p>
            </div>
            <div className="flex items-center gap-2">
              <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
              <p className="text-new-sm text-red">Genuin watermark</p>
            </div>
          </div>
        </div>

        <div className={`z-10 h-full rounded-xl bg-monochrome-white p-10`}>
          <p className="my-1 text-new-h2-mobile font-semibold">Enterprise</p>
          <p className="text-new-para-1">For Enterprises</p>
          <div className="flex flex-col items-center py-16">
            <p className="text-center text-new-h2">
              $1999<span className="text-new-md">/month</span>
            </p>{' '}
            <a href={process.env.NEXT_PUBLIC_BCC_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="custom"
                className="mt-8 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                <p className="text-new-para-2">Get Started</p>
              </Button>
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-new-md">
              Everything in <span className="text-title-2-demi">Essential</span> , plus
            </p>

            <div className="flex items-center gap-2">
              <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
              <p className="text-new-sm">Managed service</p>
            </div>
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
            <div className="flex items-center gap-2">
              <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
              <p className="text-new-sm">1M MaU included with additional MaUs at $0.01/MaU</p>
            </div>
            <div className="flex items-center gap-2">
              <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
              <p className="text-new-sm">Genuin watermark is removed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
