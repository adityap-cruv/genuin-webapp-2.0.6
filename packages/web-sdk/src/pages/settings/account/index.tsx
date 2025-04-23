import { AccountMenu } from '@/components/pages/settings/account/menu'
import { Header } from '@/components/pages/settings/header'

export function AccountPage() {
  return (
    <>
      <Header
        title='Account Settings'
        showSubmitButton={false}
      />
      <div className='p-4'>
        <AccountMenu />
      </div>
    </>
  )
}
