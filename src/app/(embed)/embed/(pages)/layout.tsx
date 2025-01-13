import { TopBar as MobileTopBar } from '@/components/layouts/mobile/top-bar'
import { TopBar as DesktopTopBar } from '@/components/layouts/desktop/top-bar'
import { cookies } from 'next/headers'

export default function AppLayout(props: any) {
  const isMobile = cookies().get('device_type')?.value === 'mobile'

  return (
    <main>
      {isMobile ? <MobileTopBar /> : <DesktopTopBar />}
      <section className="flex w-full overflow-clip px-0 2xl:container xl:px-10 2xl:px-0">{props.children}</section>
    </main>
  )
}
