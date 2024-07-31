'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { Toaster } from '@components/ui/toaster'
import { useRouter } from 'next/navigation'
import Analytics from '@services/analytics'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { formatPhoneNumberIntl } from 'react-phone-number-input'

export default function Component() {
  const { user } = useGenuinOptions(useShallow((state) => ({ user: state.user })))
  const router = useRouter()
  return (
    <>
      <div className="m-4 flex items-center md:mx-8 md:my-4">
        <ChevronLeft
          className="block md:hidden"
          onClick={() => {
            router.back()
            void Analytics.track({
              eventName: 'Settings Closed',
              properties: {},
            })
          }}
        />
        <p className="w-full text-center text-title-2-bold md:text-start">Account Settings</p>
      </div>
      <hr className="block bg-monochrome-black/10 md:hidden" />
      <div className="m-4 my-6 md:mx-4 md:my-4">
        <AccountDetailItem
          title="Username"
          value={user?.nickname ?? ''}
          onClick={() => {
            AuthenticationModal.open(undefined, 'EDIT_USERNAME')
          }}
        />
        <AccountDetailItem
          title="Email"
          value={user?.email ?? ''}
          onClick={() => {
            AuthenticationModal.open(undefined, 'EDIT_EMAIL')
          }}
        />
        <AccountDetailItem
          title="Phone Number"
          value={user?.phoneNumber ? formatPhoneNumberIntl('+' + user.phoneNumber) : 'Not set'}
          onClick={() => {
            AuthenticationModal.open(undefined, 'EDIT_PHONE_NUMBER')
          }}
        />
        <AccountDetailItem
          title="Birthdate"
          value={user?.birth ? user.birth : 'Not set'}
          onClick={() => {
            AuthenticationModal.open(undefined, 'EDIT_BIRTHDATE')
          }}
        />
      </div>
      <Toaster />
    </>
  )
}

type AccountDetailItemProps = { title: string; value: string } & ComponentProps<'div'>

function AccountDetailItem({ title, value, className, ...rest }: AccountDetailItemProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer justify-between rounded-t-lg border-b border-tertiary-300 px-2 py-4 hover:bg-tertiary-100',
        className
      )}
      {...rest}>
      <p className="text-body-1-demi">{title}</p>
      <div className="flex items-center">
        <p className="text-body-1-demi text-tertiary">{value}</p>
        <ChevronRight className="h-6 w-6 stroke-tertiary" />
      </div>
    </div>
  )
}
