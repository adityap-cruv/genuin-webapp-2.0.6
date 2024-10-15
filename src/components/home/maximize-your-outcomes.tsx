import Image from 'next/image'
import BuildArt from '@images/maximize-your-outcomes/build_art.webp'
import DataFileShieldIcon from '@images/maximize-your-outcomes/icDataFileShield.svg'
import Link from 'next/link'
// import { BCC_LOGIN_LINK } from '@/lib/const'
import { BCC_LOGIN_LINK } from '@/lib/constants'
import CustomButton from '../custom/custom-button'

export function MaximizeYourOutcomes() {
  return (
    <div className="bg-gray-300">
      {' '}
      <div className="container pt-[36px] md:pt-[60px]">
        <div className="flex flex-col items-center gap-4">
          <p className="w-fit rounded-[30px] border-2 border-gray-400 px-4 py-[10px] text-new-para-2-mobile tracking-[0.28px] text-gray-900 md:text-new-para-1 lg:px-8 lg:py-3 lg:tracking-[0.4px]">
            MAXIMIZE YOUR OUTCOMES
          </p>
          <p className="text-center text-index-h4 leading-[110%] md:text-index-h3">Own Your Consumer Data</p>
        </div>

        <div className="flex flex-col-reverse justify-between gap-9 py-[36px] md:gap-[60px] md:py-[60px] lg:flex-row lg:gap-0">
          <div className="flex items-center lg:w-2/5">
            <div className="flex flex-col gap-6 md:gap-9">
              <Image fetchPriority="auto" src={DataFileShieldIcon} className="h-6 md:h-12" alt="build_art" />
              <p className="text-body-2-bold-home md:text-title-2-bold-home-m lg:text-title-2-bold-home-m">
                Centralized Zero-Party Data
              </p>
              <p className="text-cap-1-home-m md:text-title-1-med lg:text-body-2-demi-home">
                Genuin securely captures social interaction data, seamlessly integrating with your existing data stack
                to optimize the pre- and post-purchase journey, keeping consumers within your ecosystem.
              </p>
              <div>
                <Link href={BCC_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
                  <CustomButton
                    variant="custom"
                    className="hidden border border-gray-900 px-5 py-4 text-cap-1-bold-home transition-all hover:border-white md:text-index-h5-extra-bold lg:block"
                    radius="rounded-[36px]"
                    showIcon>
                    Try it out
                  </CustomButton>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center lg:w-1/2">
            <Image
              fetchPriority="auto"
              // className="w-full"
              src={BuildArt}
              alt="build_art"
            />
          </div>
        </div>
        <div className="py-[36px] lg:py-[60px]">
          <p className="text-center text-body-2-demi-home font-bold md:text-title-2-bold-home-m">
            “Reclaiming the destination” is no longer a nice-to-have
          </p>
          <div className="grid grid-cols-1 gap-4 pt-[36px] lg:grid-cols-2 lg:pt-[60px]">
            <StatsCard value="6" unit="x" description="Increase in time on site" valueColor="text-[#4D69FA]" />
            <StatsCard value="307" unit="%" description="Conversion lift" valueColor="text-[#46BCAA]" />
            <StatsCard
              value="11-14"
              unit="min"
              description="In average session time (over last quarter)"
              valueColor="text-[#D63384]"
            />
            <StatsCard
              value="32-35"
              unit="min"
              description="Per month/ per user (Q2 2024)"
              valueColor="text-[#6C5DD3]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const StatsCard = ({
  value,
  unit,
  description,
  valueColor,
}: {
  value: string
  unit: string
  description: string
  valueColor: string
}) => (
  <div className="flex flex-col gap-4 rounded-3xl border-2 border-gray-200 bg-gray-100 p-4 text-center md:gap-9 md:px-12 md:py-9">
    <p className="text-new-h4-mobile md:text-title-3-bold-home">
      Up to <span className={`ml-2 text-[48px] font-extrabold lg:text-[96px] ${valueColor}`}>{value}</span>
      <span className={`text-[24px] font-extrabold lg:text-[64px] ${valueColor}`}>{unit}</span>
    </p>
    <span className="text-cap-1-demi-home md:text-body-2-bold-home md:font-semibold">{description}</span>
  </div>
)
