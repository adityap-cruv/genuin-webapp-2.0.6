import { Input } from '@components/ui/input'
import { Search } from 'lucide-react'
import { useSearchBarStore } from './store'
import { useDebouncedCallback } from 'use-debounce'
import { postRecents } from './api'
import { RECENT_SEARCH_CONTENT_TYPE } from '@lib/constants'

export function SearchInput() {
  const { updateFocus, setKeyword } = useSearchBarStore()

  const debounced = useDebouncedCallback((value) => {
    setKeyword(value)
    if (value) postRecents(RECENT_SEARCH_CONTENT_TYPE.text, undefined, value)
  }, 500)

  return (
    <div className="relative w-96">
      <Input
        onFocus={() => {
          updateFocus(true, false)
        }}
        onChange={(e) => {
          debounced(e.target.value)
        }}
        id="search-input"
        className="rounded-full border-none bg-tertiary-200 pl-10 text-body-1-demi placeholder:text-tertiary focus:border-none"
        placeholder="Search"
      />
      <Search className="absolute left-4 top-0 flex h-full items-center stroke-tertiary stroke-2" />
    </div>
  )
}
