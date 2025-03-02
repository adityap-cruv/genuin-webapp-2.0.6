'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import SearchSection from '@/components/common/embed/search/search-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedSearch } from '@/content/embed/embed-search'
import { useEmbedSetup } from '@/hooks/use-embed-details'
import { getIndustryName } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const industryName = getIndustryName(config?.industry_type)
  const searchPageData = (EmbedSearch.find((item: any) => item[industryName]) as any)?.[industryName]
  const { embedConfigs } = useEmbedSetup({ config })

  return (
    <div className="w-full overflow-scroll px-5">
      <EmbedNav />
      <SearchSection searchTopSection={searchPageData?.searchTopSection} embedConfigs={embedConfigs} />
      <EmbedFooter />
    </div>
  )
}
