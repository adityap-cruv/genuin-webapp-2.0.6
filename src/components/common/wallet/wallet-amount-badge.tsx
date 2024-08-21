import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'

type WalletAmountBadgeProps = {
  type: 'light' | 'dark'
}

export const WalletAmountBadge: React.FC<WalletAmountBadgeProps> = ({ type }) => {
  return (
    <Link href={{ pathname: PATH_NAME.wallet() }}>
      <div
        className={`w-fit cursor-pointer rounded-full p-2 px-2.5 text-cap-1-med sm:text-title-3-demi ${
          type === 'light'
            ? 'bg-monochrome-black/20 text-monochrome-white'
            : 'border border-tertiary-300 text-monochrome-black'
        }`}
        style={type === 'dark' ? { borderWidth: 1 } : {}}>
        $110.20
      </div>
    </Link>
  )
}
