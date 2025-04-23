import { Input } from '@/components/ui/input'
import { ChevronLeft } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { postRecents } from './api'
import { RECENT_SEARCH_CONTENT_TYPE } from '@/const'
import { SheetClose } from '@/components/ui/sheet'
import { SearchIcon } from '../icons/search-icon'
import { Analytics } from '@/analytics'
import { useSearchBarContext } from '@/components/search-bar/context'

export const SearchInput = {
  desktop: Desktop,
  mobile: Mobile,
}

function Desktop() {
  const { updateFocus, setKeyword } = useSearchBarContext()

  const debounced = useDebouncedCallback((value) => {
    if (value.trim() !== '') {
      setKeyword(value.trim())
      postRecents(RECENT_SEARCH_CONTENT_TYPE.text, undefined, value.trim())
    } else {
      setKeyword('')
    }
  }, 500)

  return (
    <div className='relative'>
      <Input
        onFocus={() => {
          updateFocus(true, false)
        }}
        onChange={(e) => {
          debounced(e.target.value)
        }}
        id='search-input'
        className='rounded-full md:w-56 lg:w-96 border-none bg-tertiary-200 pl-10 text-body-1-demi placeholder:text-tertiary focus:border-none'
        placeholder='Search'
      />
      <SearchIcon className='absolute left-3 top-0 flex h-full w-5 items-center stroke-tertiary' />
    </div>
  )
}

function Mobile() {
  const { setKeyword, close } = useSearchBarContext()

  const debounced = useDebouncedCallback((value) => {
    setKeyword(value.trim())
    if (value.trim() !== '')
      postRecents(RECENT_SEARCH_CONTENT_TYPE.text, undefined, value)
    Analytics.track(Analytics.EventNames.KeywordSearched, {
      keyword_searched: value,
      search_source: 'web',
    })
  }, 500)

  return (
    <div className=' box-border flex w-full items-center border-b border-tertiary-200 px-4 py-2'>
      <SheetClose
        className='h-full pl-0 pr-1 bg-transparent'
        onClick={() => {
          close()
        }}>
        <ChevronLeft className='h-5 stroke-secondary stroke-2 outline-none' />
      </SheetClose>
      <div className='relative w-full'>
        <Input
          onChange={(e) => {
            debounced(e.target.value)
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          id='search-input'
          className='h-10 w-full box-border rounded-full border-none bg-tertiary-200 pl-8 text-body-1-demi placeholder:text-tertiary focus:border-none'
          placeholder='Search'
        />
        <SearchIcon className='absolute left-2 top-0 flex h-full w-5 items-center stroke-tertiary' />
      </div>
    </div>
  )
}
