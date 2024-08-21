import { WalletLayout } from '@/components/layouts/wallet/desktop/layout'
import Desktop from './desktop'
import Mobile from './mobile'

export default function Page() {
  return (
    <div>
      <div className="hidden sm:block">
        <WalletLayout>
          <Desktop />
        </WalletLayout>
      </div>
      <div className="sm:hidden">
        <Mobile />
      </div>
    </div>
  )
}
