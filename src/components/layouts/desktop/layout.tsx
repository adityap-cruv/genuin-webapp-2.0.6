'use client'
import { SideBar } from './side-bar'
import { TopBar } from './top-bar'
import { cn } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { IHeartDemo } from './iheart-demo'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'

export function Layout(props: any) {
  const { showNavbar } = useGenuinOptions()
  const { renderIn } = useIHeartDemoStates()

  return (
    <main className="absolute inset-0 flex h-full w-full flex-col items-center overflow-clip">
      {showNavbar && <TopBar />}
      <section
        className={cn(
          'flex w-full overflow-clip px-0 2xl:container xl:px-10 2xl:px-0',
          showNavbar ? 'h-body' : 'h-full'
        )}>
        <SideBar />
        <section id="root-element" className="relative flex w-full flex-col">
          {props.children}
        </section>
      </section>
      {/* Iframe Section */}
      {renderIn === 'root' && <IHeartDemo />}
    </main>
  )
}
