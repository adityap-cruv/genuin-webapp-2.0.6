'use client'
import { TopBar } from '@components/layouts/desktop/top-bar'

export function WalletLayout(props: any) {
  return (
    <>
      <main className="absolute inset-0 flex h-full w-full flex-col items-center overflow-clip bg-monochrome-11">
        <TopBar />
        <section className="container flex h-body max-w-4xl gap-4 overflow-clip">
          <section className="relative w-full overflow-auto">{props.children}</section>
        </section>
      </main>
    </>
  )
}
