import { cookies } from 'next/headers'

export default function AppLayout(props: any) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return isMobile ? props.mobile : props.desktop
}
