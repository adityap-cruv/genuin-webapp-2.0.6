'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import SearchSection from '@/components/common/embed/search/search-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedSearch } from '@/content/embed/embed-search'
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

  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <SearchSection searchTopSection={searchPageData?.searchTopSection} />
      <EmbedFooter />
    </div>
  )
}
