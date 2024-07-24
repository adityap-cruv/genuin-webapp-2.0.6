'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { Toaster } from '@components/ui/toaster'
import { useRouter } from 'next/navigation'
import Analytics from '@services/analytics'
export default function Component() {
  const { isMobile, user } = useGenuinOptions((state) => ({ isMobile: state.isMobile, user: state.user }))
  const router = useRouter()
  return (
    <>
      <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
        {isMobile && (
          <Image
            src={icBack}
            alt="back"
            onClick={() => {
              router.back()
              void Analytics.track({
                eventName: 'Settings Closed',
                properties: {},
              })
            }}
          />
        )}
        <p className="text-title-2-bold">Account Settings</p>
        {/* <button type="submit" className="text-title-3-demi text-primary">
          Save
        </button> */}
        <div></div>
      </div>
      {isMobile && <hr className="bg-monochrome-black/10" />}
      <div className={`${isMobile ? 'm-4 my-6' : 'mx-8 my-4'}`}>
        <div
          className="flex justify-between border-b border-tertiary py-4 hover:cursor-pointer"
          onClick={() => {
            AuthenticationModal.open(undefined, 'EDIT_USERNAME')
          }}>
          <p className="text-body-1-demi">Username</p>
          <div className="flex items-center">
            <p className="text-body-1-demi text-tertiary">{user?.nickname}</p>
            <Image src={icBack} alt="back" className="h-5 rotate-180" />
          </div>
        </div>

        <div className="flex justify-between border-b border-tertiary py-4">
          <p className="text-body-1-demi">Email</p>
          <div className="flex items-center">
            <p className="text-body-1-demi text-tertiary">{user?.email}</p>
            {/* <Image src={icBack} alt="back" className="h-5 rotate-180" /> */}
          </div>
        </div>

        {user?.isPasswordSet ? (
          <div
            className="flex justify-between border-b border-monochrome-6 py-4 hover:cursor-pointer"
            onClick={() => {
              AuthenticationModal.open(undefined, 'CHANGE_PASSWORD')
            }}>
            <p className="text-body-1-demi">Change Password</p>
            <Image src={icBack} alt="back" className="h-5 rotate-180" />
          </div>
        ) : (
          <div
            className="flex justify-between border-b border-monochrome-6 py-4 hover:cursor-pointer"
            onClick={() => {
              AuthenticationModal.open(undefined, 'PASSWORD_INPUT')
            }}>
            <p className="text-body-1-demi text-red">Set Password</p>
            <Image src={icBack} alt="back" className="h-5 rotate-180" />
          </div>
        )}
      </div>
      <Toaster />
    </>
  )
}
