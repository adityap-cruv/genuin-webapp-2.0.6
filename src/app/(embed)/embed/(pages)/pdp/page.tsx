'use client'
import CarouselSection from '@/components/common/embed/carousel-section'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import PdpSection from '@/components/common/embed/pdp/pdp-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedPdp } from '@/content/embed/embed-pdp'
import { getIndustryName } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

export default async function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const industryName = getIndustryName(config?.industry_type)
  const pdpPageData = (EmbedPdp.find((item: any) => item[industryName]) as any)?.[industryName]

  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <PdpSection pdpSection={pdpPageData?.pdpSection} />
      <CarouselSection />
      <EmbedFooter />
    </div>
  )
}
