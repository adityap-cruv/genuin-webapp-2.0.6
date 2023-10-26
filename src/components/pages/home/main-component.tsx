'use client'
import dynamic from 'next/dynamic'
const Desktop = dynamic(() => import('./desktop').then((comp) => comp.Desktop))
const Mobile = dynamic(() => import('./mobile').then((comp) => comp.Mobile))

export const MainComponent = ({ isMobile }: { isMobile: boolean }) => {
  return isMobile ? <Mobile /> : <Desktop />
}
