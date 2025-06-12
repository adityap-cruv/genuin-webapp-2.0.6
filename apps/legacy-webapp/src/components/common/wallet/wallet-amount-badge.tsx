import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { cn } from '@/lib/utils'
import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'
import { type ComponentProps } from 'react'

type WalletAmountBadgeProps = ComponentProps<'div'> & {
  type: 'light' | 'dark'
}

export const WalletAmountBadge = ({ type, className, ...props }: WalletAmountBadgeProps) => {
  const { isWalletEnabled, walletBalance, user } = useGenuinOptions((state) => ({
    isWalletEnabled: state.config?.is_wallet_enabled,
    walletBalance: state.walletBalance,
    user: state.user,
  }))

  return (
    <Link href={{ pathname: PATH_NAME.wallet() }}>
      <div
        className={cn(
          'w-fit cursor-pointer rounded-full p-2 px-2.5 text-cap-1-med sm:text-title-3-demi',
          type === 'light'
            ? 'bg-monochrome-black/20 text-monochrome-white'
            : 'border border-tertiary-300 text-monochrome-black',
          (!isWalletEnabled || !user || user.isBrandSystemUser) && 'hidden',
          className
        )}
        style={type === 'dark' ? { borderWidth: 1 } : {}}
        {...props}>
        ${walletBalance ? (walletBalance / 100).toFixed(2) : 0}
      </div>
    </Link>
  )
}
