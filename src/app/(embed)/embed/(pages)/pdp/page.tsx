'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import MultiEmbed from '@/components/common/embed/multi-embed'
import PdpSection from '@/components/common/embed/pdp/pdp-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedPdp } from '@/content/embed/embed-pdp'
import { getIndustryName } from '@/lib/utils'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

declare global {
  interface Window {
    genuin: {
      init: (config: object) => void
    }
  }
}

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const industryName = getIndustryName(config?.industry_type)
  const pdpPageData = (EmbedPdp.find((item: any) => item[industryName]) as any)?.[industryName]

  useEffect(() => {
    window.genuin.init({})
    document.body.style.backgroundColor = '#FAFAFA'

    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])
  
  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <PdpSection pdpSection={pdpPageData?.pdpSection} />
      <MultiEmbed type="pdp1" />
      <EmbedFooter />
    </div>
  )
}
