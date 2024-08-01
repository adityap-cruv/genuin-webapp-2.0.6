'use client'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useLocalStorage } from '@/lib/stores/local-storage'
import LogRocket from 'logrocket'

export function LogRockerInitializer() {
  if (process.env.NEXT_PUBLIC_CURRENT_ENV === 'local' || process.env.NEXT_PUBLIC_CURRENT_ENV === 'prod') return <></>
  const userId = useLocalStorage((state) => ({ userId: state.userId })).userId
  const { userInfo } = useGenuinOptions((state) => ({ userInfo: state.user }))

  LogRocket.init('4w4vlg/genuin-webapp')
  LogRocket.identify(userId, { ...(userInfo as any) })
  return <></>
}
