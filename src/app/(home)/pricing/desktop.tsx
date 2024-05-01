'use client'
import React from 'react'
import style from './pricing.module.scss'
import ComparePlan from '@components/business/pricing-page/compare-plan'
import PlanDetails from '@components/business/pricing-page/plan-details'
import SubscriptionPlan from '@components/business/pricing-page/subscription-plan'
import Support from '@components/business/pricing-page/support'
import { NavBar } from '@components/pages/home/nav-bar'
import AsSeenIn from '@components/business/as-seen-in'
import { Footer } from '@components/pages/home/footer'

export default function Desktop() {
  return (
    <div className="bg-new-off-white">
      <div className={style.sectionOne}>
        {/* Header component */}
        <NavBar />
      </div>

      <div className="container">
        {/* Subscription Plan component */}
        <SubscriptionPlan />
        {/* Subscription table component */}
        <ComparePlan />
        {/* Subscription Details component */}
        <PlanDetails />
        {/* Support component */}
        <Support />
      </div>
      <AsSeenIn />
      <Footer />
    </div>
  )
}
