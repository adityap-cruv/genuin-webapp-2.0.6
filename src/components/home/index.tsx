'use client'
import { DiscoverCommunities } from './discover-communities'
import { HeroAnimation } from './hero-animation'
import { MaximizeYourOutcomes } from './maximize-your-outcomes'
import { NavBar } from './nav-bar'
import { useState, useEffect } from 'react'
import { TransformYourBusiness } from './transform-your-business'
import { Footer } from './footer'
import { RevenueCalculator } from './revenue-calculator'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger, Flip, TextPlugin } from 'gsap/all'
import gsap from 'gsap'
import 'swiper/swiper-bundle.css'
import 'swiper/css/effect-coverflow'
import './custom.css'
// import { FloatingNav } from '../ui/floating-navbar'
import { FloatingNav } from '../ui/floating-nav'
import { BottomFloatingViewBar } from './bottom-floating-viewbar'

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, TextPlugin)

export function HomePage() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)
  useEffect(() => {
    if (window.innerWidth < 1074) {
      setIsMobile(true)
    } else {
      setIsMobile(false)
    }
    function handleResize() {
      if (window.innerWidth < 1074) {
        setIsMobile(true)
      } else {
        setIsMobile(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  if (typeof isMobile !== 'undefined')
    return (
      <main className="h-full w-full">
        <FloatingNav className="w-full">
          <NavBar />
        </FloatingNav>
        <HeroAnimation className="absolute left-0 top-0" mobileView={isMobile}>
          <div id="others">
            <MaximizeYourOutcomes />
            <TransformYourBusiness />
            <DiscoverCommunities />
            <RevenueCalculator />
            <Footer />
          </div>
        </HeroAnimation>
        <BottomFloatingViewBar />
      </main>
    )
}
