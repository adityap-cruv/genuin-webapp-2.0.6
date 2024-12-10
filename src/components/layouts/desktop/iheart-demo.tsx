'use client'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'

export function IHeartDemo() {
  const { shouldShowIHeartDemo } = useIHeartDemoStates()

  if (!shouldShowIHeartDemo) return
  return (
    <section
      id="iframe-loader"
      className="m-auto w-full overflow-clip px-0  2xl:container  xl:px-10 2xl:px-0"
      style={{ height: '80px' }}>
      <iframe
        allow="autoplay"
        width="100%"
        height="70px"
        src="https://www.iheart.com/live/z100-1469/?embed=true&pname=WHTZ-FM&sc=inferno"
        // frameborder="0"
      ></iframe>
    </section>
  )
}
