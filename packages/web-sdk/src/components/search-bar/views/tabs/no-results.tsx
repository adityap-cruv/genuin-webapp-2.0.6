// import { NoSearchResults } from '@components/common/no-search-results'
import { NoSearchResults } from '@/components/no-search-results'
import { useSearchBarContext } from '@/components/search-bar/context'

export function NoResults() {
  const { keyword } = useSearchBarContext()
  return <NoSearchResults forKeyword={keyword} />
}
