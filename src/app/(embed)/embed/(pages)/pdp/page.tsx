'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import MultiEmbed from '@/components/common/embed/multi-embed'
import PdpSection from '@/components/common/embed/pdp/pdp-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedPdp } from '@/content/embed/embed-pdp'
import { useEmbedSetup } from '@/hooks/use-embed-details'
import { getIndustryName } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

type IndustryName = keyof (typeof EmbedPdp)[number]

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const industryName = getIndustryName(config?.industry_type) as IndustryName
  const pdpPageData = EmbedPdp.find((item) => Object.keys(item).includes(industryName))?.[industryName]
  const { embedConfigs } = useEmbedSetup({ config })

  return (
    <div className="w-full overflow-scroll px-5">
      <EmbedNav />
      <PdpSection pdpSection={pdpPageData?.pdpSection} />
      <MultiEmbed
        dataEmbedId={`${embedConfigs['PDP Embed'].embedId}`}
        dataEmbedApiKey={embedConfigs['PDP Embed'].embedApiKey}
        genSdkId={1}
        style={{
          height: '600px',
        }}
      />
      <EmbedFooter />
    </div>
  )
}
