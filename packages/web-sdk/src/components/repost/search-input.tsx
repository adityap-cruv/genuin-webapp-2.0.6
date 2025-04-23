// import { Input } from '@components/ui/input'
import { Input } from '../ui/input'
import { SearchIcon } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { useRepostModalContext } from '@/components/repost/context'

export function SearchInput() {
  const { repostCommunityData: data, search } = useRepostModalContext()
  const setKeyword = useDebouncedCallback((value) => {
    search(value)
  }, 400)

  if (data)
    return (
      <div className='relative mb-2'>
        <Input
          onChange={(e) => {
            setKeyword(e.target.value)
          }}
          className='w-full rounded-full border-none bg-tertiary-200 pl-10 pr-2'
          autoFocus
        />
        <span className='absolute left-3 top-0 flex h-full items-center'>
          <SearchIcon className='w-5 stroke-tertiary stroke-2' />
        </span>
      </div>
    )
}
