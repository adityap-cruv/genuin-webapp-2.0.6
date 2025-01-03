'use client'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { AuthenticationModal } from './modals/authentication'
import CommunityIcon from '@icons/ks-cb-flow/icCommunity.svg'
// import { miniProfile } from '@/lib/api/auth'
// import Analytics from '@/services/analytics'
// import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { CustomImage } from '../custom/custom-image'

export default function BecomeCbCard({ className }: { className: string }) {
  const { webCTA, brandName } = useGenuinOptions(
    useShallow((state) => ({
      user: state.user,
      webCTA: state.webCTA,
      brandName: state.config?.name ? state.config?.name : 'Genuin',
    }))
  )
  // const { data: sessionData, update: updateSession } = useSession()

  // TODO: HANDLE THIS CASE AS SOON AS POSSIBLE
  // function handleCommunityBuilderClick() {
  //   void miniProfile(true)
  //     .then((res) => {
  //       if (res.code === 200) {
  //         void updateSession({
  //           ...sessionData,
  //           user: { ...sessionData?.user, ksCbRequestStatus: res.data.ks_cb_request_status } as User,
  //         })
  //         const messageType = res?.data?.ks_cb_request_status === 3 ? 'MINI_PROFILE_SUCCESS' : 'KS_CB_SUBDOMAIN'
  //         AuthenticationModal.open(undefined, messageType)
  //         void Analytics.track({
  //           eventName: 'Become Cb Clicked',
  //           properties: {},
  //         })
  //       } else {
  //         AuthenticationModal.open(undefined, 'KS_CB_SUBDOMAIN')
  //       }
  //     })
  //     .catch(() => {
  //       AuthenticationModal.open(undefined, 'KS_CB_SUBDOMAIN')
  //     })
  // }

  return (
    <div className={cn(className)}>
      <div
        className="max-w-64 relative flex max-h-16 rounded-lg border border-primary-200 bg-primary-200 text-title-3-demi text-monochrome-black hover:cursor-pointer"
        style={{
          background: 'linear-gradient(30deg, var(--primary-400) -80%, #FFFFFF 50%, var(--primary-400) 120%)',
        }}
        onClick={() => {
          // if (user?.isEmailVerified) {
          //   handleCommunityBuilderClick()
          // } else {
          AuthenticationModal.open('KS_CB_REQUEST', webCTA !== 'app' ? 'KS_CB_SUBDOMAIN' : 'KS_CB_WEB')
          // }
          // AuthenticationModal.open(undefined, 'WALLET_HOW_IT_WORKS')
        }}>
        <div className="z-20 w-3/5">
          <p className="w-64 overflow-hidden p-3 text-body-1-bold">
            Become a <span className="font-semibold italic">Creator &nbsp;</span>
            {'for'} <br />
            <span className="flex items-center gap-1 text-primary">
              <span className="line-clamp-1 inline-block overflow-hidden text-ellipsis whitespace-nowrap">
                {brandName}
              </span>
              <span>🚀</span>
            </span>
          </p>
        </div>
        <div className="z-10 flex w-2/5 items-end justify-center">
          <CustomImage height={60} width={60} src={CommunityIcon} alt="community" />
        </div>
      </div>
    </div>
  )
}
