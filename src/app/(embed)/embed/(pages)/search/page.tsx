'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import SearchSection from '@/components/common/embed/search/search-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedSearch } from '@/content/embed/embed-search'
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
  const searchPageData = (EmbedSearch.find((item: any) => item[industryName]) as any)?.[industryName]

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
      <SearchSection searchTopSection={searchPageData?.searchTopSection} />
      <EmbedFooter />
    </div>
  )
}
