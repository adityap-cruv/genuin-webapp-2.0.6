'use client'

import { isMobile } from 'react-device-detect'
import { Desktop } from './desktop'
import { Mobile } from './mobile'
// All images/icons import

export const MainComponent = () => {
  return isMobile ? <Mobile /> : <Desktop />
}
