import { Layout } from '@components/layouts/desktop/layout'
import type { PropsWithChildren } from 'react'

export default function AppLayout(props: PropsWithChildren) {
  return <Layout>{props.children}</Layout>
}
