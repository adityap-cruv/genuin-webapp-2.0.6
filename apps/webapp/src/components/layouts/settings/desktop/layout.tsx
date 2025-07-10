'use client'
import { SideBar } from './settings-side-bar'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { PATH_NAME } from '@lib/utils/constants/path'
import Analytics from '@services/analytics'
import { useRouter } from 'next/navigation'
import { TopBar } from '@genuin/components/organisms/top-bar'
import { OldSearch } from '@/components/providers/old-search'

// TODO: make it server component.
export function SettingsLayout(props: any) {
  const router = useRouter()

  return (
    <>
      <main className="bg-monochrome-11 absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip">
        <TopBar />
        <section className="h-body container flex max-w-4xl gap-4 overflow-clip p-4">
          <div
            className="bg-monochrome-8 mt-2 flex h-12 w-12 items-center justify-center rounded-full hover:cursor-pointer"
            onClick={() => {
              const path = localStorage.getItem('previous_path')
              router.push(path ?? PATH_NAME.home())
              void Analytics.track({
                eventName: 'Settings Closed',
                properties: {},
              })
            }}>
            <Image src={icBack} alt="back" height={24} width={24} />
          </div>
          <section className="border-monochrome-9 bg-monochrome-white flex-[1] rounded-2xl border p-4 md:flex-[4]">
            <SideBar />
          </section>
          <section className="border-monochrome-9 bg-monochrome-white relative flex-[11] overflow-auto rounded-2xl border md:flex-[8]">
            {props.children}
          </section>
        </section>
      </main>
    </>
  )
}
