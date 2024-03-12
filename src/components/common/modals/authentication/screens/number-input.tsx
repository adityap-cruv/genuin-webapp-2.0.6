import { PhoneInput } from '@components/ui/phone-input'
import { useState } from 'react'
import { useAuthenticationModalStore } from '../store'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import at_icon from '@icons/Ic@.svg'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

export function NumberInput() {
  const { setStep } = useAuthenticationModalStore()
  const [countryCode, setCountryCode] = useState('+1')
  return (
    <ModalShell>
      <p className="text-heading-3 text-center">Log in to Ted</p>
      <div className="w-full">
        <p className="mb-2 text-body-1-med">Phone</p>
        <PhoneInput
          value={countryCode}
          international
          className="w-full"
          onChange={(value) => {
            setCountryCode(value)
          }}
        />
      </div>
      <Button
        variant="default"
        className="w-full bg-new-off-black hover:bg-new-dark-grey"
        onClick={() => {
          setStep('OTP_INPUT')
        }}>
        <p className="text-title-3-demi">Next</p>
      </Button>
      <p className="text-title-3-demi text-monochrome">OR</p>
      <Button
        variant="outline"
        className="w-full border border-monochrome-9"
        onClick={() => {
          setStep('EMAIL_INPUT')
        }}>
        <div className="relative flex w-full items-center justify-center">
          <img src={at_icon.src} className="absolute left-0 h-5 w-5" alt="at" />
          <p className="text-title-3-demi">Use Email</p>
        </div>
      </Button>
      <p className="text-new-para-2-mobile">
        By registering, you agree to Ted's
        <Link href={PATH_NAME.terms}>
          <span className="text-primary"> Terms of Service </span>
        </Link>
        and
        <Link href={PATH_NAME.privacy}>
          <span className="text-primary"> Privacy</span>
        </Link>
      </p>
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
