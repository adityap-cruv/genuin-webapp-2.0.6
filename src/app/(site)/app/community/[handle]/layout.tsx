import { cookies } from 'next/headers'
import { cn } from '@lib/utils'

interface Props {
  children: React.ReactNode
}

// todo fix navbar for this page.
export default function Layout({ children }: Props) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <main className="absolute left-0 top-0 h-full w-full">
      <section className="h-full w-full">
        <div className={cn('h-full w-full xl:container', !isMobile ? 'overflow-hidden' : '')}>{children}</div>
      </section>
    </main>
  )
}
