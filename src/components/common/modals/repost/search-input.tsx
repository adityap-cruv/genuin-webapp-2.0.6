import { Input } from '@components/ui/input'
import { SearchIcon } from 'lucide-react'
import { useRepostModalStore } from './state'

export function SearchInput() {
  const { data } = useRepostModalStore((state) => ({ data: state.repostCommunityData }))

  if (data)
    return (
      <div className="relative mb-2">
        <Input className="w-full rounded-full border-none bg-tertiary-200 pl-10 pr-2" autoFocus />
        <span className="absolute left-3 top-0 flex h-full items-center">
          <SearchIcon className="w-5 stroke-tertiary stroke-2" />
        </span>
      </div>
    )
}
