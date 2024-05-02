import { cookies } from 'next/headers'

export default function Layout(props: any) {
  const isMobile = cookies().get('device_type')?.value === 'mobile'
  if (isMobile) return props.mobile
  return props.desktop
}
