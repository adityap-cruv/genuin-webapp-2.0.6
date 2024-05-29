'use client'
import Link from 'next/link'
import { PhoneNumberInput } from './number-input'
import { ConformationMessage, OtpInput, SuccessMessage } from './otp-input'
import { useDeleteAccountStore } from './store'
import { PATH_NAME } from '@lib/utils/constants/path'
import { GenuinIcon } from '@icons/genuin-icon'

export default function MainComponent() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-tertiary-200">
      <nav className="absolute top-0 h-[76px] w-full bg-monochrome-white">
        <div className="flex h-full items-center justify-between px-2 xl:container">
          <Link draggable={false} href={{ pathname: PATH_NAME.home() }}>
            <GenuinIcon.logo className="fill-new-off-black" />
          </Link>
        </div>
      </nav>
      <div className="m-4 w-full rounded-xl bg-monochrome-white p-6 sm:w-[32rem] sm:p-10">
        <RenderingContent />
      </div>
    </div>
  )
}

function RenderingContent() {
  const step = useDeleteAccountStore().step

  switch (step) {
    case 'NUMBER_INPUT':
      return <PhoneNumberInput />
    case 'OTP_INPUT':
      return <OtpInput />
    case 'DELETE_CONFORMATION':
      return <ConformationMessage />
    case 'DELETE_SUCCESS':
      return <SuccessMessage />
  }
}
