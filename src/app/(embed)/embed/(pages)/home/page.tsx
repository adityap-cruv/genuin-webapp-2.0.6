'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import CommunitiesSection from '@/components/common/embed/home/communities-section'
import FeaturesSection from '@/components/common/embed/home/features-section'
import GetStartedSection from '@/components/common/embed/home/get-started-section'
import HeroSection from '@/components/common/embed/home/hero-section'
import TestimonialSection from '@/components/common/embed/home/testimonial-section'
import { EmbedHome } from '@/content/embed/embed-home'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { getDataForIndustry } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import MultiEmbed from '@/components/common/embed/multi-embed'
import { useEmbedSetup } from '@/hooks/use-embed-details'

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const homePageData = getDataForIndustry(config, EmbedHome)
  const { embedConfigs } = useEmbedSetup({ config })

  return (
    <div className="h-full w-full px-5">
      <EmbedNav />
      <HeroSection heroSection={homePageData?.heroSection} />
      <MultiEmbed
        dataEmbedId={`${embedConfigs['Home/Blog Embed'].embedId}`}
        dataEmbedApiKey={embedConfigs['Home/Blog Embed'].embedApiKey}
        style={{
          height: '400px',
        }}
      />
      <FeaturesSection featuresSection={homePageData?.featuresSection} embedConfigs={embedConfigs} />
      <TestimonialSection testimonialSection={homePageData?.testimonialSection} embedConfigs={embedConfigs} />
      <CommunitiesSection communitiesSection={homePageData?.communitiesSection} embedConfigs={embedConfigs} />
      <GetStartedSection getStartedSection={homePageData?.getStartedSection} />
      <EmbedFooter />
    </div>
  )
}
