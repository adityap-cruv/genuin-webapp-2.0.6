import { Communities } from '@/components/pages/explore/communities'
import { Loops } from '@/components/pages/explore/loops'

export default function Page() {
  return (
    <div className="h-full overflow-auto px-6 pb-6 md:px-4">
      <Communities />
      <Loops />
    </div>
  )
}
