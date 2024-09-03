import { Button } from '@/components/ui/button'
import { ModalShell } from '../authentication/modal-shell'
import WarningIcon from '@icons/wallet/icAlertsWarningTriangle.svg'
import { useAuthenticationModalStore } from '../authentication/store'
import { useShallow } from 'zustand/react/shallow'
import { redeemCouponAPI } from '@/lib/api/wallet'
import { useState } from 'react'
import { Loader } from '@/components/ui/loader'

export function RedeemCredits() {
  const { closeModal } = useAuthenticationModalStore(useShallow((state) => ({ closeModal: state.close })))
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleRedeem() {
    setIsLoading(true)
    const res = await redeemCouponAPI()
    if (res.data.code === 200) {
      closeModal()
      window.open(res.data.data.redeem_link, '_blank')
    } else {
      setErrorMessage(res.data.message)
    }
    setIsLoading(false)
  }
  return (
    <ModalShell>
      <img src={WarningIcon.src} alt="WarningIcon" />
      <p className="text-center text-heading-3 text-secondary">Redeem all credits?</p>
      <p className="text-center text-title-3-med text-secondary">
        This action will transfer all your reward credits to 'Tillo' for redeeming coupons. It cannot be undone.
      </p>
      <div className="flex w-full gap-2">
        <Button
          variant={'custom'}
          className="border-1 w-full border border-primary text-primary"
          onClick={() => {
            closeModal()
          }}>
          Cancel
        </Button>

        <Button
          className="flex w-full items-center justify-center border-0"
          onClick={() => {
            void handleRedeem()
          }}>
          {isLoading ? <Loader size="sm" /> : 'Confirm'}
        </Button>
      </div>
      {errorMessage !== '' && (
        <div>
          <p className="text-supplementary-red">{errorMessage}</p>
        </div>
      )}
    </ModalShell>
  )
}
