import { TopBar as MobileTopBar } from '@/components/layouts/mobile/top-bar'
import { cookies } from 'next/headers'
import { EmbedLayout } from '@/components/layouts/desktop/embed-layout'
import { type Metadata } from 'next'

export default async function AppLayout(props: any) {
  const isMobile = (await cookies()).get('device_type')?.value === 'mobile'

  return isMobile ? (
    <main className="h-full w-full overflow-scroll">
      <MobileTopBar />
      <section className="flex h-full w-full px-0 2xl:container xl:px-10 2xl:px-0">{props.children}</section>
    </main>
  ) : (
    <EmbedLayout isCollapsed>{props.children}</EmbedLayout>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}
