import { TopBar as MobileTopBar } from '@/components/layouts/mobile/top-bar'
import { cookies } from 'next/headers'
import { Layout } from '@/components/layouts/desktop/layout'

export default function AppLayout(props: any) {
  const isMobile = cookies().get('device_type')?.value === 'mobile'

  return isMobile ? (
    <main>
      <MobileTopBar />
      <section className="flex w-full overflow-clip px-0 2xl:container xl:px-10 2xl:px-0">{props.children}</section>
    </main>
  ) : (
    <Layout isCollapsed>{props.children}</Layout>
  )
}
