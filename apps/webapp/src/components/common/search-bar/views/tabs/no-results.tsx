import { NoSearchResults } from '@components/common/no-search-results'
import { useSearchBarStore } from '../../store'

export function NoResults() {
  const { keyword } = useSearchBarStore()
  return <NoSearchResults forKeyword={keyword} />
}
