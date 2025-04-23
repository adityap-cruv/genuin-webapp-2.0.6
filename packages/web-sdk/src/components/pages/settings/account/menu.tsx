import { AuthenticationModal } from '@/components/authentication'
import { useAuth } from '@/context/auth'
import { useMemo } from 'react'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { ListItem } from '../list-item'

export function AccountMenu() {
  const { user } = useAuth()

  const accountItems = useMemo(
    () => [
      {
        title: 'Username',
        value: user?.nickname ? `@${user.nickname}` : 'Not set',
        onClick: () => AuthenticationModal.open(undefined, 'EDIT_USERNAME'),
      },
      {
        title: 'Email',
        value: user?.email ?? 'Not set',
        onClick: () => AuthenticationModal.open(undefined, 'EDIT_EMAIL'),
      },
      {
        title: 'Phone Number',
        value: user?.phoneNumber
          ? formatPhoneNumberIntl(
              !user.phoneNumber.startsWith('+')
                ? '+' + user.phoneNumber
                : user.phoneNumber,
            )
          : 'Not set',
        onClick: () => AuthenticationModal.open(undefined, 'EDIT_PHONE_NUMBER'),
      },
      {
        title: 'Birthdate',
        value: user?.birth || 'Not set',
        onClick: () => AuthenticationModal.open(undefined, 'EDIT_BIRTHDATE'),
      },
    ],
    [user],
  )

  return (
    <div className='flex flex-col'>
      {accountItems.map((item) => (
        <ListItem
          key={item.title}
          showRightElement
          className='border-b py-4 rounded-none border-tertiary-300'
          {...item}
        />
      ))}
    </div>
  )
}
