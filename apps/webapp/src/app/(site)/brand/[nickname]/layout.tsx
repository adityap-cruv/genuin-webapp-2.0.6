import { Layout } from '@components/layouts/desktop/layout'
import { cookies } from 'next/headers'

export default function AppLayout(props: any) {
  const isMobile = cookies().get('device_type')?.value === 'mobile'

  return isMobile ? <>{props.children}</> : <Layout>{props.children}</Layout>
}
