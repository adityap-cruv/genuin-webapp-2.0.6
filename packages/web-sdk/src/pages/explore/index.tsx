import { HeaderMobile } from '@/components/header/mobile'
import { Communities } from '@/components/pages/explore/communities'
import { Loops } from '@/components/pages/explore/loops'
import { NAV_BAR_HEIGHT } from '@/const'

export function ExplorePage() {
  return (
    <>
      <HeaderMobile variant='white' />
      <div
        style={{ height: `calc(100% - ${NAV_BAR_HEIGHT}px)` }}
        className='__gen__sdk__hide__scrollbar p-4 md:p-6 overflow-auto md:!h-full w-full'>
        <Communities />
        <Loops />
      </div>
    </>
  )
}
