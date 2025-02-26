'use client'
import CarouselSection from '@/components/common/embed/carousel-section'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import CommunitiesSection from '@/components/common/embed/home/communities-section'
import FeaturesSection from '@/components/common/embed/home/features-section'
import GetStartedSection from '@/components/common/embed/home/get-started-section'
import HeroSection from '@/components/common/embed/home/hero-section'
import TestimonialSection from '@/components/common/embed/home/testimonial-section'
import { EmbedHome } from '@/content/embed/embed-home'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { getIndustryName } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import MultiEmbedHome from '@/components/common/embed/home/multi-embed-home'

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const industryName = getIndustryName(config?.industry_type)
  const homePageData = (EmbedHome.find((item: any) => item[industryName]) as any)?.[industryName]

  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <HeroSection heroSection={homePageData?.heroSection} />
      <MultiEmbedHome type="home1" />
      <FeaturesSection featuresSection={homePageData?.featuresSection} />
      <TestimonialSection testimonialSection={homePageData?.testimonialSection} />
      <CommunitiesSection communitiesSection={homePageData?.communitiesSection} />
      <GetStartedSection getStartedSection={homePageData?.getStartedSection} />
      <EmbedFooter />
    </div>
  )
}
