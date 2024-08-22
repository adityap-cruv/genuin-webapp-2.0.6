'use client'
import { WalletLayout } from '@/components/layouts/wallet/desktop/layout'
import React, { useEffect } from 'react'
import Desktop from './desktop'
import Mobile from './mobile'
import { useWalletStore } from '@/components/common/wallet/store'
import { getBalanceAPI } from '@/lib/api/wallet'
import { EmptyState } from './empty-state'
import { useSession } from 'next-auth/react'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { useRouter } from 'next/navigation'

const MainWalletComponent = () => {
  const { setWalletDetails, walletDetails } = useWalletStore()
  const router = useRouter()
  const { data } = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push(PATH_NAME.home())
    },
  })

  async function handleBalance() {
    const { wallet } = await getBalanceAPI({ isCurrentBalance: false })
    setWalletDetails(wallet)
  }

  useEffect(() => {
    void handleBalance()
  }, [])

  if (data)
    return (
      <div>
        <div className="hidden sm:block">
          <WalletLayout>{walletDetails.point_balance === 0 ? <EmptyState.desktop /> : <Desktop />}</WalletLayout>
        </div>
        <div className="sm:hidden">{walletDetails.point_balance === 0 ? <EmptyState.mobile /> : <Mobile />}</div>
      </div>
    )
}

export default MainWalletComponent
