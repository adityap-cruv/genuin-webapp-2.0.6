import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import CustomButton from '../custom/custom-button'
// import { ContactUs } from '../old/contact-us'
import { ContactUs } from '../common/modals/contact-us'
import { Button } from '../ui/button'
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
// import { BCC_LOGIN_LINK } from '@'
import { BCC_LOGIN_LINK } from '@/lib/constants'

export function BottomFloatingViewBar({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll()

  const [visible, setVisible] = useState(false)
  const [shouldBeVisible, setShouldBeVisible] = useState(false)

  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === 'number') {
      const direction = current - scrollYProgress.getPrevious()

      if (scrollYProgress.get() < 0.05) {
        setVisible(false)
      } else {
        if (direction > 0) {
          setVisible(true)
        } else {
          setVisible(false)
        }
      }
    }
  })

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setShouldBeVisible(true)
        } else {
          setShouldBeVisible(false)
        }
      })
    })
    const revenueElement = document.getElementById('revenue')
    if (revenueElement) {
      observer.observe(revenueElement)
    }

    const revenueCalcObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setShouldBeVisible(false)
        } else {
          setShouldBeVisible(true)
        }
      })
    })

    const revenueCalcElement = document.getElementById('revenue-calculator')

    if (revenueCalcElement) {
      revenueCalcObserver.observe(revenueCalcElement)
    }

    return () => {
      observer.disconnect()
      revenueCalcObserver.disconnect()
    }
  }, [shouldBeVisible])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: 100,
        }}
        animate={{
          y: visible && shouldBeVisible ? 0 : 100,
          opacity: visible && shouldBeVisible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn('fixed bottom-0 z-[5000] flex w-full justify-center lg:bottom-[20px]', className)}>
        <BottomBar />
      </motion.div>
    </AnimatePresence>
  )
}

export function BottomBar() {
  return (
    <>
      <div
        style={{ borderColor: '#DEE2E6', backgroundColor: '#F8F9FA' }}
        className="hidden w-min items-center gap-6 whitespace-nowrap rounded-full border py-1 pl-6 pr-2 text-cap-1-demi-home lg:flex">
        <p>Input your MAUs to see the incremental revenue potential</p>
        <Link href={'#revenue-calculator'}>
          <CustomButton variant="blue" className="px-4 py-2 text-cap-1-bold-home" radius="rounded-full" showIcon>
            Calculate
          </CustomButton>
        </Link>
      </div>
      <div
        className="flex w-full items-center justify-center gap-2 py-3 lg:hidden"
        style={{ backgroundColor: 'rgba(9, 10, 27, 0.20)', borderTop: '1px solid #DEE2E6' }}>
        <Link href={BCC_LOGIN_LINK}>
          <Button className="items-center rounded-full bg-blue py-3 pl-4 pr-3">
            <p className="text-white text-[14px] font-extrabold">Get Started</p>
            <ChevronRight className="stroke-white" />
          </Button>
        </Link>
        <ContactUs>
          <div className="flex items-center gap-2 pl-6 pr-2">
            <p className="text-white text-cap-1-demi-home">Contact Us</p>
            <ChevronRight className="stroke-white" />
          </div>
        </ContactUs>
      </div>
    </>
  )
}
