import { cookies } from 'next/headers'
import '../../globals.css'

export default async function Layout(props: any) {
  const isMobile = (await cookies()).get('device_type')?.value === 'mobile'

  return <>{isMobile ? props.mobile : props.desktop}</>
}
