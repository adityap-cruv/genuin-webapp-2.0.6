'use client'
import { SettingsLayout } from '@components/layouts/settings/desktop/layout'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AppLayout(props: any) {
  const { isMobile, user } = useGenuinOptions((state) => ({ isMobile: state.isMobile, user: state.user }))
  const router = useRouter()
  useEffect(() => {
    if (!user?.isEmailVerified) {
      router.push(PATH_NAME.home())
    }
  }, [user, router])

  if (user?.isEmailVerified) return isMobile ? props.children : <SettingsLayout>{props.children}</SettingsLayout>
}
