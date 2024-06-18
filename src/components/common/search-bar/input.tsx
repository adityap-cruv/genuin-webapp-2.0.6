import { Input } from '@components/ui/input'
import { ChevronLeft } from 'lucide-react'
import { useSearchBarStore } from './store'
import { useDebouncedCallback } from 'use-debounce'
import { postRecents } from './api'
import { RECENT_SEARCH_CONTENT_TYPE } from '@lib/constants'
import { SheetClose } from '@components/ui/sheet'
import { SearchIcon } from '@icons/search-icon'
import { analyticsService } from '@services/analytics_service'

export const SearchInput = {
  desktop: Desktop,
  mobile: Mobile,
}

function Desktop() {
  const { updateFocus, setKeyword } = useSearchBarStore()

  const debounced = useDebouncedCallback((value) => {
    setKeyword(value)
    if (value) postRecents(RECENT_SEARCH_CONTENT_TYPE.text, undefined, value)
    void analyticsService({
      eventName: 'Keyword Searched',
      properties: { keyword_searched: value, search_source: 'web' },
    })
  }, 500)

  return (
    <div className="relative min-w-[100px] md:w-64 lg:w-72 xl:w-96">
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
      <SearchIcon className={`absolute left-3 top-0 flex h-full w-5 items-center stroke-tertiary`} />
    </div>
  )
}

function Mobile() {
  const { setKeyword, close } = useSearchBarStore()

  const debounced = useDebouncedCallback((value) => {
    setKeyword(value)
    if (value) postRecents(RECENT_SEARCH_CONTENT_TYPE.text, undefined, value)
    void analyticsService({
      eventName: 'Keyword Searched',
      properties: { keyword_searched: value, search_source: 'web' },
    })
  }, 500)

  return (
    <div className="flex w-full items-center border-b border-tertiary-200 px-4 py-2">
      <SheetClose
        className="h-full pl-0 pr-1"
        onClick={() => {
          close()
        }}>
        <ChevronLeft className="h-5 stroke-secondary stroke-2 outline-none" />
      </SheetClose>
      <span className="relative w-full">
        <Input
          onChange={(e) => {
            debounced(e.target.value)
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          id="search-input"
          className="h-10 rounded-full border-none bg-tertiary-200 pl-8 text-body-1-demi placeholder:text-tertiary focus:border-none"
          placeholder="Search"
        />
        <SearchIcon className={`absolute left-2 top-0 flex h-full w-5 items-center stroke-tertiary`} />
      </span>
    </div>
  )
}
