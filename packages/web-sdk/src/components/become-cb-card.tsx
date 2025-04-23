'use client'
// import { AuthenticationModal } from './modals/authentication'
import { AuthenticationModal } from './authentication'
// import CommunityIcon from '@icons/ks-cb-flow/icCommunity.svg'
import { CommunityIcon } from './icons/community-icon'
// import { miniProfile } from '@/lib/api/auth'
// import Analytics from '@/services/analytics'
// import { useSession } from 'next-auth/react'
// import { CustomImage } from '../custom/custom-image'
import { type ComponentProps } from 'react'
import { cn } from '@/utils'
import { useBaseContext } from '@/context/base'

export function BecomeCbCard({
  className,
  style,
  onClick,
  ...restProps
}: ComponentProps<'div'>) {
  const { brandDetails } = useBaseContext()
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
    <div
      className={cn(
        'relative flex w-full max-h-16 rounded-lg border border-primary-200 border-solid bg-primary-200 text-title-3-demi text-black hover:cursor-pointer',
        className,
      )}
      style={{
        background:
          'linear-gradient(30deg, var(--primary-400) -80%, var(--background) 50%, var(--primary-400) 120%)',
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event)
        // if (user?.isEmailVerified) {
        //   handleCommunityBuilderClick()
        // } else {
        AuthenticationModal.open(
          'KS_CB_REQUEST',
          brandDetails?.brand_id?.toString() !== '99'
            ? 'KS_CB_SUBDOMAIN'
            : 'KS_CB_WEB',
        )
        // }
        // AuthenticationModal.open(undefined, 'WALLET_HOW_IT_WORKS')
      }}
      {...restProps}>
      <div className='flex w-full'>
        <div className='z-20 w-3/5'>
          <p className='w-64 overflow-hidden p-3 text-start text-body-1-bold'>
            Become a{' '}
            <span className='font-semibold italic'>Creator &nbsp;</span>
            {'for'} <br />
            <span className='flex items-center gap-1'>
              <span className='line-clamp-1 inline-block overflow-hidden text-primary text-ellipsis whitespace-nowrap'>
                {brandDetails?.name}
              </span>
              &nbsp;🚀
            </span>
          </p>
        </div>
        <div className='z-10 flex w-2/5 items-end justify-center'>
          <CommunityIcon className='w-14 h-14 fill-white stroke-white' />
        </div>
      </div>
    </div>
  )
}
