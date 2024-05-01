import { type ReactNode } from 'react'
import { RootHTML } from '@components/layouts/root-layout'

export default function Layout({ children }: { children: ReactNode }) {
  return <RootHTML>{children}</RootHTML>
}
