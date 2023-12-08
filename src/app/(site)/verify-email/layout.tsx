import { type ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return <main className="absolute inset-0 min-h-full min-w-full">{children}</main>
}
