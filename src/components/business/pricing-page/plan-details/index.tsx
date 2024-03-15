'use client'
import React from 'react'
import { ContactUs } from '@components/common/modals/contact-us'
import { Button } from '@components/ui/button'
import check from '@icons/icCheck.svg'

export default function PlanDetails() {
  return (
    <div className="my-40">
      <p className="text-center text-new-h1" style={{ fontSize: '56px' }}>
        Enterprise Plan
      </p>
      <p className="mb-4 mt-10 text-center text-new-h2">
        Are You a Big Enterprise That Needs a Fully Customized Community Solution?
      </p>
      <p className="text-center text-new-para-1">With enterprise plan, Genuin will curate a solution for you.</p>
      <div className="my-8 flex justify-center">
        <ContactUs>
          <Button
            size="index-page"
            variant="default"
            className="bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
            <p className="whitespace-nowrap text-new-sm text-new-off-white">Contact us for demo and pricing</p>
          </Button>
        </ContactUs>
      </div>
      <div className="flex justify-center gap-8">
        <div className="flex h-32 w-80 items-center gap-6 rounded-2xl bg-[#F7F1F9] p-10">
          <img src={check.src} alt="genuin" className="h-14 w-14" />
          <p>Full white label capability with your URL</p>
        </div>
        <div className="flex h-32 w-80 items-center gap-6 rounded-2xl bg-[#F7F1F9] p-10">
          <img src={check.src} alt="genuin" className="h-14 w-14" />
          <p>Data in your own warehouse</p>
        </div>
        <div className="flex h-32 w-80 items-center gap-6 rounded-2xl bg-[#F7F1F9] p-10">
          <img src={check.src} alt="genuin" className="h-14 w-14" />
          <p>Advanced analytics tools and insights</p>
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-8">
        <div className="flex h-32 w-80 items-center gap-6 rounded-2xl bg-[#F7F1F9] p-10">
          <img src={check.src} alt="genuin" className="h-14 w-14" />
          <p>AI moderation and management tools</p>
        </div>
        <div className="flex h-32 w-80 items-center gap-6 rounded-2xl bg-[#F7F1F9] p-10">
          <img src={check.src} alt="genuin" className="h-14 w-14" />
          <p>AI assistance to engage and grow your audience</p>
        </div>
      </div>
    </div>
  )
}
