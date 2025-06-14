'use client'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { GenuinIcon } from '@icons/genuin-icon'
import { AuthenticationModal } from '@/components/common/modals/authentication'
import { useEffect } from 'react'

export default function MainComponent() {
  useEffect(() => {
    AuthenticationModal.open('DELETE_ACCOUNT', 'STARTER')
  }, [])

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-tertiary-200">
      <nav className="absolute top-0 h-[76px] w-full bg-monochrome-white">
        <div className="flex h-full items-center justify-between px-2 xl:container">
          <Link draggable={false} href={{ pathname: PATH_NAME.home() }}>
            <GenuinIcon.logo className="fill-new-off-black" />
          </Link>
        </div>
      </nav>
    </div>
  )
}
