'use client'
import { TopBar } from '@components/layouts/desktop/top-bar'
import { SideBar } from './settings-side-bar'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { PATH_NAME } from '@lib/utils/constants/path'
import Analytics from '@services/analytics'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// TODO: make it server component.
export function SettingsLayout(props: any) {
  const router = useRouter()
  const { data } = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push(PATH_NAME.home())
    },
  })

  if (data)
    return (
      <>
        <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip bg-monochrome-11">
          <TopBar />
          <section className="container flex h-body max-w-4xl gap-4 overflow-clip p-4">
            <div
              className="mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-monochrome-8 hover:cursor-pointer"
              onClick={() => {
                const path = localStorage.getItem('previous_path')
                router.push(path ?? PATH_NAME.home())
                void Analytics.track({
                  eventName: 'Settings Closed',
                  properties: {},
                })
              }}>
              <Image src={icBack} alt="back" />
            </div>
            <section className="flex-[1] rounded-2xl border border-monochrome-9 bg-monochrome-white p-4 md:flex-[4]">
              <SideBar />
            </section>
            <section className="relative flex-[11] overflow-auto rounded-2xl border border-monochrome-9 bg-monochrome-white md:flex-[8]">
              {props.children}
            </section>
          </section>
        </main>
      </>
    )
}
