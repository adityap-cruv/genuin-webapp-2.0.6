import { cookies } from 'next/headers'

export default function AppLayout(props: any) {
  const isMobile = cookies().get('device_type')?.value === 'mobile'
  return isMobile ? props.mobile : props.desktop
}
