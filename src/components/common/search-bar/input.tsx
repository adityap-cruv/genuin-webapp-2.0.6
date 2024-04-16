import { Input } from '@components/ui/input'
import { Search } from 'lucide-react'

export function SearchInput() {
  return (
    <>
      <Input className="rounded-full border-none bg-monochrome-4 pl-10 focus:border-none" />
      <Search className="absolute left-4 top-0 flex h-full items-center stroke-2" />
    </>
  )
}
