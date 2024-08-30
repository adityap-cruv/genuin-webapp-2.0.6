import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'

type WalletAmountBadgeProps = {
  type: 'light' | 'dark'
}

export const WalletAmountBadge: React.FC<WalletAmountBadgeProps> = ({ type }) => {
  const { isWalletEnabled, walletBalance, user } = useGenuinOptions((state) => ({
    isWalletEnabled: state.config?.is_wallet_enabled,
    walletBalance: state.walletBalance,
    user: state.user,
  }))

  return (
    <Link href={{ pathname: PATH_NAME.wallet() }}>
      <div
        className={`w-fit cursor-pointer rounded-full p-2 px-2.5 text-cap-1-med sm:text-title-3-demi ${
          type === 'light'
            ? 'bg-monochrome-black/20 text-monochrome-white'
            : 'border border-tertiary-300 text-monochrome-black'
        } ${(!isWalletEnabled || !user || user.isBrandSystemUser) && 'hidden'}`}
        style={type === 'dark' ? { borderWidth: 1 } : {}}>
        ${walletBalance ? (walletBalance / 100).toFixed(2) : 0}
      </div>
    </Link>
  )
}
