import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { SearchInput } from './input'
import { SearchBody } from './body'
import { useSearchBarStore } from './store'
import 'swiper/css'

export function SearchBar() {
  const { updateFocus, focusOnInput, focusOnModal } = useSearchBarStore()

  return (
    <Popover open={focusOnInput || focusOnModal}>
      <PopoverTrigger>
        <SearchInput />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={10}
        avoidCollisions
        className="h-[75vh] w-96 overflow-clip rounded-2xl p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
        onFocus={() => {
          updateFocus(false, true)
        }}
        onInteractOutside={(e) => {
          e.preventDefault()
          setTimeout(() => {
            const searchElement = document.getElementById('search-input') as HTMLInputElement
            // eslint-disable-next-line eqeqeq
            const focus = document.activeElement == searchElement
            if (!focus && searchElement) searchElement.value = ''
            updateFocus(focus, false)
          }, 200)
        }}>
        <SearchBody />
      </PopoverContent>
    </Popover>
  )
}

export default SearchBar
