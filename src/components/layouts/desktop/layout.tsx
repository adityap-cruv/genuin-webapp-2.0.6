'use client'
import { TopBar } from './top-bar'
import { SideBar } from './side-bar'
import { useEffect } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import { cn } from '@lib/utils'

export function Layout(props: any) {
  const { showTopbar, setIsIframe } = useLocalStorage((state) => ({
    showTopbar: !state.isIframe,
    setIsIframe: state.setIsIframe,
  }))

  useEffect(() => {
    setIsIframe(window !== window.parent)
  }, [])

  return (
    <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip">
      {showTopbar && <TopBar />}
      <section className={cn('flex w-full overflow-clip xl:container', showTopbar ? 'h-body' : 'h-full')}>
        <section className="flex-[1] lg:flex-[3]">
          <SideBar />
        </section>
        <section className="relative flex-[11] lg:flex-[9]">{props.children}</section>
      </section>
    </main>
  )
}
