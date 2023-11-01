'use client'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
const Desktop = dynamic(async () => await import('./desktop').then((comp) => comp.Desktop), {
  loading: (_) => {
    return (
      <div className="h-[100vh] w-full">
        <Loader size="lg" />
      </div>
    )
  },
})

export const MainComponent = ({ isMobile }: { isMobile: boolean }) => {
  return <Desktop />
}
