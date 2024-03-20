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
import { LogoutIcon } from '@icons/logout'
import { BurgerIcon } from '@icons/burger-icon'
import { removeAllAuthToken } from '@lib/api/instance'

export function TopBar() {
  const isEmbed = useGenuinOptions().embed

  return (
    <>
      {/* <div className="h-10 w-full bg-supplementary-red">heldldl</div> */}
      <div className="z-20 flex w-full justify-center border-b border-monochrome-9  bg-new-off-white sm:flex">
        <nav className="sticky top-0 flex h-[76px] w-full items-center justify-between px-2 xl:container">
          <Link href={{ pathname: PATH_NAME.home() }}>
            <AppLogo.logo className="fill-new-off-black" imageHeight={42} />
            {/* <GenuinIcon.logo className="fill-new-off-black" /> */}
          </Link>
          <div className="flex gap-x-3">
            {!isEmbed ? (
              <>
                <Link href={{ pathname: PATH_NAME.careers() }}>
                  <Button
                    variant="outline"
                    size="custom"
                    className="px-4 py-3 hover:bg-new-off-black hover:text-new-off-white">
                    <p className="text-new-para-2 font-semibold">We're hiring!</p>
                  </Button>
                </Link>
                <DownloadAppDialog>
                  <Button
                    variant="default"
                    size={'custom'}
                    className="bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
                    <p className="text-new-para-2 font-semibold">Download Genuin</p>
                  </Button>
                </DownloadAppDialog>
              </>
            ) : (
              <UserTick />
            )}
          </div>
        </nav>
      </div>
    </>
  )
}

function UserTick() {
  const { data, status } = useSession()

  if (status === 'unauthenticated')
    return (
      <Button
        className="px-4 "
        onClick={() => {
          AuthenticationModal.open()
        }}>
        <p className="text-title-3-demi">Log in</p>
      </Button>
    )

  if (status === 'authenticated')
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center gap-x-2 rounded-full border border-monochrome-9 p-1 pr-2">
            <CustomAvatar
              className="h-8 w-8"
              fallbackString={data.user.name ?? ''}
              imageUrl={data.user.image ?? ''}
              isAvatar={data.user.isAvatar}
            />
            <BurgerIcon />
          </div>
        </PopoverTrigger>
        <PopoverContent
          sideOffset={-6}
          className="rounded-2xl p-2 shadow-lg shadow-monochrome-3/40"
          side="bottom"
          align="end">
          <div className="my-2 flex items-center gap-2">
            <CustomAvatar
              className="h-12 w-12"
              fallbackString={data.user.name ?? ''}
              imageUrl={data.user.image ?? ''}
              isAvatar={data.user.isAvatar}
            />
            <div>
              <p className="line-clamp-1 break-words break-all text-title-3-bold">{data.user.email}</p>
              <p className="text-body-1-demi text-monochrome-6">
                {!data.user.isEmailVerified ? 'Send verification email' : 'Complete profile'}
              </p>
            </div>
          </div>
          <hr className="border-b border-monochrome-9" />
          <div className="flex items-center gap-x-2 p-4">
            <LogoutIcon />
            <p
              className="cursor-pointer text-body-1-demi"
              onClick={() => {
                void signOut({ callbackUrl: `${window.location.pathname}${window.location.search}`, redirect: true })
                removeAllAuthToken()
              }}>
              Log out
            </p>
          </div>
        </PopoverContent>
      </Popover>
    )
}
