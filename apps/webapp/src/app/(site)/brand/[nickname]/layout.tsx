import { Layout } from '@components/layouts/desktop/layout'
import { cookies } from 'next/headers'
import { TopBar } from '@/components/layouts/mobile/top-bar'

export default function AppLayout(props: any) {
  const isMobile = cookies().get('device_type')?.value === 'mobile'

  return isMobile ? (
    <>
      <TopBar variant={'light'} />
      {props.children}
    </>
  ) : (
    <Layout>{props.children}</Layout>
  )
}
