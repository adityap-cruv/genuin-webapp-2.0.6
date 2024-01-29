import React from 'react'
import style from './pricing.module.scss'
import Header from '@components/business/header'
import ComparePlan from '@components/business/pricing-page/compare-plan'
import PlanDetails from '@components/business/pricing-page/plan-details'
import SubscriptionPlan from '@components/business/pricing-page/subscription-plan'
import Support from '@components/business/pricing-page/support'
import { NavBar } from '@components/pages/home/nav-bar'

export default function PricingPage() {
  return (
    <>
      <div className={style.sectionOne}>
        {/* Header component */}
        <NavBar />
      </div>

      <div className={style.container}>
        {/* Subscription Plan component */}
        <SubscriptionPlan />
        {/* Subscription table component */}
        <ComparePlan />
        {/* Subscription Details component */}
        <PlanDetails />
        {/* Support component */}
        <Support />
      </div>
    </>
  )
}
