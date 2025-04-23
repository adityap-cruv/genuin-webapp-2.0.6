import { useAuth } from '@/context/auth'
import { AuthenticationModal } from './authentication'
import { Loader } from './loader'
import { Button } from './ui/button'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'
import { CustomAvatar } from './custom-avatar'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { LogoutIcon } from './icons/logout-icon'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { SettingIcon } from './icons/setting-icon'

export function UserTick() {
  const { user, status, signOut } = useAuth()
  const pathName = usePathNameWithSubdomain()
  if (status === 'unauthenticated' || status === 'loading')
    return (
      <Button
        disabled={status === 'loading'}
        className='h-8 gap-2 px-4'
        onClick={() => {
          // @ts-expect-error desc
          if (window.genuinAuth) {
            // @ts-expect-error desc
            window.genuinAuth({ path: '/', action: 'login' })
          } else {
            AuthenticationModal.open()
          }
          return
        }}>
        {status === 'loading' && <Loader className='fill-white' />}
        <p className='min-w-max text-[15px] text-title-3-demi text-white'>
          Log in
        </p>
      </Button>
    )

  if (status === 'authenticated')
    return (
      <Popover>
        <PopoverTrigger>
          <div className='flex rounded-full'>
            <CustomAvatar
              className='h-[40px] w-[40px]'
              fallbackString={user?.name ?? ''}
              imageUrl={user?.image ?? ''}
              isAvatar={Boolean(user?.isAvatar)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          sideOffset={0}
          className='rounded-2xl p-2 shadow-lg'
          side='bottom'
          align='end'>
          <div className='py-2 flex items-center gap-2 border-b border-tertiary-300'>
            <CustomAvatar
              className='h-12 w-12'
              fallbackString={user?.name ?? ''}
              imageUrl={user?.image ?? ''}
              isAvatar={user?.isAvatar ?? false}
            />
            <div>
              <p className='line-clamp-1 break-words break-all text-title-3-bold'>
                {user?.usernameSet
                  ? '@' + user?.nickname
                  : user?.email
                    ? user?.email
                    : formatPhoneNumberIntl(
                        user?.phoneNumber?.startsWith('+')
                          ? user?.phoneNumber
                          : `+${user?.phoneNumber}`,
                      )}
              </p>
            </div>
          </div>
          <div className='flex flex-col pt-1'>
            {!user?.isBrandSystemUser && (
              <CustomLink
                href={pathName.settings('edit')}
                className='flex items-center gap-2 p-2 hover:bg-tertiary-200 rounded-md'>
                <SettingIcon className='h-6 w-6' />
                <p className='text-body-1-demi'>Settings</p>
              </CustomLink>
            )}
            <div
              className='flex items-center cursor-pointer gap-2 p-2 hover:bg-tertiary-200 rounded-md'
              onClick={signOut}>
              <LogoutIcon className='h-6 w-6 stroke-secondary' />
              <p className='cursor-pointer text-body-1-demi'>Log out</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
}
