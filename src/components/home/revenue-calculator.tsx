import { useState } from 'react'
import { Poppins } from 'next/font/google'
import CustomButton from '../custom/custom-button'
import Link from 'next/link'
// import { BCC_LOGIN_LINK } from '@/lib/const'
import { BCC_LOGIN_LINK } from '@/lib/constants'
// import { ContactUs } from '../old/contact-us'
import { ContactUs } from '../common/modals/contact-us'
// import { ArrowIcon } from '@images/maximize-your-outcomes/arrow-icon'
// import { Button } from '../ui/button'
import { Input } from '../ui/input'
// import { Slider } from '../ui/slider'
import { Slider } from '../ui/slider'

const poppinsFont = Poppins({ weight: '900', subsets: ['latin'] })

export function RevenueCalculator() {
  return (
    <div id="revenue-calculator" className="bg-[#090A1B]">
      <div className="container py-[36px] md:py-[60px]">
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-gray-800 p-5 text-center md:gap-8 md:p-9 lg:gap-9 lg:rounded-[60px] lg:border-4 lg:p-[60px]">
          <p className="text-body-2-bold-home text-white md:text-title-2-bold-home-m lg:text-title-3-bold-home">
            Calculate Your Potential Revenue
          </p>
          <p className="text-cap-1-home-m font-medium text-gray-500 md:text-body-2-demi-home lg:text-title-2-demi">
            Estimate the incremental revenue you can earn with Genuin's video-powered communities.
          </p>
          <Calculator />
        </div>

        <div
          className="mt-12 flex flex-col gap-12 rounded-2xl p-9 md:p-[60px] lg:rounded-[60px]"
          style={{
            background: 'linear-gradient(90deg, #9395FF 0%, #1685FD 100%)',
          }}>
          <p
            className="text-center text-index-h4-extra-bolder text-white md:text-index-h5-extra-bolder lg:text-index-h1-extra-bolder"
            style={{
              textShadow: '0px 4px 20px rgba(63, 63, 63, 0.10)',
              ...poppinsFont.style,
            }}>
            LAUNCH YOUR
            <br /> BRAND COMMUNITY
            <br /> FOR FREE!
          </p>

          <div className="hidden justify-center gap-4 lg:flex">
            <Link href={BCC_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
              <CustomButton
                variant="blue"
                className="rounded-full px-8 py-6 text-cap-1-bold-home md:text-index-h5-extra-bold"
                radius="rounded-[36px]"
                showIcon>
                Get Started
              </CustomButton>
            </Link>

            <ContactUs>
              <CustomButton
                variant="light"
                className="rounded-full px-8 py-6 text-cap-1-bold-home md:text-index-h5-extra-bold"
                radius="rounded-[36px]"
                showIcon>
                Contact Us
              </CustomButton>
            </ContactUs>
          </div>
        </div>
      </div>
    </div>
  )
}

const formatRevenue = (num: any) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B'
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K'
  } else {
    return num.toString()
  }
}

const Calculator = () => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [mau, setMau] = useState(100000)
  const [currentMau, setCurrentMau] = useState(100000)
  const [multiplier, setMultiplier] = useState(1)

  const baseConversionRate = 10 // 10% convert to community
  const viewsPerUser = 60 // From the table: views per user
  const averageCpm = 15 // CPM = $100

  // Calculate Partnership Revenue based on impressions and CPM
  const calculateRevenue = () => {
    let adjustedMultiplier = multiplier

    if (multiplier < 0) {
      adjustedMultiplier = 1 / Math.abs(multiplier * 2)
    }

    const monthlyRevenue =
      (Number(currentMau * adjustedMultiplier) * viewsPerUser * averageCpm) / baseConversionRate / 1000
    const annualRevenue = (monthlyRevenue * 12).toFixed(2)

    return formatRevenue(annualRevenue)
  }

  const calculateMAU = () => {
    let adjustedMultiplier = multiplier

    if (multiplier < 0) {
      adjustedMultiplier = 1 / Math.abs(multiplier * 2)
    }

    return formatRevenue((currentMau * adjustedMultiplier).toFixed(2))
  }

  return (
    <div className="flex justify-center">
      {isCalculatorOpen ? (
        <div className="flex w-full flex-col items-center gap-6 rounded-lg bg-gray-900 p-4 md:gap-9 md:p-9 lg:w-3/4 lg:rounded-3xl lg:px-12 lg:py-9">
          <p className="text-cap-1-bold-home text-white md:text-title-3-bold-home">
            <span className="text-index-h4-extra-bold text-[#46BCAA] md:text-index-h3-extra-bold lg:text-index-h2-extra-bold">
              ${calculateRevenue()}
            </span>
            /year{' '}
            <span className="text-cap-1-home-m font-medium text-gray-500 md:text-body-2-demi-home lg:text-title-2-demi">
              ({calculateMAU()} MAU)
            </span>
          </p>

          <div className="relative w-full lg:w-1/2">
            <Input
              type="text"
              value={mau || ''}
              onChange={(e) => {
                const value = e.target.value
                if (/^\d*$/.test(value)) {
                  setMau(Number(value))
                }
              }}
              className="h-12 rounded-xl border border-gray-800 bg-gray-900 text-white shadow"
              placeholder="Enter # of MAUs"
            />
            <div className="absolute right-1.5 top-1.5">
              <CustomButton
                variant="blue"
                className="px-4 py-2.5 text-cap-1-bold"
                radius="rounded-xl"
                onClick={() => {
                  setCurrentMau(mau)
                  setIsCalculatorOpen(true)
                }}>
                Calculate
              </CustomButton>
            </div>
          </div>

          <div className="flex w-full items-center gap-2">
            <p className="flex-shrink-0 text-cap-1-demi text-white md:text-title-2-demi">
              {formatRevenue(currentMau / 4)}
            </p>
            <div className="w-full">
              <Slider
                min={-2}
                max={10}
                step={0.1}
                value={[multiplier]}
                onValueChange={(value) => {
                  setMultiplier(value[0])
                }}
                className="rounded-md bg-[#474752]"
              />
            </div>
            <p className="flex-shrink-0 text-cap-1-demi text-white md:text-title-2-demi">
              {formatRevenue(currentMau * 10)} (MAU)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex w-full flex-col gap-3 lg:w-2/5">
          <Input
            type="text"
            className="h-12 rounded-xl border border-gray-800 bg-gray-900 text-white shadow"
            placeholder="Enter your Monthly Active Users (MAUs)"
            value={mau || ''}
            onChange={(e) => {
              const value = e.target.value
              if (/^\d*$/.test(value)) {
                setMau(Number(value))
              }
            }}
          />
          <div className="absolute right-1.5 top-1.5 hidden lg:block">
            <CustomButton
              variant="blue"
              className="px-4 py-2.5 text-cap-1-bold"
              radius="rounded-xl"
              onClick={() => {
                setCurrentMau(mau)
                setIsCalculatorOpen(true)
              }}>
              Calculate
            </CustomButton>
          </div>

          <CustomButton
            variant="blue"
            className="px-4 py-2.5 text-cap-1-bold lg:hidden"
            radius="rounded-xl"
            onClick={() => {
              setIsCalculatorOpen(true)
            }}>
            Calculate
          </CustomButton>
        </div>
      )}
    </div>
  )
}
