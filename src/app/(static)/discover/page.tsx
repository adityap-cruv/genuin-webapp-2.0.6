'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import Mobile from './mobile'
import Desktop from './desktop'

export default function Component() {
  const { isMobile } = useGenuinOptions((state) => ({ isMobile: state.isMobile }))
  return isMobile ? <Mobile /> : <Desktop />
}
