'use client'
import dynamic from 'next/dynamic'

const Mobile = dynamic(async () => await import('./mobile').then((comp) => comp.Mobile))
const Desktop = dynamic(async () => await import('./desktop').then((comp) => comp.Desktop))
const NavBar = dynamic(async () => await import('@components/common/nav-bar').then((comp) => comp.NavBar))

interface CompProps {
  profileData: any
  isMobile: any
}

export function MainComponent({ isMobile, profileData }: CompProps) {
  return (
    <>
      <NavBar variant="light" />
      {isMobile ? <Mobile profileData={profileData} /> : <Desktop profileData={profileData} />}
    </>
  )
}
