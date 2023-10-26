'use client'
import { Desktop } from './desktop'
import { Mobile } from './mobile'
// All images/icons import

export const MainComponent = ({ isMobile }: { isMobile: boolean }) => {
  console.log('is mobile::', isMobile)
  return isMobile ? <Mobile /> : <Desktop />
}
