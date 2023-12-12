import { cookies } from 'next/headers'

type LayoutProps = {
  mobile: any
  desktop: any
  children: any
}

export default function Layout(props: LayoutProps) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return isMobile ? props.mobile : props.desktop
}
