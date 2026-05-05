import { redirect } from 'next/navigation'
import { type Session } from 'next-auth'

import { PATH_NAME } from '@/lib/utils/constants/path'

import { auth } from '../../../../../auth'

import MainWalletComponent from './main-component'



export default async function Page() {
  const userSession: Session | null = await auth()

  if (userSession === null) {
    redirect(PATH_NAME.home())
  }

  return <MainWalletComponent />
}
