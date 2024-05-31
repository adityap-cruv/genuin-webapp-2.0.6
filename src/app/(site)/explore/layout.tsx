import { Layout } from '@components/layouts/desktop/layout'
import { type ReactNode } from 'react'

export default function PageLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>
}
