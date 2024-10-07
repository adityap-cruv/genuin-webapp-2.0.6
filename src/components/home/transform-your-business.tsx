import { Button } from '../ui/button'
import { ArrowIcon } from '@images/maximize-your-outcomes/arrow-icon'
import { type ReactElement } from 'react'
import { PhoneCameraIcon } from '@icons/phone-camera-icon'
import { ShoppingCartIcon } from '@icons/shopping-cart-icon'
import { ShoppingBasketIcon } from '@icons/shopping-basket-icon'
import Link from 'next/link'
// import { PATH_NAME } from '@/lib/paths'
import { PATH_NAME } from '@/lib/utils/constants/path'

export function TransformYourBusiness() {
  return (
    <div className="bg-[#FBEBF3] ">
      <div className="container pt-[36px] md:pt-[60px]">
        <div className="flex flex-col items-center gap-4">
          <p className="w-fit rounded-[30px] border-2 border-gray-400 px-4 py-2 text-new-para-2-mobile tracking-[0.28px] text-gray-700 md:px-6 md:py-4 md:text-new-para-1 lg:px-8 lg:py-3 lg:tracking-[0.4px]">
            TRANSFORM YOUR BUSINESS
          </p>
          <p className="text-center text-index-h4 md:text-index-h3">
            Community-powered curation is the future of media
          </p>
        </div>

        <div className="py-[36px] md:py-[60px]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Link href={PATH_NAME.mediaNetwork} target="_blank" rel="noopener noreferrer">
              <StatsCard
                Node={<ShoppingCartIcon className="h-6 group-hover:fill-blue md:h-12" />}
                title="For Media Networks"
                description="Create video-based communities for Retail Media and Commerce Media to drive engagement and new revenue."
              />
            </Link>
            <Link href={PATH_NAME.brands()} target="_blank" rel="noopener noreferrer">
              <StatsCard
                Node={<ShoppingBasketIcon className="h-6 group-hover:fill-blue md:h-12" />}
                title="For Brands"
                description="Connect with your consumers to drive more conversion across owned & partners' media channels."
              />
            </Link>
            <Link href={PATH_NAME.creators()} target="_blank" rel="noopener noreferrer">
              <StatsCard
                Node={<PhoneCameraIcon className="h-6 group-hover:fill-blue md:h-12" />}
                title="For Creators"
                description="Build communities for interests and brands you love, expand your reach, and earn incremental revenue, "
              />
            </Link>
          </div>
        </div>
      </div>

      <CarouselTicker />
    </div>
  )
}

const StatsCard = ({ Node, title, description }: { Node: ReactElement; title: string; description: string }) => (
  <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border-2 bg-white p-6 text-center hover:border-white md:gap-9 md:p-12 lg:p-9">
    <div
      className={`absolute inset-0 -left-[600px] w-[600px] rounded-e-full bg-[#EDF0FF] transition-all duration-700 ease-out group-hover:left-0`}></div>
    <div
      className={`absolute inset-0 -left-[600px] w-[600px] rounded-e-full bg-[#EDF0FF] transition-all duration-1000 ease-out group-hover:left-0`}></div>
    <div className="relative flex h-full flex-col justify-between gap-4 text-start md:gap-6 lg:gap-9">
      {Node}
      <p className="text-[16px] font-bold leading-none group-hover:text-blue lg:h-[80px] lg:text-[36px]">{title}</p>
      <p className="text-cap-1-home-m font-medium text-gray-600 group-hover:text-gray-700 md:text-title-2-demi">
        {description}
      </p>
      <div>
        <Button className="pl-0">
          <span className="flex items-center gap-2.5 text-cap-1-bold-home transition-all group-hover:gap-3 group-hover:text-blue md:text-body-2-bold-home">
            Learn more <ArrowIcon className="group-hover:fill-blue" />
          </span>
        </Button>
      </div>
    </div>
  </div>
)

const CarouselTicker = () => {
  const communityActions1 = [
    'Create a Brand-Owned Community',
    'Build Communities with UGC',
    'Invite to Join Communities',
    'Grow Your Communities',
    'Create a Brand-Owned Community',
    'Build Communities with UGC',
    'Invite to Join Communities',
    'Grow Your Communities',
    'Create a Brand-Owned Community',
    'Build Communities with UGC',
    'Invite to Join Communities',
    'Grow Your Communities',
  ]

  const communityActions2 = [
    'Generate Original Content',
    'Incentivize & Convert Creators',
    'Increase Conversion with Social Commerce',
    'In-Store to Digital Engagement',
    'Generate Original Content',
    'Incentivize & Convert Creators',
    'Increase Conversion with Social Commerce',
    'In-Store to Digital Engagement',
    'Generate Original Content',
    'Incentivize & Convert Creators',
    'Increase Conversion with Social Commerce',
    'In-Store to Digital Engagement',
  ]

  return (
    <div className="pb-32 pt-12 md:pb-40 md:pt-16 lg:pb-48">
      <div className="relative px-0">
        <div className="w-full overflow-x-hidden bg-black">
          <div className="duration-[40s] animate-marquee whitespace-nowrap">
            <div className="flex gap-4 py-3 text-center text-des-1-demi-home font-semibold text-white md:gap-8 md:py-6 md:text-title-3-bold-home">
              {communityActions1.map((action, index) => (
                <div key={index} className="flex gap-4 md:gap-8">
                  <div>{action}</div>
                  {index < communityActions1.length - 1 && <div className="text-[#4D69FA]">•</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="absolute left-0 top-12 m-0 overflow-x-hidden bg-white p-0"
          style={{
            transform: 'rotate(-7deg)',
            width: '102vw',
          }}>
          <div className="animate-marqueeReverse whitespace-nowrap">
            <div className="flex gap-4 py-3 text-center text-des-1-demi-home font-semibold text-black md:gap-8 md:py-6 md:text-title-3-bold-home">
              {communityActions2.map((action, index) => (
                <div key={index} className="flex gap-4 md:gap-8">
                  <div>{action}</div>
                  {index < communityActions2.length - 1 && <div className="text-[#4D69FA]">•</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
