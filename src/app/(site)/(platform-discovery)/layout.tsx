import { cookies } from 'next/headers'
import { InterruptionProvider } from '@components/providers/interruption-provider'

export default function Layout(props: any) {
  const isMobile = cookies().get('device_type')?.value === 'mobile'

  return (
    <>
      {isMobile ? props.mobile : props.desktop}
      {process.env.NEXT_PUBLIC_CURRENT_ENV !== 'local' && <InterruptionProvider />}
    </>
  )
}
