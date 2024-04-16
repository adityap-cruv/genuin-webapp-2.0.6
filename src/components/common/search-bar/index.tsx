import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { SearchInput } from './input'
import { SearchBody } from './body'
import { useSearchBarStore } from './store'

export function SearchBar() {
  const { setView } = useSearchBarStore()
  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) {
          setTimeout(() => {
            setView('INITIAL')
          }, 200)
        }
      }}>
      <PopoverTrigger>
        <div className="relative h-10 w-96">
          <SearchInput />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={10}
        avoidCollisions
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
        className="h-[60vh] w-96 overflow-clip rounded-2xl p-0">
        <SearchBody />
      </PopoverContent>
    </Popover>
  )
}

export default SearchBar
