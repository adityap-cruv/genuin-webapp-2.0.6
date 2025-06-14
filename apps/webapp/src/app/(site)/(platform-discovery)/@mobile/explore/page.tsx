import { Communities } from '@/components/pages/explore/communities'
import { Loops } from '@/components/pages/explore/loops'

export default function Page() {
  return (
    <div className="overflow-auto px-4 pb-6">
      <Communities />
      <Loops />
    </div>
  )
}
