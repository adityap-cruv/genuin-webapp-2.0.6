'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import MultiEmbed from '@/components/common/embed/multi-embed'
import PdpSection from '@/components/common/embed/pdp/pdp-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedPdp } from '@/content/embed/embed-pdp'
import { useEmbedSetup } from '@/hooks/use-embed-details'
import { getDataForIndustry } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const pdpPageData = getDataForIndustry(config, EmbedPdp)
  const { embedConfigs } = useEmbedSetup({ config })

  return (
    <div className="w-full overflow-scroll px-5">
      <EmbedNav />
      <PdpSection pdpSection={pdpPageData?.pdpSection} />
      <MultiEmbed
        dataEmbedId={`${embedConfigs['PDP Embed'].embedId}`}
        dataEmbedApiKey={embedConfigs['PDP Embed'].embedApiKey}
        style={{
          height: '600px',
        }}
      />
      <EmbedFooter />
    </div>
  )
}
