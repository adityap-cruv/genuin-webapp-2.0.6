'use client'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { DownloadAppDialog } from '@components/pages/home/download-app-dialog'
import { AppLogo } from '@components/ui/app-logo'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useSession, signOut } from 'next-auth/react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { getAvatarUrl } from '@lib/utils'
// import { GenuinIcon } from '@icons/genuin-icon'

export function TopBar() {
  const isEmbed = useGenuinOptions().embed

  return (
    <>
      <div className="z-20 flex w-full justify-center border-b border-monochrome-9  bg-new-off-white sm:flex">
        <nav className="sticky top-0 flex h-[76px] w-full items-center justify-between px-2 xl:container">
          <Link href={{ pathname: PATH_NAME.home() }}>
            <AppLogo.logo className="fill-new-off-black" imageHeight={42} />
            {/* <GenuinIcon.logo className="fill-new-off-black" /> */}
          </Link>
          {!isEmbed && (
            <div className="flex gap-x-3">
              <Link href={{ pathname: PATH_NAME.careers() }}>
                <Button
                  variant="outline"
                  size="custom"
                  className="px-4 py-3 hover:bg-new-off-black hover:text-new-off-white">
                  <p className="text-new-para-2 font-semibold">We're hiring!</p>
                </Button>
              </Link>
              <DownloadAppDialog>
                <Button variant="default" size={'custom'} className="bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
                  <p className="text-new-para-2 font-semibold">Download Genuin</p>
                </Button>
              </DownloadAppDialog>
              <UserTick />
            </div>
          )}
        </nav>
      </div>
    </>
  )
}

function UserTick() {
  const { data, status, update } = useSession()
  console.log('data::', data, status)
  if (status === 'unauthenticated') return <Button onClick={AuthenticationModal.open}>Log in</Button>

  if (status === 'authenticated')
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center rounded-full border border-monochrome-9 p-1">
            <CustomAvatar
              className="h-8 w-8"
              fallbackString={data.user.name ?? ''}
              imageUrl={data.user.image ?? ''}
              isAvatar={data.user.isAvatar}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-2"
              width="14"
              height="12"
              viewBox="0 0 14 12"
              fill="none">
              <path d="M1 1H13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M1 6H13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M1 11H13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </PopoverTrigger>
        <PopoverContent
          sideOffset={-6}
          className=" rounded-2xl p-2 shadow-lg shadow-monochrome-3/40"
          side="bottom"
          align="start">
          <div className="my-2 flex items-center gap-2">
            <CustomAvatar
              className="h-12 w-12"
              fallbackString={data.user.name ?? ''}
              imageUrl={data.user.image ?? ''}
              isAvatar={data.user.isAvatar}
            />
            <div>
              <p className="text-title-3-bold">{data.user.email}</p>
              <p className="text-body-1-demi text-monochrome-6">Send verification email</p>
            </div>
          </div>
          <hr className="border-b border-monochrome-9" />
          <div className="m-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M2.70679 9.60842C3.06013 8.20363 4.1313 6.34222 5.83854 4.93646C7.54578 3.53069 9.70128 2.76471 11.925 2.77351C13.7156 2.78322 15.4663 3.29621 16.9719 4.25235C18.4776 5.20848 19.6758 6.56818 20.4262 8.17208C21.1765 9.77598 21.448 11.5577 21.2088 13.3083C20.9695 15.059 20.2295 16.7061 19.0754 18.0567C17.9212 19.4073 16.4008 20.4054 14.6922 20.934C12.9837 21.4627 11.1578 21.4999 9.42858 21.0415C7.69933 20.583 6.13832 19.6479 4.92852 18.3455C3.71872 17.0432 3.06013 15.93 2.70679 14.5252"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M2.25 12L16.5 12"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 7.5L16.5 12L12 16.5"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p
              className="text-body-1-demi"
              onClick={() => {
                void signOut()
              }}>
              Log out
            </p>
          </div>
        </PopoverContent>
      </Popover>
      // <div onClick={async () => await signOut({ redirect: false })}>lkdfls</div>
    )
}
