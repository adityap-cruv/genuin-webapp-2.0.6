'use client'
import dynamic from 'next/dynamic'

const Mobile = dynamic(async () => await import('./mobile').then((comp) => comp.Mobile))
const Desktop = dynamic(async () => await import('./desktop').then((comp) => comp.Desktop))

interface CompProps {
  profileData: any
  isMobile: any
}

export function MainComponent({ isMobile, profileData }: CompProps) {
  return <>{isMobile ? <Mobile profileData={profileData} /> : <Desktop profileData={profileData} />}</>
}
