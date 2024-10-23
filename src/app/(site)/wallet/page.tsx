import { auth } from '../../../../auth'
import { type Session } from 'next-auth'
import MainWalletComponent from './main-component'
import { redirect } from 'next/navigation'
import { PATH_NAME } from '@/lib/utils/constants/path'

export default async function Page() {
  const userSession: Session | null = await auth()

  if (userSession === null) {
    redirect(PATH_NAME.home())
  }

  return <MainWalletComponent />
}
