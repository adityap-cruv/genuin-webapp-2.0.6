import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import SearchSection from '@/components/common/embed/search/search-section'
import { EmbedSearch } from '@/content/embed/embed-search'

export default async function Page() {
  const searchPageData = EmbedSearch.find((item) => item.food)?.food

  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <SearchSection searchTopSection={searchPageData?.searchTopSection} />
      <EmbedFooter />
    </div>
  )
}
