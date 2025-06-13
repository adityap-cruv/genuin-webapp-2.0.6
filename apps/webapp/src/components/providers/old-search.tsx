import { ReactQueryProvider } from '@/app/providers'
import { SearchDesktop } from '../common/search-bar'

// TODO: Scrap this component once the new search is fully implemented
export function OldSearch() {
  return (
    <ReactQueryProvider>
      <SearchDesktop />
    </ReactQueryProvider>
  )
}
