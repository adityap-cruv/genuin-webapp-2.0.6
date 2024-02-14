'use client'
import { Desktop } from './desktop'
import { Mobile } from './mobile'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export default function Component() {
  const { isMobile } = useGenuinOptions((state) => ({ isMobile: state.isMobile }))
  return isMobile ? <Mobile /> : <Desktop />
}
