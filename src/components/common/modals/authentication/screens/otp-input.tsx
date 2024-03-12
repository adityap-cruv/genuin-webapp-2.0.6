import Otp from '@components/ui/otp'
import { useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'

export function OtpInput() {
  const { setStep } = useAuthenticationModalStore()
  const [otp, setOtp] = useState<number>(0)
  return (
    <ModalShell>
      <div className="flex flex-col items-center">
        <p className="mb-2 text-center text-title-3-med text-monochrome">
          Enter the 6-digit code sent to: +1 916 123 4567
        </p>
        <Otp
          length={6}
          otp={otp}
          onOtpChange={(value) => {
            setOtp(value)
          }}
        />
        <p className="mt-4 text-center text-body-1-med text-monochrome">
          Resend code in <span className="text-monochrome-black">00:29</span>
        </p>
      </div>
      <Button variant="default" className="w-full bg-new-off-black hover:bg-new-dark-grey">
        <p className="text-title-3-demi">Verify</p>
      </Button>
      <p className="flex w-full items-center justify-center text-body-1-demi">
        Don't have an account?
        <span
          className="cursor-pointer text-primary"
          onClick={() => {
            setStep('SIGN_UP')
          }}>
          &nbsp;Sign up
        </span>
      </p>
    </ModalShell>
  )
}
